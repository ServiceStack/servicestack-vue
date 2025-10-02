<template>
<div :class="[$attrs.class]" :id="`${id}-tag`" onmousemove="cancelBlur=true">
    <label v-if="useLabel" :for="id" :class="`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
    <div class="mt-1 relative">
        <input type="hidden" :id="id" :name="id" :value="modelArray.join(',')"/>
        <button :class="cls" @click.prevent="handleClick" @focus="expanded=true" tabindex="-1">
            <div class="flex flex-wrap pb-1.5">
                <div v-for="tag in modelArray" class="pt-1.5 pl-1">
                    <span class="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300">
                        {{tag}}
                        <button type="button" @click="removeTag(tag)" class="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 dark:text-indigo-500 hover:bg-indigo-200 dark:hover:bg-indigo-800 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:bg-indigo-500 focus:text-white dark:focus:text-black">
                            <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7"></path></svg>
                        </button>
                    </span>
                </div>
                <div class="pt-1.5 pl-1 shrink">
                    <input ref="txtInput" :type="useType"
                        role="combobox" aria-controls="options" aria-expanded="false" autocomplete="off" spellcheck="false" 
                        :name="`${id}-txt`"
                        :id="`${id}-txt`"
                        class="p-0 dark:bg-transparent rounded-md border-none focus:!border-none focus:!outline-none" 
                        :style="`box-shadow:none !important;width:${inputValue.length + 1}ch`"
                        v-model="inputValue"
                        :aria-invalid="errorField != null"
                        :aria-describedby="`${id}-error`"
                        @keydown="keyDown"
                        @keypress="keyPress"
                        @paste.prevent.stop="onPaste"
                        @focus="onFocus"
                        @blur="onBlur"
                        @click="expanded=true"
                        v-bind="omit($attrs, ['class','required'])">
                </div>
            </div>
        </button>
        <ul v-if="expanded && filteredValues.length" class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            @keydown="keyDown" :id="`${id}-options`" role="listbox">
            <li v-for="option in filteredValues.slice(0,maxVisibleItems)"
                :class="[option === active ? 'active bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']"
                @mouseover="setActive(option)" @click="add(option)" role="option" tabindex="-1">
                <span class="block truncate">{{ option }}</span>
            </li>
        </ul>

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

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import type { ApiState } from "@/types"
import type { TagInputProps, TagInputEmits } from '@/components/types'
import { $1, errorResponse, humanize, map, omit, toPascalCase, trimEnd } from "@servicestack/client"
import { computed, inject, ref } from "vue"
import { filterClass } from "./css";

const props = withDefaults(defineProps<TagInputProps>(), {
    modelValue: () => [],
    delimiters: () => [','],
    maxVisibleItems: 300,
})

const emit = defineEmits<TagInputEmits>()

//can be other values that should use a converter
function converter(values:string|string[]) {
    return props.converter ? props.converter(values) : values
}

const modelArray = computed(() => (map(converter(props.modelValue), v => typeof v == 'string'
    ? v.trim().length == 0 ? [] : v.split(',') 
    : v) || []) as string[])

const active = ref()
const expanded = ref(false)
const filteredValues = computed(() => {
    const inputLower = inputValue.value.toLowerCase()
    return !props.allowableValues || props.allowableValues.length == 0 ? [] : 
    props.allowableValues.length < 1000
        ? props.allowableValues.filter(x => !modelArray.value.includes(x) && x.toLowerCase().includes(inputLower))
        : props.allowableValues.filter(x => !modelArray.value.includes(x) && x.startsWith(inputLower))
})
function setActive(option:any) {
    active.value = option
}
const txtInput = ref<HTMLInputElement|null>(null)
const inputValue = ref('')

const useType = computed(() => props.type || 'text')
const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? (ctx as any)?.error.value }, props.id))

const cls = computed(() => filterClass(['w-full cursor-text flex flex-wrap sm:text-sm rounded-md dark:text-white dark:bg-gray-900 border focus-within:border-transparent focus-within:ring-1 focus-within:outline-none', 
    errorField.value
        ? 'pr-10 border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:ring-red-500 focus-within:border-red-500'
        : 'shadow-sm border-gray-300 dark:border-gray-600 focus-within:ring-indigo-500 focus-within:border-indigo-500'
    , props.inputClass], 'TagInput', props.filterClass))

const removeTag = (tag:string) => updateValue(modelArray.value.filter(x => x != tag))

