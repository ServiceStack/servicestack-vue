<template>
  <div :class="['relative flex items-start',$attrs.class]">
    <div class="flex items-center h-5">
      <input
          :id="id"
          :name="id"
          type="checkbox"
          :checked="modelValue"
          @input="$emit('update:modelValue', (($event as InputEvent).target as HTMLInputElement).checked)"
          :class="cls"
          v-bind="omit($attrs, ['class'])">
    </div>
    <div class="ml-3 text-sm">
      <label :for="id" :class="`font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
      <p v-if="errorField" class="mt-2 text-sm text-red-500" id="`${id}-error`">{{ errorField }}</p>
      <p v-else-if="help" class="mt-2 text-sm text-gray-500" id="`${id}-description`">{{ help }}</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import type { ApiState } from "../types"
import type { CheckboxInputProps, CheckboxInputEmits } from '@/components/types'
import { errorResponse, humanize, omit, toPascalCase } from "@servicestack/client"
import { computed, inject } from "vue"
import { filterClass } from "./css";

const props = defineProps<CheckboxInputProps>()

const emit = defineEmits<CheckboxInputEmits>()

const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? (ctx as any)?.error.value }, props.id))

const cls = computed(() => filterClass(['focus:ring-indigo-500 h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800',props.inputClass], 'CheckboxInput', props.filterClass))
</script>
