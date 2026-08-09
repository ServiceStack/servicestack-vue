<template>
    <div v-if="widget === 'hidden'"></div>

    <!-- array -->
    <div v-else-if="widget === 'array'" :class="panelClass" role="group" :aria-labelledby="id + '-label'">
        <div :class="[headerClass, expanded ? headerBorderClass : '']">
            <button type="button" @click="toggle" class="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300"
                :id="id + '-label'" :aria-expanded="expanded">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 transition-transform flex-shrink-0" :class="{ '-rotate-90': !expanded }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                {{ heading }}<span v-if="required" class="text-red-500">*</span>
            </button>
            <span class="text-xs text-gray-500">{{ items.length }}</span>
            <span v-if="schema.deprecated" class="text-xs italic text-gray-400">deprecated</span>
            <div class="flex-1"></div>
            <button v-if="!readOnly && !tuple" type="button" @click="addItem" :disabled="atMax" :class="smallBtnClass"
                :title="atMax ? 'At most ' + schema.maxItems : 'Add'">+ Add</button>
        </div>
        <div v-if="expanded" class="p-2 space-y-2">
            <!-- fixed positions from prefixItems -->
            <div v-for="(entry, i) in tupleEntries" :key="'t' + i">
                <JsonSchemaNode :schema="entry" :model="items" :field="i" :path="path + '[' + i + ']'"
                    :label="itemLabel(i)" />
            </div>
            <div v-for="i in extraIndexes" :key="'i' + i" class="group flex items-start gap-2">
                <div class="flex-1 min-w-0">
                    <JsonSchemaNode :schema="schema.items" :model="items" :field="i" :path="path + '[' + i + ']'"
                        :label="itemLabel(i)" />
                </div>
                <div v-if="!readOnly" class="flex flex-col opacity-0 group-hover:opacity-100">
                    <button type="button" @click="move(i, -1)" :disabled="i === firstExtra" title="Move up" :class="iconBtnClass">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button type="button" @click="move(i, 1)" :disabled="i === items.length - 1" title="Move down" :class="iconBtnClass">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button type="button" @click="removeItem(i)" :disabled="atMin" title="Remove"
                        class="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
            </div>
            <div v-if="!items.length" class="px-1 py-2 text-xs italic text-gray-500">No entries yet</div>
            <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
    </div>

    <!-- multi select over an enum of values -->
    <div v-else-if="widget === 'checklist'">
        <span class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ heading }}<span v-if="required" class="text-red-500">*</span>
        </span>
        <div class="flex flex-wrap gap-x-4 gap-y-1">
            <label v-for="choice in itemChoices" :key="String(choice.value)" class="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input type="checkbox" :checked="items.includes(choice.value)" :disabled="readOnly"
                    @change="toggleChoice(choice.value, $event.target.checked)"
                    class="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                {{ choice.label }}
            </label>
        </div>
        <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        <p v-else-if="schema.description" class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ schema.description }}</p>
    </div>

    <!-- object -->
    <div v-else-if="widget === 'object'" :class="bare ? '' : panelClass" :role="bare ? null : 'group'"
        :aria-labelledby="bare ? null : id + '-label'">
        <!-- bare still needs the variant picker, which normally lives in the header -->
        <div v-if="bare && variants" class="mb-2 flex justify-end">
            <select :value="variant" @change="setVariant(Number($event.target.value))" :disabled="readOnly"
                class="text-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-0.5">
                <option v-for="(v, i) in variantLabels" :key="i" :value="i">{{ v }}</option>
            </select>
        </div>
        <div v-if="heading && !bare" :class="[headerClass, expanded ? headerBorderClass : '']">
            <button type="button" @click="toggle" class="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300"
                :id="id + '-label'" :aria-expanded="expanded">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-3 transition-transform flex-shrink-0" :class="{ '-rotate-90': !expanded }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                {{ heading }}<span v-if="required" class="text-red-500">*</span>
            </button>
            <span v-if="schema.deprecated" class="text-xs italic text-gray-400">deprecated</span>
            <div class="flex-1"></div>
            <select v-if="variants" :value="variant" @change="setVariant(Number($event.target.value))" :disabled="readOnly"
                class="text-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-0.5">
                <option v-for="(v, i) in variantLabels" :key="i" :value="i">{{ v }}</option>
            </select>
        </div>
        <div v-if="expanded || bare" class="grid grid-cols-1 md:grid-cols-2 gap-2" :class="bare ? '' : 'p-2'">
            <div v-for="prop in properties" :key="prop.key" :class="{ 'md:col-span-2': prop.wide }">
                <div class="flex items-start gap-1">
                    <div class="flex-1 min-w-0">
                        <JsonSchemaNode :schema="prop.schema" :model="container" :field="prop.key"
                            :path="childPath(prop.key)" :label="prop.label" :required="isRequired(prop.key)" />
                    </div>
                    <button v-if="prop.removable && !readOnly" type="button" @click="removeKey(prop.key)" :title="'Remove ' + prop.key"
                        class="mt-4 p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
            </div>
            <div v-if="!properties.length && !allowsNewKeys" class="md:col-span-2 px-1 py-2 text-xs italic text-gray-500">No fields</div>
            <div v-if="allowsNewKeys && !readOnly" class="md:col-span-2 flex items-center gap-2">
                <input v-model="newKey" type="text" placeholder="New property" @keyup.enter="addKey"
                    class="px-2 py-1 text-xs rounded-md shadow-sm border-gray-300 dark:border-gray-600 dark:text-white dark:bg-gray-900" />
                <button type="button" @click="addKey" :disabled="!newKey.trim()" :class="smallBtnClass">Add</button>
            </div>
            <p v-if="error" class="md:col-span-2 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
    </div>

    <!-- checkbox -->
    <div v-else-if="widget === 'checkbox'">
        <label class="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <input type="checkbox" :checked="!!value" :disabled="readOnly" @change="setValue($event.target.checked)"
                :aria-invalid="!!error" :aria-describedby="describedBy"
                class="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
            {{ heading }}<span v-if="required" class="text-red-500">*</span>
        </label>
        <p v-if="error" :id="id + '-err'" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        <p v-else-if="schema.description" :id="id + '-help'" class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ schema.description }}</p>
    </div>

    <!-- radio group -->
    <div v-else-if="widget === 'radio'">
        <span class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ heading }}<span v-if="required" class="text-red-500">*</span>
        </span>
        <div class="flex flex-wrap gap-x-4 gap-y-1">
            <label v-for="choice in choices" :key="String(choice.value)" class="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input type="radio" :name="id" :value="String(choice.value)" :checked="value === choice.value" :disabled="readOnly"
                    @change="setValue(choice.value)" class="border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                {{ choice.label }}
            </label>
        </div>
        <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        <p v-else-if="schema.description" class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ schema.description }}</p>
    </div>

    <!-- leaf -->
    <div v-else>
        <label v-if="heading" :for="id" class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
            :class="{ 'italic opacity-70': schema.deprecated }">
            {{ heading }}<span v-if="required" class="text-red-500">*</span>
        </label>

        <select v-if="widget === 'select'" :id="id" :value="String(value)" :disabled="readOnly || fixed"
            @change="setValue(coerce($event.target.value))" :aria-invalid="!!error" :aria-describedby="describedBy"
            :class="error ? errorClass : inputClass">
            <option v-if="nullable" :value="String(null)">(none)</option>
            <option v-for="choice in choices" :key="String(choice.value)" :value="String(choice.value)">{{ choice.label }}</option>
        </select>

        <input v-else-if="widget === 'number'" :id="id" type="number" :step="step" :min="schema.minimum ?? schema.exclusiveMinimum"
            :max="schema.maximum ?? schema.exclusiveMaximum" :value="value" :disabled="readOnly"
            @input="setValue($event.target.value === '' ? null : Number($event.target.value))"
            :aria-invalid="!!error" :aria-describedby="describedBy" :class="error ? errorClass : inputClass" />

        <textarea v-else-if="widget === 'textarea'" :id="id" :value="value ?? ''" :disabled="readOnly" rows="3" spellcheck="false"
            :maxlength="schema.maxLength" @input="setValue($event.target.value)"
            :aria-invalid="!!error" :aria-describedby="describedBy" :class="[error ? errorClass : inputClass, 'resize-y']"></textarea>

        <input v-else :id="id" :type="inputType" :value="value ?? ''" :disabled="readOnly"
            :placeholder="schema.examples?.[0] ?? schema.placeholder ?? ''"
            :minlength="schema.minLength" :maxlength="schema.maxLength" :pattern="schema.pattern"
            @input="setValue($event.target.value)" :aria-invalid="!!error" :aria-describedby="describedBy"
            :class="error ? errorClass : inputClass" />

        <p v-if="error" :id="id + '-err'" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        <p v-else-if="schema.description" :id="id + '-help'" class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ schema.description }}</p>
    </div></template>

