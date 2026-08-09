// @ts-nocheck
/**
 * JsonSchemaForm - renders a JSON Schema as an editable form.
 *
 *     <JsonSchemaForm :schema="schema" v-model="data" :status="responseStatus" @change="save" />
 *     <JsonSchemaForm v-model="data">{ "type":"object", "properties":{ ... } }</JsonSchemaForm>
 *
 * Shared by JsonSchemaForm.vue and its recursive JsonSchemaNode.vue renderer.
 */

import { humanize } from '@servicestack/client'

export const CONTEXT = Symbol('JsonSchemaForm')

export const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)

// ---------------------------------------------------------------------------- schema resolution

const pointer = ref_ =>
    ref_
        .replace(/^#\//, '')
        .split('/')
        .map(p => decodeURIComponent(p.replace(/~1/g, '/').replace(/~0/g, '~')))

/** Follow same-document $refs. Recursive schemas resolve to the target without expanding forever. */
function deref(schema, root, seen) {
    if (!schema?.$ref) return schema
    if (seen.has(schema.$ref)) return { ...schema, $recursive: true, $ref: undefined }
    seen.add(schema.$ref)
    let target = root
    for (const part of pointer(schema.$ref)) target = target?.[part]
    if (!target) return schema
    const { $ref, ...rest } = schema
    return deref({ ...target, ...rest }, root, seen)
}

/** Flatten allOf into one schema so the form sees a single set of properties */
function mergeAllOf(schema, root) {
    if (!schema?.allOf?.length) return schema
    const { allOf, ...base } = schema
    return allOf.reduce((acc, part) => {
        const sub = resolveSchema(part, root)
        return {
            ...acc,
            ...sub,
            properties: { ...(acc.properties ?? {}), ...(sub.properties ?? {}) },
            required: [...new Set([...(acc.required ?? []), ...(sub.required ?? [])])],
        }
    }, base)
}

const resolved = new WeakMap()

/** $ref + allOf + OpenAPI `nullable` resolved into a plain schema, memoised per schema object */
export function resolveSchema(schema, root) {
    if (!schema || typeof schema !== 'object') return {}
    const rootSchema = root ?? schema
    let cache = resolved.get(rootSchema)
    if (!cache) resolved.set(rootSchema, (cache = new WeakMap()))
    if (cache.has(schema)) return cache.get(schema)

    let out = mergeAllOf(deref(schema, rootSchema, new Set()), rootSchema)
    if (out.nullable && !Array.isArray(out.type) && out.type) out = { ...out, type: [out.type, 'null'] }
    cache.set(schema, out)
    return out
}

/** `type` may be a union like ["string","null"] - the first non-null entry drives the widget */
export function typeOf(schema, value) {
    const declared = Array.isArray(schema?.type) ? schema.type.find(t => t !== 'null') : schema?.type
    if (declared) return declared
    if (schema?.properties || schema?.additionalProperties) return 'object'
    if (schema?.items || schema?.prefixItems) return 'array'
    if (schema?.const !== undefined) return typeof schema.const === 'number' ? 'number' : typeof schema.const
    if (Array.isArray(value)) return 'array'
    if (isPlainObject(value)) return 'object'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    return 'string'
}

export const isNullable = schema =>
    !!schema?.nullable || (Array.isArray(schema?.type) && schema.type.includes('null'))

/** [{ value, label }] when the schema constrains a field to a fixed set, else null */
export function choicesOf(schema) {
    if (schema?.enum) {
        const names = schema['x-enumNames'] ?? schema.enumNames
        return schema.enum.map((value, i) => ({ value, label: names?.[i] ?? String(value) }))
    }
    if (schema?.const !== undefined) return [{ value: schema.const, label: String(schema.const) }]
    const branches = schema?.oneOf ?? schema?.anyOf
    if (branches?.length && branches.every(b => b.const !== undefined)) {
        return branches.map(b => ({ value: b.const, label: b.title ?? String(b.const) }))
    }
    return null
}

/** oneOf/anyOf branches that need a variant picker (const-only branches are a select instead) */
export function variantsOf(schema) {
    const branches = schema?.oneOf ?? schema?.anyOf
    if (!branches?.length || branches.every(b => b.const !== undefined)) return null
    return branches
}

/** Which variant the current value looks most like - discriminator consts win, then required, then props */
export function bestVariant(branches, value, root) {
    let best = 0
    let bestScore = -1
    branches.forEach((branch, i) => {
        const s = resolveSchema(branch, root)
        let score = 0
        if (isPlainObject(value)) {
            for (const [key, prop] of Object.entries(s.properties ?? {})) {
                if (value[key] !== undefined) score += 1
                if (prop.const !== undefined && value[key] === prop.const) score += 10
            }
            for (const key of s.required ?? []) if (value[key] !== undefined) score += 2
        } else if (value !== undefined && typeOf(s) === typeOf({}, value)) {
            score += 1
        }
        if (score > bestScore) {
            bestScore = score
            best = i
        }
    })
    return best
}

/** A value matching the schema, for a new array item or a property the data is missing */
export function blankFor(schema, root, seen = new Set()) {
    const s = resolveSchema(schema, root)
    if (s.default !== undefined) return structuredClone(s.default)
    if (s.const !== undefined) return s.const
    const choices = choicesOf(s)
    if (choices) return choices[0].value
    const variants = variantsOf(s)
    if (variants) return blankFor(variants[0], root, seen)
    const type = typeOf(s)
    if (type === 'object' || type === 'array') {
        // only containers can cycle - leaf schemas are often shared between fields
        if (seen.has(s)) return null // recursive schema: stop here, the user can expand it
        seen.add(s)
    }
    switch (type) {
        case 'object': {
            const out = {}
            for (const [key, prop] of Object.entries(s.properties ?? {})) out[key] = blankFor(prop, root, seen)
            return out
        }
        case 'array':
            return (s.prefixItems ?? []).map(p => blankFor(p, root, seen))
        case 'integer':
        case 'number':
            return 0
        case 'boolean':
            return false
        case 'null':
            return null
        default:
            return ''
    }
}

// ---------------------------------------------------------------------------- widgets

export const INPUT_TYPES = {
    date: 'date',
    'date-time': 'datetime-local',
    time: 'time',
    month: 'month',
    week: 'week',
    email: 'email',
    uri: 'url',
    url: 'url',
    password: 'password',
    color: 'color',
    tel: 'tel',
    search: 'search',
    uuid: 'text',
}

export function widgetOf(schema, value) {
    const forced = schema?.['x-widget']
    if (forced === 'hidden') return 'hidden'
    if (forced) return forced === 'select' || forced === 'radio' ? forced : forced
    if (choicesOf(schema)) return 'select'
    const type = typeOf(schema, value)
    if (type === 'object') return 'object'
    if (type === 'array') return 'array'
    if (type === 'boolean') return 'checkbox'
    if (type === 'integer' || type === 'number') return 'number'
    if (schema?.format === 'textarea') return 'textarea'
    if (INPUT_TYPES[schema?.format]) return 'input'
    if (typeof value === 'string' && (value.length > 80 || value.includes('\n'))) return 'textarea'
    return 'input'
}

// ---------------------------------------------------------------------------- errors

/** items[0].qty -> items.0.qty, so the different notations compare equal */
export const normalizePath = path => String(path ?? '').replace(/\[(\d+)\]/g, '.$1').toLowerCase()

/**
 * First ResponseError for this path. An unqualified fieldName (`qty`) matches the leaf only when the
 * schema has exactly one field with that name, so ambiguous names never light up several inputs.
 */
export function fieldError(status, path, leafCounts) {
    const errors = status?.errors ?? status?.Errors
    if (!errors?.length || !path) return null
    const full = normalizePath(path)
    const leaf = full.split('.').pop()
    const match = errors.find(e => {
        const name = normalizePath(e.fieldName ?? e.FieldName)
        if (name === full) return true
        return !name.includes('.') && name === leaf && (leafCounts?.get(leaf) ?? 2) === 1
    })
    return match ? (match.message ?? match.Message ?? match.errorCode ?? match.ErrorCode) : null
}

/** How many fields in the schema share each leaf name, for the ambiguity check above */
export function leafNameCounts(schema, root, seen = new Set(), counts = new Map()) {
    const s = resolveSchema(schema, root ?? schema)
    if (!s.properties && !s.items && !s.prefixItems && !s.oneOf && !s.anyOf) return counts
    if (seen.has(s)) return counts // only containers recurse, so this only guards cycles
    seen.add(s)
    for (const [key, prop] of Object.entries(s.properties ?? {})) {
        const name = key.toLowerCase()
        counts.set(name, (counts.get(name) ?? 0) + 1)
        leafNameCounts(prop, root ?? schema, seen, counts)
    }
    for (const branch of s.oneOf ?? s.anyOf ?? []) leafNameCounts(branch, root ?? schema, seen, counts)
    for (const item of [s.items, ...(s.prefixItems ?? [])]) {
        if (item) leafNameCounts(item, root ?? schema, seen, counts)
    }
    return counts
}

const err = (fieldName, errorCode, message) => ({ fieldName, errorCode, message })
const isEmpty = v => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

/**
 * Pragmatic client-side validation of the keywords the form renders, returning ResponseStatus errors
 * whose fieldName matches the rendered field paths.
 */
export function validateValue(schema, value, root, path = '', label = '', out = []) {
    const s = resolveSchema(schema, root)
    const name = label || (path ? path.split('.').pop() : 'value')
    const type = typeOf(s, value)

    if (s.const !== undefined && value !== s.const) {
        out.push(err(path, 'Const', `${name} must be ${s.const}`))
    }
    const choices = choicesOf(s)
    if (choices && !isEmpty(value) && !choices.some(c => c.value === value)) {
        out.push(err(path, 'Enum', `${name} must be one of ${choices.map(c => c.label).join(', ')}`))
    }

    if (type === 'object' && isPlainObject(value)) {
        for (const key of s.required ?? []) {
            const prop = resolveSchema(s.properties?.[key], root)
            if (isEmpty(value[key])) {
                out.push(err(path ? `${path}.${key}` : key, 'NotEmpty', `${prop.title || humanize(key)} is required`))
            }
        }
        for (const [key, prop] of Object.entries(s.properties ?? {})) {
            if (value[key] !== undefined) {
                validateValue(prop, value[key], root, path ? `${path}.${key}` : key, resolveSchema(prop, root).title || humanize(key), out)
            }
        }
    } else if (type === 'array' && Array.isArray(value)) {
        if (s.minItems != null && value.length < s.minItems) out.push(err(path, 'MinItems', `${name} needs at least ${s.minItems}`))
        if (s.maxItems != null && value.length > s.maxItems) out.push(err(path, 'MaxItems', `${name} allows at most ${s.maxItems}`))
        if (s.uniqueItems && new Set(value.map(v => JSON.stringify(v))).size !== value.length) {
            out.push(err(path, 'UniqueItems', `${name} must not contain duplicates`))
        }
        value.forEach((item, i) => {
            const itemSchema = s.prefixItems?.[i] ?? s.items
            if (itemSchema) validateValue(itemSchema, item, root, `${path}[${i}]`, `${name} ${i + 1}`, out)
        })
    } else if (type === 'string' && typeof value === 'string' && value !== '') {
        if (s.minLength != null && value.length < s.minLength) out.push(err(path, 'MinLength', `${name} must be at least ${s.minLength} characters`))
        if (s.maxLength != null && value.length > s.maxLength) out.push(err(path, 'MaxLength', `${name} must be at most ${s.maxLength} characters`))
        if (s.pattern && !new RegExp(s.pattern).test(value)) out.push(err(path, 'Pattern', `${name} is not in the expected format`))
    } else if ((type === 'number' || type === 'integer') && typeof value === 'number') {
        if (type === 'integer' && !Number.isInteger(value)) out.push(err(path, 'Integer', `${name} must be a whole number`))
        if (s.minimum != null && value < s.minimum) out.push(err(path, 'Minimum', `${name} must be ${s.minimum} or more`))
        if (s.maximum != null && value > s.maximum) out.push(err(path, 'Maximum', `${name} must be ${s.maximum} or less`))
        if (s.exclusiveMinimum != null && value <= s.exclusiveMinimum) out.push(err(path, 'ExclusiveMinimum', `${name} must be greater than ${s.exclusiveMinimum}`))
        if (s.exclusiveMaximum != null && value >= s.exclusiveMaximum) out.push(err(path, 'ExclusiveMaximum', `${name} must be less than ${s.exclusiveMaximum}`))
        if (s.multipleOf && Math.abs(value / s.multipleOf - Math.round(value / s.multipleOf)) > 1e-9) {
            out.push(err(path, 'MultipleOf', `${name} must be a multiple of ${s.multipleOf}`))
        }
    }
    return out
}