function handleClick(e:MouseEvent) {
    // If this is the first button in a form, pressing 'Enter' fires this button @click event, can distinguish from a real click by ensuring active element is button
    if (document.activeElement === e.target) {
        txtInput.value?.focus()
    }
}

const cancelBlur = ref()

function expand() {
    expanded.value = true
    cancelBlur.value = true
}

function onFocus() {
    expand()
}
function onBlur() {
    add(currentTag())
    cancelBlur.value = false
    setTimeout(() => { if (!cancelBlur.value) expanded.value = false }, 200)
}

function updateValue(newValue:string[]) {
    const ev = props.string ? newValue.join(',') : newValue
    emit('update:modelValue', ev)
}

function keyDown(e:KeyboardEvent) {
    if (e.key == "Backspace" && inputValue.value.length == 0) {
        if (modelArray.value.length > 0) {
            removeTag(modelArray.value[modelArray.value.length - 1]!)
        }
    } 
    if (!props.allowableValues || props.allowableValues.length == 0) return

    if (e.code == 'Escape' || e.code == 'Tab') {
        expanded.value = false
    } else if (e.code == 'Home') {
        active.value = filteredValues.value[0]
        scrollActiveIntoView()
    } else if (e.code == 'End') {
        active.value = filteredValues.value[filteredValues.value.length-1]
        scrollActiveIntoView()
    } else if (e.code == 'ArrowDown') {
        expanded.value = true
        if (!active.value) {
            active.value = filteredValues.value[0]
        } else {
            const currIndex = filteredValues.value.indexOf(active.value)
            active.value = currIndex + 1 < filteredValues.value.length
                ? filteredValues.value[currIndex + 1]
                : filteredValues.value[0]
        }
        onlyScrollActiveIntoViewIfNeeded()
    } else if (e.code == 'ArrowUp') {
        if (!active.value) {
            active.value = filteredValues.value[filteredValues.value.length-1]
        } else {
            const currIndex = filteredValues.value.indexOf(active.value)
            active.value = currIndex - 1 >= 0
                ? filteredValues.value[currIndex - 1]
                : filteredValues.value[filteredValues.value.length-1]
        }
        onlyScrollActiveIntoViewIfNeeded()
    } else if (e.code == 'Enter') {
        if (active.value && expanded.value) {
            add(active.value)
            e.preventDefault()
        } else {
            expanded.value = false
        }
    } else {
        expanded.value = filteredValues.value.length > 0
    }
}

function currentTag() {
    if (inputValue.value.length == 0) return ''
    let tag = trimEnd(inputValue.value.trim(), ',')
    if (tag[0] == ',') tag = tag.substring(1)
    tag = tag.trim()
    
    return tag.length == 0 && expanded.value && filteredValues.value.length > 0
        ? active.value
        : tag
}

function keyPress(e:KeyboardEvent) {
    const tag = currentTag()
    if (tag.length > 0) {
        const isDelim = props.delimiters.some(x => x == e.key)
        if (isDelim) e.preventDefault()
        const isEnter = e.key == "Enter" || e.key == "NumpadEnter"
        if (isEnter || (e.key.length == 1 && isDelim)) {
            add(tag)
            return
        }    
    }
}

const scrollOptions = { behavior: "smooth", block: "nearest", inline: "nearest", scrollMode:'if-needed' }
function scrollActiveIntoView() {
    setTimeout(() => {
        let el = $1(`#${props.id}-tag li.active`)
        if (el) {
            el.scrollIntoView(scrollOptions)
        }
    },0)
}
function onlyScrollActiveIntoViewIfNeeded() {
    setTimeout(() => {
        let el = $1(`#${props.id}-tag li.active`)
        if (el) {
            if ('scrollIntoViewIfNeeded' in el) {
                el.scrollIntoViewIfNeeded(scrollOptions)
            } else {
                el.scrollIntoView(scrollOptions)
            }
        }
    },0)
}


function add(tag:string) {
    if (tag.length === 0) return
    const newValue = Array.from(modelArray.value)
    if (newValue.indexOf(tag) == -1) {
        newValue.push(tag)
    }
    updateValue(newValue)
    inputValue.value = ''
    expanded.value = false
}

function onPaste(e:ClipboardEvent) {
    const text = e.clipboardData?.getData('Text')
    handlePastedText(text)
}

function handlePastedText(txt?:string) {
    if (!txt) return
    const re = new RegExp(`\\n|\\t|${props.delimiters.join('|')}`)
    const newTags = Array.from(modelArray.value)
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
