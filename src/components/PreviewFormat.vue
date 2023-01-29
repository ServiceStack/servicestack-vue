<template>

<span v-if="isComplexType(value)">
    <span v-if="isArray" class="mr-2">{{ value.length }}</span>
    <span v-html="htmlValue"></span>
</span>
<span v-else>{{ formatValue(value) }}</span>

</template>

<script setup lang="ts">
import type { FormatInfo } from '@/types'
import { computed } from 'vue';
import { isComplexType, formatValue, truncate } from '../api'

const props = withDefaults(defineProps<{
    value: any
    iconClass?: string
    iconRoundedClass?: string
    valueIconClass?: string
    format?:FormatInfo
    includeIcon?: boolean
    includeCount?: boolean
    maxFieldLength?: number
    maxNestedFields?: number
    maxNestedFieldLength?: number
}>(), {
    includeIcon: true,
    includeCount: true,
    maxFieldLength: 150,
    maxNestedFields: 2,
    maxNestedFieldLength: 30
})

const isArray = computed(() => Array.isArray(props.value))

const htmlValue = computed(() => {
    const isArray = Array.isArray(props.value)
    const useValue = isArray ? props.value[0] : props.value
    const count = isArray ? props.value.length : (typeof props.value == 'object' ? Object.keys(props.value).length : 0)
    const sb:String[] = []

    if (isArray) sb.push('[ ')
    if (!isArray || count > 0) {
        sb.push('{ ')
        if (isComplexType(useValue)) {
            const keys = Object.keys(useValue)
            const len = Math.min(props.maxNestedFields, keys.length)
            for (let i=0; i<len; i++) {
                const key = keys[i]
                const val = useValue[key]
                const value = formatValue(val)
                const str = truncate(value, props.maxNestedFieldLength)
                if (i > 0) {
                    sb.push(', ')
                }
                sb.push(`<b class="font-medium">${key}</b>: ${str}`)
            }
        } else {
            sb.push(formatValue(useValue))
        }
        sb.push(' }')
    }
    if (isArray) sb.push(' ]')

    return sb.join('')
})
</script>