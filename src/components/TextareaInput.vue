<template>
  <div :class="[$attrs.class]">
    <label v-if="useLabel" :for="id" :class="`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
    <div class="mt-1 relative">
      <textarea
         :name="id"
         :id="id"
         :class="cls"
         :placeholder="usePlaceholder"
         @input="$emit('update:modelValue', value($event.target))"
         :aria-invalid="errorField != null"
         :aria-describedby="`${id}-error`"
         v-bind="omit($attrs, ['class'])">{{ modelValue }}</textarea>
    </div>
    <p v-if="errorField" class="mt-2 text-sm text-red-500" :id="`${id}-error`">{{ errorField }}</p>
    <p v-else-if="help" class="mt-2 text-sm text-gray-500" :id="`${id}-description`">{{ help }}</p>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import type { ApiState, ResponseStatus } from "../types"
import { errorResponse, humanize, omit, toPascalCase } from "@servicestack/client"
import { computed, inject, useAttrs } from "vue"
import { input } from "./css"

const value = (e:EventTarget|null) => (e as HTMLInputElement).value //workaround IDE type-check error

const props = defineProps<{
  status?: ResponseStatus|null
  id: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
  placeholder?: string
  modelValue?: string
}>()

const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))
const usePlaceholder = computed(() => props.placeholder ?? useLabel.value)

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? ctx?.error.value }, props.id))

const cls = computed(() => ['shadow-sm ' + input.base, errorField.value 
  ? 'text-red-900 focus:ring-red-500 focus:border-red-500 border-red-300'
  : 'text-gray-900 ' + input.valid, props.inputClass])
</script>
