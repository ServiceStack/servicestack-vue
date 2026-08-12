<template>
    <input v-if="widget === 'hidden'" type="hidden" :id="name" :name="name" :value="modelValue ?? prop.default ?? ''" />

    <SchemaLookup v-else-if="lookup" :id="name" :class="span" :label="label" :help="help" :status="status"
                  :prop="prop" :model="model"
                  @update:model-value="$emit('update:modelValue', modelOf($event))" />

    <FileInput v-else-if="isFile" :id="name" :class="span" :label="label" :help="help" :status="status"
               :multiple="isMultiple" :files="isMultiple ? uploadedFiles : undefined"
               :model-value="isMultiple ? undefined : (typeof modelValue === 'string' ? modelValue : '')"
               :accept="accept" v-bind="componentAttrs" />

    <div v-else-if="isComplex" :class="span">
        <!-- rendered bare: an array root brings its own titled panel, an object's fields sit
             flush under the heading — either way the field adds no chrome of its own -->
        <JsonSchemaForm :schema="prop" :model-value="complexValue" :status="scopedStatus"
                        :show-title="prop.type !== 'array'" @change="$emit('update:modelValue', $event)" />
        <p v-if="help" class="mt-2 text-sm text-gray-500">{{ help }}</p>
    </div>

    <Component v-else-if="dynamicComponent" :is="dynamicComponent" :id="name" :class="span"
               :label="label" :help="help" :status="status" v-bind="componentAttrs"
               :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />

    <TagInput v-else-if="widget === 'tag'" :id="name" :class="span" :label="label" :help="help"
              :status="status" :allowable-values="allowableValues" :string="prop.type === 'string'"
              v-bind="componentAttrs"
              :model-value="modelValue ?? (prop.type === 'array' ? [] : '')"
              @update:model-value="$emit('update:modelValue', $event)" />

    <Combobox v-else-if="widget === 'combobox'" :id="name" :class="span" :label="label" :help="help"
              :status="status" :values="allowableValues" :entries="allowableEntries" :options="selectOptions"
              :multiple="isMultiple" v-bind="componentAttrs"
              :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />

    <MarkdownInput v-else-if="widget === 'markdowninput'" :id="name" :class="span" :label="label" :help="help"
                   :status="status" :placeholder="placeholder" v-bind="componentAttrs"
                   :model-value="textValue" @update:model-value="$emit('update:modelValue', $event)" />

    <div v-else-if="widget === 'select' || prop.enum" :class="span">
        <SelectInput :id="name" :label="label" :status="status" :entries="entries"
                     v-bind="componentAttrs"
                     :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
        <p v-if="help" class="mt-2 text-sm text-gray-500">{{ help }}</p>
    </div>

    <CheckboxInput v-else-if="prop.type === 'boolean'" :id="name" :class="span" :label="label" :help="help"
                   :status="status" v-bind="componentAttrs"
                   :model-value="!!modelValue" @update:model-value="$emit('update:modelValue', $event)" />

    <TextareaInput v-else-if="isTextarea" :id="name" :class="span" :label="label" :help="help"
                   :status="status" :placeholder="placeholder" v-bind="componentAttrs"
                   :model-value="textValue" @update:model-value="$emit('update:modelValue', $event)" />

    <TagInput v-else-if="prop.type === 'array'" :id="name" :class="span" :label="label" :help="help"
              :status="status" v-bind="componentAttrs"
              :model-value="modelValue ?? []" @update:model-value="$emit('update:modelValue', $event)" />

    <TextInput v-else :id="name" :class="span" :type="type" :label="label" :help="help"
               :status="status" :placeholder="placeholder" v-bind="componentAttrs"
               :model-value="textValue" @update:model-value="$emit('update:modelValue', $event)" /></template>

<script lang="ts">
// @ts-nocheck
import { computed } from 'vue'
import { mapGet } from '@servicestack/client'
import { Sole } from '../../use/config'
import { scopedExpr } from '../../use/utils'
import JsonSchemaForm from './JsonSchemaForm.vue'
import SchemaLookup from './SchemaLookup.vue'

/** Re-key data to the property names the schema declares, matching case-insensitively */
function toSchemaCase(value, schema) {
    if (Array.isArray(value)) return value.map(x => toSchemaCase(x, schema?.items))
    if (!value || typeof value !== 'object' || !schema?.properties) return value

    const names = Object.keys(schema.properties)
    const to = {}
    for (const [key, item] of Object.entries(value)) {
        const name = names.find(x => x.toLowerCase() === key.toLowerCase()) ?? key
        to[name] = toSchemaCase(item, schema.properties[name])
    }
    return to
}


