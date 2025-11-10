<template>
  <span v-if="labelValue">
    <span class="flex" :title="`${refInfo?.model} ${rawValue}`">
      <Icon v-if="refImage" :image="refImage" class="w-5 h-5 mr-1" />
      {{ labelValue }}
    </span>
  </span>
  <span v-else-if="isArray">
    <span class="mr-2">{{ value?.length }}</span>
    <span v-html="fmt"></span>
  </span>
  <span v-else v-html="fmt"></span>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
// Copy of CellFormat.vue using setup
import type { MetadataPropertyType, MetadataType, FormatInfo, RefInfo } from '@/types'
import { mapGet } from '@servicestack/client'
import { formatValue } from '@/use/formatters'
import { computed, useAttrs } from 'vue'
import { typeProperties, typeOf } from '@/use/metadata'
import Icon from './Icon.vue'

const props = defineProps<{
  type: MetadataType|null,
  propType?: MetadataPropertyType|null,
  modelValue: any
}>()

const attrs = useAttrs()

const rawValue = computed(() => props.propType ? mapGet(props.modelValue, props.propType.name!) : null)
const value = computed(() => rawValue.value)
const isArray = computed(() => Array.isArray(value.value))

const formatInfo = computed<FormatInfo|null>(() => {
  const prop = props.propType
  if (prop?.format) return prop.format
  if (prop?.type === 'TimeSpan' || prop?.type === 'TimeOnly') return { method: 'time' }
  return null
})

const scopeAttrs = computed(() => Object.assign({ modelValue: props.modelValue }, attrs))
const fmt = computed(() => formatValue(value.value, formatInfo.value || undefined, scopeAttrs.value))

const refInfo = computed<RefInfo|undefined>(() => props.propType?.ref || undefined)
const modelProps = computed(() => props.type ? typeProperties(props.type) : [])
const complexRefProp = computed(() => {
  const ref = refInfo.value
  return ref ? modelProps.value.find(x => x.type === ref.model) : null
})
const complexRefValue = computed(() => complexRefProp.value ? mapGet(props.modelValue, complexRefProp.value.name) : null)
const labelValue = computed(() => {
  const ref = refInfo.value
  return complexRefValue.value && ref?.refLabel ? mapGet(complexRefValue.value, ref.refLabel) : null
})
const refImage = computed(() => {
  const ref = refInfo.value
  if (!ref) return null
  const t = typeOf(ref.model)
  return t?.icon || null
})
</script>