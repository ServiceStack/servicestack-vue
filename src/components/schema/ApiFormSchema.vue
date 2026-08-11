<template>
<div>
    <!-- request form -->
    <form ref="form" @submit.prevent="execute" @keydown.enter="onFormEnter" class="min-w-0">
        <ErrorSummary v-if="error" :status="error" :except="boundFields" class="mb-4" />

        <div v-if="fields.length" class="grid grid-cols-12 gap-4">
            <SchemaInput v-for="f in fields" :key="f.name" :name="f.name" :prop="f.prop"
                         :schema="schema" :status="error" :model-value="data[f.name]"
                         @update:model-value="data[f.name] = $event" />
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400">
            This API takes no parameters — just run it.
        </p>

        <div class="mt-5 flex items-center gap-3">
            <PrimaryButton type="submit" :disabled="loading">
                {{ loading ? 'Running…' : (schema.ui?.submitLabel || 'Execute') }}
            </PrimaryButton>
            <SecondaryButton type="button" @click="reset" :disabled="loading">Reset</SecondaryButton>
            <button v-if="requiresApiKey && !apiKey" type="button" @click="showApiKeyDialog = true"
                    class="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
                <span>Add API Key</span>
            </button>
            <span v-if="!canCall" class="text-xs text-amber-600 dark:text-amber-400">
                You don't have access to call this — it will fail with 401/403
            </span>
        </div>
        <slot :request-text="requestText" :curl="curl" :request="request" :result="result" :error="error" :loading="loading" :data="data" :execute="execute" :reset="reset"></slot>
    </form>
    <ApiKeyDialog v-if="showApiKeyDialog" @done="showApiKeyDialog = false" @save="onApiKeySaved" />
</div>
</template>

<script lang="ts">
// @ts-nocheck
import { ref, computed, shallowRef, onMounted, inject, provide } from "vue"
import { JsonServiceClient } from "@servicestack/client"
import { useAuth } from "../../use/auth"
import { useApiKey } from "../../use/config"
import SchemaInput from "./SchemaInput.vue"
import ApiKeyDialog from "../ApiKeyDialog.vue"
import ErrorSummary from "../ErrorSummary.vue"
import PrimaryButton from "../PrimaryButton.vue"
import SecondaryButton from "../SecondaryButton.vue"
import { buildRequest, propsOf, toOp } from "./AutoQuerySchema.vue"