<script lang="ts">
// @ts-nocheck
import { computed, ref, watchEffect, inject } from 'vue'
import { humanize } from '@servicestack/client'
import {
    CONTEXT, isPlainObject, resolveSchema, typeOf, isNullable, choicesOf, variantsOf,
    bestVariant, blankFor, widgetOf, fieldError, normalizePath, INPUT_TYPES,
} from './jsonSchema'

// ---------------------------------------------------------------------------- styles

const INPUT_CLASS =
    'block w-full sm:text-sm rounded-md shadow-sm border-gray-300 dark:border-gray-600 dark:text-white ' +
    'dark:bg-gray-900 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 ' +
    'disabled:text-slate-500'
const INPUT_ERROR_CLASS =
    'block w-full sm:text-sm rounded-md shadow-sm border-red-500 text-red-900 dark:text-red-200 ' +
    'dark:bg-gray-900 focus:border-red-500 focus:ring-red-500'
const PANEL_CLASS = 'rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden'
const PANEL_HEADER_CLASS = 'flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/50'
// only divides the header from content that's actually there - a collapsed panel would otherwise
// draw this on top of the panel's own bottom border
const PANEL_HEADER_BORDER_CLASS = 'border-b border-gray-200 dark:border-gray-700'
const SMALL_BTN_CLASS =
    'px-2 py-0.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 ' +
    'hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40'
