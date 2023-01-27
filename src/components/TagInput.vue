<template>
<div>
    <label v-if="useLabel" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ useLabel }}</label>
    <div class="mt-1 relative rounded-md shadow-sm">
        <button :class="cls" @click.prevent="handleClick">
            <div class="flex flex-wrap pb-1.5">
                <div v-for="tag in modelValue" class="pt-1.5 pl-1">
                    <span class="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300">
                        {{tag}}
                        <button type="button" @click="removeTag(tag)" class="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 dark:text-indigo-500 hover:bg-indigo-200 dark:hover:bg-indigo-800 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:bg-indigo-500 focus:text-white dark:focus:text-black">
                            <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7"></path></svg>
                        </button>
                    </span>
                </div>
                <div class="pt-1.5 pl-1 shrink">
                    <input ref="txtInput" :type="useType"
                            :name="id"
                            :id="id"
                            class="p-0 dark:bg-transparent rounded-md border-none focus:!border-none focus:!outline-none" 
                            :style="`box-shadow:none !important;width:${inputValue.length + 1}ch`"
                            v-model="inputValue"
                            :aria-invalid="errorField != null"
                            :aria-describedby="`${id}-error`"
                            @keydown="keyDown"
                            @keypress="keyPress"
                            @paste.prevent.stop="onPaste"
                            @blur="onBlur"
                            v-bind="remaining">
                </div>
            </div>
        </button>

        <div v-if="errorField" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
        </div>
    </div>

    <p v-if="errorField" class="mt-2 text-sm text-red-500" :id="`${id}-error`">{{ errorField }}</p>
    <p v-else-if="help" class="mt-2 text-sm text-gray-500" :id="`${id}-description`">{{ help }}</p>
</div>
</template>

<script setup lang="ts">
import { errorResponse, humanize, omit, ResponseStatus, toPascalCase, trimEnd } from "@servicestack/client"
import { computed, inject, ref, useAttrs } from "vue"
import type { ApiState } from "../types"

//const value = (e:EventTarget|null) => (e as HTMLInputElement).value //workaround IDE type-check error

const props = withDefaults(defineProps<{
    status?: ResponseStatus|null
    id: string
    type?: string
    label?: string
    help?: string
    modelValue?: string[],
    delimiters?: string[],
}>(), {
    modelValue: () => [],
    delimiters: () => [','],
})

const emit = defineEmits<{
    (e: "update:modelValue", value: string[]): void
}>()

const txtInput = ref<HTMLInputElement|null>(null)
const inputValue = ref('')

const useType = computed(() => props.type || 'text')
const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))

const remaining = computed(() => omit(useAttrs(), [...Object.keys(props)]))

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? ctx?.error.value }, props.id))

const cls = computed(() => ['w-full cursor-text flex flex-wrap sm:text-sm rounded-md dark:text-white dark:bg-gray-900 border focus-within:border-transparent focus-within:ring-1 focus-within:outline-none', errorField.value
    ? 'pr-10 border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:ring-red-500 focus-within:border-red-500'
    : 'shadow-sm border-gray-300 dark:border-gray-600 focus-within:ring-indigo-500 focus-within:border-indigo-500'])

const handleClick = (e:MouseEvent) => txtInput.value?.focus()
const updateValue = (newValue:string[]) => emit('update:modelValue', newValue)
const removeTag = (tag:string) => updateValue(props.modelValue.filter(x => x != tag))
const onBlur = () => keyPress({ key:'Enter' } as any)

function keyDown(e:KeyboardEvent) {
    if (e.key == "Backspace" && inputValue.value.length == 0) {
        if (props.modelValue.length > 0) {
            removeTag(props.modelValue[props.modelValue.length - 1])
        }
    }
}

function keyPress(e:KeyboardEvent) {
    if (inputValue.value.length == 0) return
    const tag = trimEnd(inputValue.value.trim(), ',').trim()
    if (tag.length == 0) return
    const isEnter = e.key == "Enter" || e.key == "NumpadEnter"
    if (isEnter || (e.key.length == 1 && props.delimiters.some(x => x == e.key))) {
        const newValue = Array.from(props.modelValue)
        if (newValue.indexOf(tag) == -1) {
            newValue.push(tag)
        }
        updateValue(newValue)
        inputValue.value = ''
    }
}

function onPaste(e:ClipboardEvent) {
    const text = e.clipboardData?.getData('Text')
    handlePastedText(text)
}

function handlePastedText(txt?:string) {
    if (!txt) return
    const re = new RegExp(`\\n|\\t|${props.delimiters.join('|')}`)
    const newTags = Array.from(props.modelValue)
    const tags = txt.split(re).map(x => x.trim())
    tags.forEach(tag => { 
        if (newTags.indexOf(tag) == -1) {
            newTags.push(tag)
        }
    })
    updateValue(newTags)
    inputValue.value = ''
}


</script>