const bytes = n => n < 1024 ? `${n} B`
    : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB`
    : `${(n / 1024 / 1024).toFixed(1)} MB`

function toCurl({ method, url, headers, body, uploads }) {
    const origin = typeof location !== 'undefined' ? location.origin : ''
    const parts = [`curl -X ${method} '${origin}${url}'`]
    for (const [k, v] of Object.entries(headers)) parts.push(`-H '${k}: ${v}'`)
    if (uploads.length) {
        for (const [k, v] of Object.entries(body)) {
            if (!uploads.includes(k)) parts.push(`-F '${k}=${v}'`)
        }
        for (const name of uploads) parts.push(`-F '${name}=@/path/to/file'`)
    } else if (method !== 'GET' && method !== 'DELETE') {
        parts.push(`-d '${JSON.stringify(body)}'`)
    }
    return parts.join(' \\\n  ')
}

function coerce(value, prop) {
    const type = prop?.type
    if (type === 'boolean') {
        return value === '' || /^(true|1|on|yes)$/i.test(value)
    }
    if (type === 'integer' || type === 'number') {
        const n = Number(value)
        return Number.isFinite(n) && value !== '' ? n : undefined
    }
    if (type === 'array') {
        const values = Array.isArray(value) ? value : [value]
        if (prop.items?.type === 'object') return parseJson(values[0])
        return values.flatMap(v => String(v).split(',')).map(x => x.trim()).filter(Boolean)
    }
    if (type === 'object') return parseJson(value)
    return value
}

const parseJson = text => { try { return JSON.parse(text) } catch { return undefined } }

function fromQueryString(schema) {
    if (typeof location === 'undefined') return {}
    const params = new URLSearchParams(location.search)
    const byLower = new Map(Object.keys(schema.properties ?? {}).map(n => [n.toLowerCase(), n]))
    const to = {}
    for (const [key, value] of params) {
        const name = byLower.get(key.toLowerCase())
        if (!name || name in to) continue
        const prop = schema.properties[name]
        const parsed = coerce(prop?.type === 'array' ? params.getAll(key) : value, prop)
        if (parsed !== undefined) to[name] = parsed
    }
    return to
}

function updateUrlQueryString(schema, data) {
    if (typeof location === 'undefined' || typeof history === 'undefined') return
    const params = new URLSearchParams()
    const properties = schema?.properties ?? {}
    const byLowerProp = new Map(Object.entries(properties).map(([k, v]) => [k.toLowerCase(), v]))

    for (const [name, val] of Object.entries(data ?? {})) {
        if (val === undefined || val === null) continue
        const prop = properties[name] ?? byLowerProp.get(String(name).toLowerCase())
        const isNumberProp = prop?.type === 'integer' || prop?.type === 'number'

        if (isNumberProp || typeof val === 'number') {
            const num = Number(val)
            if (!Number.isFinite(num) || num === 0) continue
            params.set(name, String(num))
        } else if (prop?.type === 'boolean' || typeof val === 'boolean') {
            if (val === true || val === 'true') {
                params.set(name, 'true')
            }
        } else if (Array.isArray(val)) {
            if (val.length > 0) {
                params.set(name, val.join(','))
            }
        } else if (typeof val === 'object') {
            if (Object.keys(val).length > 0) {
                params.set(name, JSON.stringify(val))
            }
        } else if (typeof val === 'string') {
            const trimmed = val.trim()
            if (trimmed === '' || trimmed === '0') continue
            params.set(name, trimmed)
        }
    }

    const qs = params.toString()
    const newUrl = location.pathname + (qs ? '?' + qs : '')
    history.replaceState(null, '', newUrl)
}

const ApiFormSchema = {
    name: 'ApiFormSchema',
    components: { SchemaInput, ErrorSummary, PrimaryButton, SecondaryButton, ApiKeyDialog },
    props: {
        schema: { type: Object, required: true },
        client: { type: Object, default: null },
        modelValue: { type: Object, default: null },
        autoExecute: { type: Boolean, default: false },
        syncUrl: { type: Boolean, default: false },
    },
    emits: ['update:modelValue', 'success', 'error', 'execute', 'reset'],
    setup(props, { emit }) {
        const schema = props.schema
        const fields = propsOf(schema)
        const blank = () => Object.fromEntries(fields.map(f => [f.name, undefined]))

        const prefilled = props.syncUrl ? fromQueryString(schema) : {}
        const data = ref(props.modelValue ? { ...props.modelValue } : { ...blank(), ...prefilled })
        const error = ref(null)
        const loading = ref(false)
        const result = ref(null)
        const form = shallowRef(null)

        const client = props.client ?? inject('client', null) ?? new JsonServiceClient()
        provide('client', client)

        const showApiKeyDialog = ref(false)
        const globalApiKey = useApiKey()
        const apiKey = computed(() => globalApiKey.value || client?.bearerToken || '')
        const requiresApiKey = computed(() => !!schema.auth?.requiresApiKey)
        function onApiKeySaved(key) {
            if (client) client.bearerToken = key
            globalApiKey.value = key
        }

        const { canAccess } = useAuth()
        const method = schema.method || 'POST'

        const request = computed(() => buildRequest(schema, data.value, form.value, { client }))

        const requestText = computed(() => {
            const r = request.value
            const lines = [`${r.method} ${r.url}`]
            for (const [k, v] of Object.entries(r.headers)) lines.push(`${k}: ${v}`)
            if (r.uploads.length) {
                lines.push('', `(multipart — uploading ${r.uploads.join(', ')})`)
            } else if (typeof r.payload === 'string' && r.payload !== '{}') {
                lines.push('', JSON.stringify(r.body, null, 2))
            }
            return lines.join('\n')
        })

        const boundFields = computed(() => {
            const names = Object.keys(schema.properties ?? {})
            return (error.value?.errors ?? [])
                .map(e => e.fieldName)
                .filter(f => names.some(n => String(f ?? '').toLowerCase().startsWith(n.toLowerCase())))
        })

        async function execute() {
            if (props.syncUrl) updateUrlQueryString(schema, data.value)
            loading.value = true
            error.value = null
            const started = performance.now()
            try {
                const r = buildRequest(schema, data.value, form.value, { client })
                emit('execute', { request: r, data: data.value })
                const res = await fetch(r.url, { method: r.method, headers: r.headers, body: r.payload ?? undefined })
                const text = await res.text()
                const ms = Math.round(performance.now() - started)

                let pretty = text
                let json = null
                try {
                    json = text ? JSON.parse(text) : null
                    pretty = json != null ? JSON.stringify(json, null, 2) : text
                } catch { /* not JSON - show it raw */ }
                if (!pretty) pretty = '(no content)'

                result.value = {
                    json,
                    ok: res.ok,
                    status: res.status,
                    statusText: res.statusText,
                    ms,
                    size: bytes(new Blob([text]).size),
                    text: pretty,
                    headers: [...res.headers.entries()].map(([k, v]) => `${k}: ${v}`).join('\n'),
                }

                error.value = res.ok ? null : (json?.responseStatus ?? json?.ResponseStatus
                    ?? { message: `${res.status} ${res.statusText}`, errors: [] })

                if (res.ok) {
                    emit('success', { json, result: result.value })
                } else {
                    emit('error', { error: error.value, result: result.value })
                }
            } catch (e) {
                error.value = { message: e.message ?? String(e), errors: [] }
                result.value = null
                emit('error', { error: error.value, result: null })
            } finally {
                loading.value = false
            }
        }

        function onFormEnter(e) {
            if (e.target?.tagName === 'TEXTAREA') return
            e.preventDefault()
            execute()
        }

        function reset() {
            data.value = blank()
            error.value = null
            result.value = null
            if (props.syncUrl) updateUrlQueryString(schema, data.value)
            emit('reset')
        }

        onMounted(() => {
            if (props.autoExecute && method === 'GET' && Object.keys(prefilled).length) execute()
        })

        return {
            schema, form, fields, data, error, loading, result,
            boundFields, requestText, execute, onFormEnter, reset,
            curl: computed(() => toCurl(request.value)),
            request,
            canCall: computed(() => canAccess(toOp(schema))),
            showApiKeyDialog, apiKey, requiresApiKey, onApiKeySaved,
        }
    },
}

export default ApiFormSchema
</script>