const ICON_BTN_CLASS = 'p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40'

const CHEVRON =
    '<svg xmlns="http://www.w3.org/2000/svg" class="size-3 transition-transform flex-shrink-0" :class="{ \'-rotate-90\': !expanded }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>'

const JsonSchemaNode = {
    name: 'JsonSchemaNode',
        props: {
        schema: { type: Object, default: () => ({}) },
        model: { type: [Object, Array], required: true },
        field: { type: [String, Number], required: true },
        path: { type: String, default: '' },
        label: { type: String, default: '' },
        required: { type: Boolean, default: false },
        /** render the object's fields without the surrounding panel, header and collapse toggle */
        bare: { type: Boolean, default: false },
    },
    setup(props) {
        const ctx = inject(CONTEXT)
        const root = ctx.root
        const newKey = ref('')

        const value = computed(() => props.model[props.field])
        const base = computed(() => resolveSchema(props.schema, root.value))
        const variants = computed(() => variantsOf(base.value))
        const variant = ref(0)
        const schema = computed(() => {
            if (!variants.value) return base.value
            const { oneOf, anyOf, ...rest } = base.value
            return { ...rest, ...resolveSchema(variants.value[variant.value], root.value) }
        })
        watchEffect(() => {
            if (variants.value) variant.value = bestVariant(variants.value, value.value, root.value)
        })

        const widget = computed(() => {
            const w = widgetOf(schema.value, value.value)
            if (w === 'array' && itemChoices.value && schema.value['x-widget'] !== 'list') return 'checklist'
            return w
        })
        const choices = computed(() => choicesOf(schema.value))
        const itemChoices = computed(() =>
            typeOf(schema.value) === 'array' && schema.value.items ? choicesOf(resolveSchema(schema.value.items, root.value)) : null,
        )
        const heading = computed(() => props.label || schema.value.title || '')
        const readOnly = computed(() => ctx.readOnly.value || !!schema.value.readOnly)
        const error = computed(() => fieldError(ctx.status.value, props.path, ctx.leafCounts.value))
        const id = computed(() => 'f-' + (normalizePath(props.path).replace(/\./g, '-') || 'root'))
        const missing = computed(() => value.value === undefined || value.value === null)
        const expanded = ref(!missing.value && !schema.value['x-collapsed'])

        // containers are only created in the data once opened, so rendering never dirties the model
        // and recursive schemas stop unfolding until the user asks for the next level
        watchEffect(() => {
            // a bare object has no toggle, so it's always materialised
            if (!expanded.value && !props.bare) return
            const current = props.model[props.field]
            if (widget.value === 'array' && !Array.isArray(current)) props.model[props.field] = blankFor(schema.value, root.value)
            else if (widget.value === 'object' && !isPlainObject(current)) props.model[props.field] = blankFor(schema.value, root.value)
        })

        const items = computed(() => (Array.isArray(value.value) ? value.value : []))
        const container = computed(() => (isPlainObject(value.value) ? value.value : {}))
        const tuple = computed(() => schema.value.prefixItems ?? (Array.isArray(schema.value.items) ? schema.value.items : null))
        const tupleEntries = computed(() => tuple.value ?? [])
        const firstExtra = computed(() => tupleEntries.value.length)
        const extraIndexes = computed(() =>
            items.value.map((_, i) => i).filter(i => i >= firstExtra.value),
        )
        const atMax = computed(() => schema.value.maxItems != null && items.value.length >= schema.value.maxItems)
        const atMin = computed(() => schema.value.minItems != null && items.value.length <= schema.value.minItems)

        const allowsNewKeys = computed(() => {
            const extra = schema.value.additionalProperties
            return extra === undefined ? !schema.value.properties : extra !== false
        })

        const properties = computed(() => {
            if (widget.value !== 'object') return []
            const declared = Object.entries(schema.value.properties ?? {})
            const extra = Object.keys(container.value)
                .filter(k => !schema.value.properties?.[k])
                .map(k => [k, isPlainObject(schema.value.additionalProperties) ? schema.value.additionalProperties : {}])
            return [...declared, ...extra]
                .map(([key, propSchema]) => {
                    const s = resolveSchema(propSchema, root.value)
                    const type = typeOf(s, container.value[key])
                    const declaredProp = !!schema.value.properties?.[key]
                    return {
                        key,
                        schema: propSchema,
                        order: s['x-order'] ?? 0,
                        // additionalProperties keys are data, not identifiers - show them verbatim
                        label: s.title || (declaredProp ? humanize(key) : key),
                        wide: type === 'object' || type === 'array' || s.format === 'textarea' || s['x-widget'] === 'textarea',
                        removable: !schema.value.properties?.[key],
                        hidden: s['x-widget'] === 'hidden',
                    }
                })
                .filter(p => !p.hidden)
                .sort((a, b) => a.order - b.order)
        })

        function setValue(v) {
            props.model[props.field] = v
            ctx.onChange()
        }
        function ensureArray() {
            if (!Array.isArray(props.model[props.field])) props.model[props.field] = []
            return props.model[props.field]
        }

        return {
            newKey, value, schema, widget, choices, itemChoices, heading, readOnly, error, id, expanded,
            items, container, properties, allowsNewKeys, tuple, tupleEntries, extraIndexes, firstExtra,
            atMax, atMin, variants,
            variant,
            variantLabels: computed(() =>
                (variants.value ?? []).map((b, i) => resolveSchema(b, root.value).title ?? `Option ${i + 1}`),
            ),
            nullable: computed(() => isNullable(schema.value)),
            fixed: computed(() => schema.value.const !== undefined),
            step: computed(() => (typeOf(schema.value) === 'integer' ? 1 : (schema.value.multipleOf ?? 'any'))),
            inputType: computed(() => INPUT_TYPES[schema.value.format] ?? 'text'),
            describedBy: computed(() => (error.value ? `${id.value}-err` : schema.value.description ? `${id.value}-help` : undefined)),
            panelClass: PANEL_CLASS,
            headerClass: PANEL_HEADER_CLASS,
            headerBorderClass: PANEL_HEADER_BORDER_CLASS,
            smallBtnClass: SMALL_BTN_CLASS,
            iconBtnClass: ICON_BTN_CLASS,
            inputClass: INPUT_CLASS,
            errorClass: INPUT_ERROR_CLASS,
            isRequired: key => (schema.value.required ?? []).includes(key),
            childPath: key => (props.path ? `${props.path}.${key}` : key),
            toggle: () => (expanded.value = !expanded.value),
            itemLabel(i) {
                const fixedEntry = tuple.value?.[i]
                if (fixedEntry) return resolveSchema(fixedEntry, root.value).title ?? `#${i + 1}`
                const itemSchema = resolveSchema(schema.value.items, root.value)
                const titleKey = itemSchema['x-titleKey']
                const item = items.value[i]
                if (titleKey && isPlainObject(item) && item[titleKey]) return `${i + 1}. ${item[titleKey]}`
                if (itemSchema.title) return `${itemSchema.title} ${i + 1}`
                return isPlainObject(item) ? `${props.label || 'Item'} ${i + 1}` : ''
            },
            setVariant(i) {
                variant.value = i
                const next = resolveSchema(variants.value[i], root.value)
                const keep = isPlainObject(value.value) ? value.value : {}
                const merged = blankFor(next, root.value)
                if (isPlainObject(merged)) {
                    for (const key of Object.keys(merged)) {
                        const fixedByBranch = resolveSchema(next.properties?.[key], root.value).const !== undefined
                        if (!fixedByBranch && keep[key] !== undefined) merged[key] = keep[key]
                    }
                }
                setValue(merged)
            },
            coerce(raw) {
                if (raw === String(null)) return null
                const match = choices.value?.find(c => String(c.value) === raw)
                return match ? match.value : raw
            },
            setValue,
            toggleChoice(choice, on) {
                const list = ensureArray()
                const i = list.indexOf(choice)
                if (on && i === -1) list.push(choice)
                else if (!on && i !== -1) list.splice(i, 1)
                ctx.onChange()
            },
            addItem() {
                ensureArray().push(blankFor(schema.value.items, root.value))
                expanded.value = true
                ctx.onChange()
            },
            removeItem(i) {
                props.model[props.field].splice(i, 1)
                ctx.onChange()
            },
            move(i, by) {
                const list = props.model[props.field]
                const to = i + by
                if (to < firstExtra.value || to >= list.length) return
                list.splice(to, 0, list.splice(i, 1)[0])
                ctx.onChange()
            },
            addKey() {
                const key = newKey.value.trim()
                if (!key) return
                const extra = schema.value.additionalProperties
                container.value[key] = isPlainObject(extra) ? blankFor(extra, root.value) : ''
                newKey.value = ''
                ctx.onChange()
            },
            removeKey(key) {
                delete container.value[key]
                ctx.onChange()
            },
        }
    },
}


export default JsonSchemaNode
</script>
