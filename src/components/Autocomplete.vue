<template>
<div :id="`${id}-autocomplete`">
    <label v-if="useLabel" :for="`${id}-text`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ useLabel }}</label>

    <div class="relative mt-1">

        <input ref="txtInput" :id="`${id}-text`"
            type="text" role="combobox" aria-controls="options" aria-expanded="false" autocomplete="off" spellcheck="false"
            v-model="inputValue"
            :class="cls"
            :placeholder="multiple || !modelValue ? placeholder : ''"
            :readonly="!multiple && !!modelValue && !expanded"
            @keydown="keyDown"
            @keyup="keyUp"
            @click="onInputClick"
            @paste="onPaste"
            :required="false"
            v-bind="$attrs">

        <button type="button" @click="toggle(!expanded)" class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none" tabindex="-1">
            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
            </svg>
        </button>
        
        <ul v-if="expanded" class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            @keydown="keyDown" :id="`${id}-options`" role="listbox">
            <li v-for="option in filteredValues" 
                :class="[option === active ? 'active bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']"
                @mouseover="setActive(option)" @click="select(option)" role="option" tabindex="-1">
                
                <slot v-if="typeof option === 'string'" name="item" v-bind="{ key:option, value:option }"></slot>
                <slot v-else name="item" v-bind="option"></slot>
                
                <span v-if="hasOption(option)" :class="['absolute inset-y-0 right-0 flex items-center pr-4', option === active ? 'text-white' : 'text-indigo-600']">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                    </svg>
                </span>
            </li>
        </ul>
        <div v-else-if="!multiple && modelValue" @keydown="keyDown" class="h-8 -mt-8 ml-3 pt-0.5 pointer-events-none">
            <slot v-if="typeof modelValue === 'string'" name="item" v-bind="{ key:modelValue, value:modelValue }"></slot>
            <slot v-else name="item" v-bind="modelValue"></slot>
        </div>
        
        <div v-if="errorField" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" tabindex="-1">
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
import type { ApiState, ResponseStatus } from "../types"
import type { AutocompleteProps, AutocompleteEmits } from '@/components/types'

import { $1, errorResponse, humanize, omit, toPascalCase } from "@servicestack/client"
import { computed, inject, ref, useAttrs, watch } from "vue"
import { focusNextElement } from '@/use/utils'
import { input } from "./css"

const expanded = ref(false)

const props = withDefaults(defineProps<AutocompleteProps>(), {
    multiple: false,
    options: () => [],
    viewCount: 100,
    pageSize: 8,
})

const emit = defineEmits<AutocompleteEmits>()

defineExpose({ toggle })

function hasOption(option:any) {
    return Array.isArray(props.modelValue) && props.modelValue.indexOf(option) >= 0
}

const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? (ctx as any)?.error.value }, props.id))

const cls = computed(() => [input.base, errorField.value ? input.invalid : input.valid])

const txtInput = ref<HTMLInputElement|null>(null)
const inputValue = ref('')
const active = ref<any|null>(null)
const take = ref(props.viewCount)
const filteredValues = ref<any[]>([])

const filteredOptions = computed(() => {
    let ret = !inputValue.value
        ? props.options
        : props.options.filter(x => props.match(x, inputValue.value)).slice(0,take.value)
    return ret
})

const navKeys = ['Tab', 'Escape', 'ArrowDown', 'ArrowUp', 'Enter', 'PageUp', 'PageDown', 'Home', 'End']

function setActive(option:any) {
    active.value = option
    const currIndex = filteredValues.value.indexOf(option)
    if (currIndex > Math.floor(take.value * .9)) {
        take.value += props.viewCount
        refresh()
    }
}

const delims = [',','\n','\t']

function onPaste(e:ClipboardEvent) {
    const text = e.clipboardData?.getData('Text')
    handlePastedText(text)
}
function handlePastedText(txt?:string) {
    if (!txt) return

    const multipleValues = delims.some(x => txt.includes(x))
    if (!props.multiple || !multipleValues) {
        const matches = props.options.filter(x => props.match(x,txt))
        if (matches.length == 1) {
            select(matches[0])
            expanded.value = false
            focusNextElement()
        }
    } else if (multipleValues) {
        const re = new RegExp(`\\r|\\n|\\t|,`)
        const values = txt.split(re).filter(x => x.trim())
        const matches = values.map(value => props.options.find(x => props.match(x,value))).filter(x => !!x)
        if (matches.length > 0) {
            inputValue.value = ''
            expanded.value = false
            active.value = null
            let newValues = Array.from(props.modelValue || [])
            matches.forEach(option => {
                if (hasOption(option)) {
                    newValues = newValues.filter(x => x != option)
                } else {
                    newValues.push(option)
                }
            })
            emit('update:modelValue', newValues)
            focusNextElement()
        }
    }
}

function keyUp(e:KeyboardEvent) {
    if (navKeys.indexOf(e.code)) 
        return
    update()
}

function keyDown(e:KeyboardEvent) {
    if (e.shiftKey || e.ctrlKey || e.altKey) return

    if (!expanded.value) {
        if (e.code == 'ArrowDown') {
            expanded.value = true
            active.value = filteredValues.value[0]
        }
        return
    }
    if (e.code == 'Escape') {
        if (expanded.value) {
            e.stopPropagation()
            expanded.value = false
        }
    }
    else if (e.code == 'Tab') {
        expanded.value = false
    } else if (e.code == 'Home') {
        active.value = filteredValues.value[0]
        scrollActiveIntoView()
    } else if (e.code == 'End') {
        active.value = filteredValues.value[filteredValues.value.length-1]
        scrollActiveIntoView()
    } else if (e.code == 'ArrowDown') {
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
        if (active.value) {
            select(active.value)
            if (!props.multiple) {
                e.preventDefault()
                focusNextElement()
            }
        } else {
            expanded.value = false
        }
    }
}

const scrollOptions = { behavior: "smooth", block: "nearest", inline: "nearest", scrollMode:'if-needed' }
function scrollActiveIntoView() {
    setTimeout(() => {
        let el = $1(`#${props.id}-autocomplete li.active`)
        if (el) {
            el.scrollIntoView(scrollOptions)
        }
    },0)
}
function onlyScrollActiveIntoViewIfNeeded() {
    setTimeout(() => {
        let el = $1(`#${props.id}-autocomplete li.active`)
        if (el) {
            if ('scrollIntoViewIfNeeded' in el) {
                el.scrollIntoViewIfNeeded(scrollOptions)
            } else {
                el.scrollIntoView(scrollOptions)
            }
        }
    },0)
}

function toggle(expand:boolean) {
    expanded.value = expand
    if (!expand)
        return
    refresh()
    txtInput.value?.focus()
}

function onInputClick() {
    // When in single-select mode with a value, toggle the dropdown
    if (!props.multiple && props.modelValue) {
        expanded.value = !expanded.value
        if (expanded.value) {
            refresh()
        }
    } else {
        update()
    }
}

function update() {
    expanded.value = true
    refresh()
}

function select(option:any) {
    inputValue.value = ''
    expanded.value = false
    
    if (props.multiple) {
        let newValues = Array.from(props.modelValue || [])
        if (hasOption(option)) {
            newValues = newValues.filter(x => x != option)
        } else {
            newValues.push(option)
        }
        active.value = null
        emit('update:modelValue', newValues)
    } else {
        let value = option
        emit('update:modelValue', value)
    }
}


function refresh() {
    filteredValues.value = filteredOptions.value
} 

watch(inputValue, refresh)
</script>
