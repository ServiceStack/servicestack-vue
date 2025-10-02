<template>
<div :class="[$attrs.class]">
  <label v-if="useLabel" :for="id" :class="`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
  <select :id="id" :name="id" :class="cls"
      :value="modelValue"
      @input="$emit('update:modelValue', value($event.target))"
      :aria-invalid="errorField != null"
      :aria-describedby="`${id}-error`"
      v-bind="omit($attrs, ['class'])">
    <option v-for="entry in kvpValues" :value="entry.key">{{ entry.value }}</option>
  </select>
  <p v-if="errorField" class="mt-2 text-sm text-red-500" :id="`${id}-error`">{{ errorField }}</p>
</div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import type { ApiState } from "@/types"
import type { SelectInputProps } from '@/components/types'
import { computed, inject } from "vue"
import { errorResponse, humanize, omit, toPascalCase } from "@servicestack/client"
import { filterClass } from "./css";

const value = (e:EventTarget|null) => (e as HTMLSelectElement).value //workaround IDE type-check error

const props = defineProps<SelectInputProps>()

const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? (ctx as any)?.error.value }, props.id))

const kvpValues = computed(() => props.entries || (props.values 
    ? props.values.map(x => ({ key:x, value:x }))
    : props.options 
        ? Object.keys(props.options).map(key => ({ key, value:props.options[key] }))
        : []))

const cls = computed(() => filterClass(['mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none sm:text-sm rounded-md dark:text-white dark:bg-gray-900 dark:border-gray-600 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-200 dark:disabled:border-slate-700 disabled:shadow-none',
      !errorField.value 
        ? 'shadow-sm border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500' 
        : 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',props.inputClass], 'SelectInput', props.filterClass))
</script>
