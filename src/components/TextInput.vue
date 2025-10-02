<template>
  <div :class="[$attrs.class]">
    <slot name="header" :inputElement="inputElement" :id="id" :modelValue="modelValue" :status="status" v-bind="$attrs"></slot>
    <label v-if="useLabel" :for="id" :class="`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
    <div :class="fixShadow('mt-1 relative')">

     <input ref="inputElement" :type="useType"
        :name="id"
        :id="id"
        :class="cls"
        :placeholder="usePlaceholder"
        :value="textInputValue(useType,modelValue)"
        @input="$emit('update:modelValue', value($event.target))"
        :aria-invalid="errorField != null"
        :aria-describedby="`${id}-error`"
        step="any"
        v-bind="omit($attrs,['class','value'])">
        
      <div v-if="errorField" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <p v-if="errorField" class="mt-2 text-sm text-red-500" :id="`${id}-error`">{{ errorField }}</p>
    <p v-else-if="help" class="mt-2 text-sm text-gray-500" :id="`${id}-description`">{{ help }}</p>
    <slot name="footer" :inputElement="inputElement" :id="id" :modelValue="modelValue" :status="status" v-bind="$attrs"></slot>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import type { ApiState } from "@/types"
import type { TextInputProps, TextInputExpose } from '@/components/types'
import { errorResponse, humanize, omit, toPascalCase } from "@servicestack/client"
import { computed, inject, ref } from "vue"
import { input, filterClass } from './css'
import { textInputValue } from '@/use/utils'

const value = (e:EventTarget|null) => textInputValue(useType.value, (e as HTMLInputElement).value) //workaround IDE type-check error

const props = defineProps<TextInputProps>()

defineExpose<TextInputExpose>({
  focus
})

const inputElement = ref<HTMLInputElement>()

function focus() {
  inputElement.value?.focus()
}

const useType = computed(() => props.type || 'text')
const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))
const usePlaceholder = computed(() => props.placeholder ?? useLabel.value)
function fixShadow(cls:string) {
  return props.type === 'range'
    ? cls.replace('shadow-sm ', '')
    : cls
}

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? (ctx as any)?.error.value }, props.id))

const cls = computed(() => filterClass([input.base, 
  errorField.value 
    ? input.invalid 
    : fixShadow(input.valid), props.inputClass], 'TextInput', props.filterClass))
</script>
