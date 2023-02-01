<template>

<span v-if="isComplexType(value)">
    <span v-if="includeCount && isArray" class="mr-2">{{ value.length }}</span>
    <span v-html="formatValue(value,format,$attrs)"></span>
</span>
<span v-else v-html="formatValue(value,format,$attrs)"></span>

</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import type { FormatInfo } from '@/types'
import { computed } from 'vue';
import { isComplexType } from '@/utils'
import { formatValue } from '@/formatters'

const props = withDefaults(defineProps<{
    value: any
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

</script>