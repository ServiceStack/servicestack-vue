<template>
    <div>
        <p v-if="schemaError" class="px-2 py-1.5 text-xs rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200">{{ schemaError }}</p>
        <template v-else>
            <!-- with a wrapper the panel header carries the title, so don't print it twice -->
            <h3 v-if="resolvedSchema.title && showTitle && !wrapper" class="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ resolvedSchema.title }}</h3>
            <p v-if="resolvedSchema.description && showTitle" class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ resolvedSchema.description }}</p>
            <p v-if="summary" class="mb-3 px-2 py-1.5 text-xs rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200">{{ summary }}</p>
            <JsonSchemaNode :schema="resolvedSchema" :model="rootModel" field="root" :path="''" :label="''" :bare="!wrapper" />
        </template>
    </div></template>

<script lang="ts">
// @ts-nocheck
import { computed, reactive, ref, provide, useSlots, watch } from 'vue'
import JsonSchemaNode from './JsonSchemaNode.vue'
import { CONTEXT, leafNameCounts, validateValue } from './jsonSchema'
export * from './jsonSchema'
export { JsonSchemaNode }

export const JsonSchemaForm = {
    name: 'JsonSchemaForm',
    components: { JsonSchemaNode },
        props: {
        schema: { type: Object, default: null },
        modelValue: { default: undefined },
        /** alias for modelValue, for `:data` style usage */
        data: { default: undefined },
        status: { type: Object, default: null },
        readOnly: { type: Boolean, default: false },
        showTitle: { type: Boolean, default: true },
        /** wrap the whole form in the same collapsible panel nested objects get (off by default) */
        wrapper: { type: Boolean, default: false },
        validateOn: { type: String, default: 'submit' }, // 'submit' | 'change'
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit, expose }) {
        const slots = useSlots()
        const schemaError = ref('')
        const clientStatus = ref(null)

        /** the schema may be given as a prop or pasted as the component's body */
        const resolvedSchema = computed(() => {
            if (props.schema) {
                schemaError.value = ''
                return props.schema
            }
            const text = slotText(slots)
            if (!text) {
                schemaError.value = 'No schema: pass :schema or put one in the component body'
                return {}
            }
            try {
                schemaError.value = ''
                return JSON.parse(text)
            } catch (e) {
                schemaError.value = `Schema isn't valid JSON: ${e.message}`
                return {}
            }
        })

        const value = computed(() => props.modelValue ?? props.data ?? {})
        // Keep one writable root container. A computed `{ root: value }` wrapper loses a root
        // array/object assigned by JsonSchemaNode before the parent has echoed the change back,
        // which made the first +Add on an asynchronously populated form appear to do nothing.
        const rootModel = reactive({ root: value.value })
        watch(value, next => {
            if (next !== rootModel.root) rootModel.root = next
        })
        const status = computed(() => props.status ?? clientStatus.value)
        const leafCounts = computed(() => leafNameCounts(resolvedSchema.value))

        function onChange() {
            if (props.validateOn === 'change') clientStatus.value = validate()
            else if (clientStatus.value) clientStatus.value = validate()
            emit('update:modelValue', rootModel.root)
            emit('change', rootModel.root)
        }

        function validate() {
            const errors = validateValue(resolvedSchema.value, rootModel.root, resolvedSchema.value)
            if (!errors.length) return null
            return {
                errorCode: 'ValidationException',
                message: errors.length === 1 ? errors[0].message : `${errors.length} fields need attention`,
                errors,
            }
        }

        provide(CONTEXT, {
            root: resolvedSchema,
            status,
            leafCounts,
            readOnly: computed(() => props.readOnly),
            onChange,
        })

        expose({
            validate: () => (clientStatus.value = validate()),
            reset: () => (clientStatus.value = null),
        })

        return {
            resolvedSchema,
            schemaError,
            rootModel,
            /** the status message, or any field error naming something this schema doesn't render */
            summary: computed(() => {
                const s = status.value
                if (!s) return null
                const errors = s.errors ?? s.Errors ?? []
                if (!errors.length) return s.message ?? s.errorCode ?? null
                const known = leafCounts.value
                const orphan = errors.find(e => {
                    const name = String(e.fieldName ?? e.FieldName ?? '').split(/[.[]/).pop().replace(']', '')
                    return name && !known.has(name.toLowerCase())
                })
                return orphan ? (orphan.message ?? orphan.errorCode) : null
            }),
        }
    },
}

/** Concatenate the text of the default slot, so a schema can be pasted into the component body */
function slotText(slots) {
    const out = []
    const walk = nodes => {
        for (const node of nodes ?? []) {
            if (typeof node.children === 'string') out.push(node.children)
            else if (Array.isArray(node.children)) walk(node.children)
        }
    }
    try {
        walk(slots.default?.())
    } catch {
        return ''
    }
    return out.join('').trim()
}

export default JsonSchemaForm
</script>
