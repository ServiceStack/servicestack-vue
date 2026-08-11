<template>
    <SchemaLookup v-if="lookup" :id="name" :class="span" :label="label" :help="help" :status="status"
                  :prop="prop" :model="model"
                  @update:model-value="$emit('update:modelValue', modelOf($event))" />

    <FileInput v-else-if="isFile" :id="name" :class="span" :label="label" :help="help" :status="status"
               :multiple="isMultiple" :files="isMultiple ? uploadedFiles : undefined"
               :model-value="isMultiple ? undefined : (typeof modelValue === 'string' ? modelValue : '')"
               :accept="accept" />

    <div v-else-if="isComplex" :class="span">
        <!-- rendered bare: an array root brings its own titled panel, an object's fields sit
             flush under the heading — either way the field adds no chrome of its own -->
        <JsonSchemaForm :schema="prop" :model-value="complexValue" :status="scopedStatus"
                        :show-title="prop.type !== 'array'" @change="$emit('update:modelValue', $event)" />
        <p v-if="help" class="mt-2 text-sm text-gray-500">{{ help }}</p>
    </div>

    <div v-else-if="prop.enum" :class="span">
        <SelectInput :id="name" :label="label" :status="status" :entries="entries"
                     :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
        <p v-if="help" class="mt-2 text-sm text-gray-500">{{ help }}</p>
    </div>

    <CheckboxInput v-else-if="prop.type === 'boolean'" :id="name" :class="span" :label="label" :help="help"
                   :status="status"
                   :model-value="!!modelValue" @update:model-value="$emit('update:modelValue', $event)" />

    <TextareaInput v-else-if="isTextarea" :id="name" :class="span" :label="label" :help="help"
                   :status="status" :placeholder="placeholder"
                   :model-value="textValue" @update:model-value="$emit('update:modelValue', $event)" />

    <TagInput v-else-if="prop.type === 'array'" :id="name" :class="span" :label="label" :help="help"
              :status="status"
              :model-value="modelValue ?? []" @update:model-value="$emit('update:modelValue', $event)" />

    <TextInput v-else :id="name" :class="span" :type="type" :label="label" :help="help"
               :status="status" :placeholder="placeholder" v-bind="attrs"
               :model-value="textValue" @update:model-value="$emit('update:modelValue', $event)" /></template>

<script lang="ts">
// @ts-nocheck
import { computed } from 'vue'
import { mapGet } from '@servicestack/client'
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
            if (p.type === 'object' && p.properties) return true
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
        const isMultiple = computed(() => props.prop.type === 'array')

        return {
            isTextarea, lookup, isFile, isMultiple, isComplex, complexValue, scopedStatus,
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
            entries: computed(() => (required.value ? [] : [{ key: '', value: '' }]).concat(
                (props.prop.enum || []).map(x => ({ key: x, value: ui.value.enumDescriptions?.[x] || x })))),
            type: computed(() => {
                if (props.prop.type === 'integer' || props.prop.type === 'number') return 'number'
                if (props.prop.format === 'date-time') return 'datetime-local'
                if (props.prop.format === 'email') return 'email'
                if (props.prop.format === 'uri') return 'url'
                if (ui.value.widget === 'password') return 'password'
                return 'text'
            }),
            attrs: computed(() => {
                const to = {}
                if (props.prop.minimum != null) to.min = props.prop.minimum
                if (props.prop.maximum != null) to.max = props.prop.maximum
                if (ui.value.step != null) to.step = ui.value.step
                if (props.prop.maxLength != null) to.maxlength = props.prop.maxLength
                if (props.prop.pattern) to.pattern = props.prop.pattern
                return to
            }),
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