const SchemaInput = {
    components: { JsonSchemaForm, SchemaLookup },
    props: {
        name: String, prop: Object, schema: Object,
        status: { type: Object, default: null },
        spanClass: { type: String, default: null },
        model: { type: Object, default: null },   // whole form model, for LookupInput
        modelValue: { default: undefined },
    },
    emits: ['update:modelValue'],
        setup(props) {
        const ui = computed(() => props.prop.ui || {})
        const widgetName = computed(() => String(ui.value.widget || ''))
        const widget = computed(() => widgetName.value.toLowerCase())
        const required = computed(() => (props.schema?.required || []).includes(props.name))
        const isTextarea = computed(() => ui.value.widget === 'textarea' || props.prop.type === 'object')

        // SchemaLookup resolves the referenced row from the ref Model's own schema
        const lookup = computed(() => !!props.model && !!ui.value.ref && props.prop.type !== 'object')

        const isFile = computed(() => ui.value.widget === 'file')
        // the accepted extensions now travel with the property, from its [UploadTo] location

        // A nested object, or a list of them (e.g. Player.PhoneNumbers), is a whole
        // sub-form rather than a single input — JsonSchemaForm already renders those
        const isComplex = computed(() => {
            const p = props.prop
            if (p.type === 'object' && (p.properties || p.additionalProperties)) return true
            return p.type === 'array' && p.items?.type === 'object' && !!p.items.properties
        })

        // JsonSchemaForm edits in place, so it needs one stable object to mutate. It's also
        // re-keyed to the schema's casing: the schema names properties as the C# DTO does
        // (Number) while the API sends camelCase (number), and without this the form renders
        // both — the schema's fields empty, and the data's as free-form additionalProperties.
        let cached = null, source
        const complexValue = computed(() => {
            const value = props.modelValue
            // rebuild only for a genuinely new source, not for the copy we emitted ourselves
            if (value !== source && value !== cached) {
                source = value
                cached = value != null
                    ? toSchemaCase(value, props.prop)
                    : (props.prop.type === 'array' ? [] : {})
            }
            return cached
        })

        // Its field paths are relative to the property, so re-root the server's
        // `PhoneNumbers[0].Number` as `[0].Number` before handing the errors down
        const scopedStatus = computed(() => {
            const prefix = props.name.toLowerCase()
            const errors = (props.status?.errors ?? [])
                .filter(e => String(e.fieldName ?? '').toLowerCase().startsWith(prefix))
                .map(e => ({ ...e, fieldName: e.fieldName.slice(props.name.length) }))
            return errors.length ? { errors } : null
        })
        // a file property that holds a collection (e.g. JobApplication.Attachments) takes many files
        const isMultiple = computed(() => ui.value.multiple === true || props.prop.type === 'array')
        const resolvedOptions = computed(() => {
            if (!ui.value.options) return {}
            try {
                return scopedExpr(ui.value.options, {
                    input: props.prop,
                    $typeFields: Object.keys(props.schema?.properties || {}),
                    $dataModelFields: props.schema?.ui?.dataModelFields || [],
                    ...Sole.config.scopeWhitelist,
                }) || {}
            } catch (e) {
                console.error(`failed to evaluate '${ui.value.options}'`)
                return {}
            }
        })
        const inputAttrs = computed(() => {
            const to = {}
            if (props.prop.minimum != null) to.min = props.prop.minimum
            if (props.prop.maximum != null) to.max = props.prop.maximum
            if (ui.value.step != null) to.step = ui.value.step
            if (props.prop.maxLength != null) to.maxlength = props.prop.maxLength
            if (props.prop.pattern) to.pattern = props.prop.pattern
            if (props.prop.readOnly) to.readonly = true
            if (props.prop.minLength != null) to.minlength = props.prop.minLength
            if (required.value) to.required = true
            return to
        })
        const selectEntries = computed(() => {
            const values = resolvedOptions.value.allowableEntries || ui.value.allowableEntries
                || (resolvedOptions.value.allowableValues || props.prop.enum || [])
                    .map(x => ({ key: x, value: ui.value.enumDescriptions?.[x] || x }))
            return (required.value ? [] : [{ key: '', value: '' }]).concat(values)
        })

        return {
            isTextarea, lookup, isFile, isMultiple, isComplex, complexValue, scopedStatus,
            widget,
            dynamicComponent: computed(() => Sole.component(widgetName.value)),
            allowableValues: computed(() => resolvedOptions.value.allowableValues || props.prop.enum || []),
            allowableEntries: computed(() => resolvedOptions.value.allowableEntries || ui.value.allowableEntries),
            selectOptions: computed(() => resolvedOptions.value.options),
            componentAttrs: computed(() => {
                const { widget, ref, help, placeholder, fieldCss, inputCss, labelCss, accept, enumDescriptions,
                    allowableEntries, options, ...uiAttrs } = ui.value
                return { ...inputAttrs.value, ...uiAttrs, ...resolvedOptions.value,
                    inputClass: inputCss, labelClass: labelCss, placeholder: placeholder ?? undefined }
            }),
            accept: computed(() => ui.value.accept),
            // already the { fileName, filePath, contentType, contentLength } shape FileInput wants
            uploadedFiles: computed(() => Array.isArray(props.modelValue) ? props.modelValue : []),
            // LookupInput mutates the model in place and emits it, so pull our value back out
            modelOf: model => mapGet(model, props.name),
            label: computed(() => (props.prop.title || props.name) + (required.value ? ' *' : '')),
            help: computed(() => ui.value.help),
            placeholder: computed(() => ui.value.placeholder),
            span: computed(() => props.spanClass
                ?? (isComplex.value || isTextarea.value || ui.value.fieldCss?.includes('col-span-12')
                    ? 'col-span-12'
                    : 'col-span-12 sm:col-span-6 3xl:col-span-4')),
            // SelectInput has no empty option of its own, so optional enums need one to be unset
            entries: selectEntries,
            type: computed(() => {
                if (props.prop.type === 'integer' || props.prop.type === 'number') return 'number'
                if (props.prop.format === 'date-time') return 'datetime-local'
                if (props.prop.format === 'email') return 'email'
                if (props.prop.format === 'uri') return 'url'
                if (ui.value.widget === 'password') return 'password'
                return 'text'
            }),
            attrs: inputAttrs,
            textValue: computed(() => {
                const v = props.modelValue
                if (v == null) return ''
                if (props.prop.type === 'object') return JSON.stringify(v, null, 2)
                if (props.prop.format === 'date-time') return String(v).slice(0, 16)
                return v
            }),
        }
    }
}


export default SchemaInput
</script>
