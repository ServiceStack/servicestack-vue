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
import type { PreviewFormatProps } from '@/components/types'
import { computed } from 'vue'
import { isComplexType } from '@/use/utils'
import { formatValue } from '@/use/formatters'

const props = withDefaults(defineProps<PreviewFormatProps>(), {
    includeIcon: true,
    includeCount: true,
    maxFieldLength: 150,
    maxNestedFields: 2,
    maxNestedFieldLength: 30
})

const isArray = computed(() => Array.isArray(props.value))

</script>