<template>
  <div class="relative flex items-start">
    <div class="flex items-center h-5">
      <input
          :id="id"
          :name="id"
          type="checkbox"
          :checked="modelValue"
          @input="$emit('update:modelValue', (($event as InputEvent).target as HTMLInputElement).checked)"
          :class="`focus:ring-indigo-500 h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 ${inputClass}`"
          v-bind="remaining">
    </div>
    <div class="ml-3 text-sm">
      <label :for="id" :class="`font-medium text-gray-700 dark:text-gray-300 ${labelClass}`">{{ useLabel }}</label>
      <p v-if="errorField" class="mt-2 text-sm text-red-500" id="`${id}-error`">{{ errorField }}</p>
      <p v-else-if="help" class="mt-2 text-sm text-gray-500" id="`${id}-description`">{{ help }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiState, ResponseStatus } from "../types"
import { errorResponse, humanize, omit, toPascalCase } from "@servicestack/client"
import { computed, inject, useAttrs } from "vue"

const props = defineProps<{
  modelValue?: boolean
  status?: ResponseStatus
  id: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
}>()

const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))

const remaining = computed(() => omit(useAttrs(), [...Object.keys(props)]))

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? ctx?.error.value }, props.id))
</script>
