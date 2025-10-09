<template>
<div>
    <slot name="header" :inputElement="txt" :id="id" :modelValue="modelValue" :status="status" v-bind="$attrs"></slot>
    <label v-if="useLabel" :for="id" :class="`mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
    <div v-if="!disabled" class="border border-gray-200 flex justify-between shadow-sm">
        <div class="p-2 flex flex-wrap gap-x-4">
            <svg v-if="show('bold')" :class="btnCls" @click="bold" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Bold text (CTRL+B)</title>
                <path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79c0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79c0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
            </svg>
            <svg v-if="show('italics')" :class="btnCls" @click="italic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Italics (CTRL+I)</title>
                <path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
            </svg>
            <svg v-if="show('link')" :class="btnCls" @click="link" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Insert Link (CTRL+K)</title>
                <path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7a5 5 0 0 0-5 5a5 5 0 0 0 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8v2m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1c0 1.71-1.39 3.1-3.1 3.1h-4V17h4a5 5 0 0 0 5-5a5 5 0 0 0-5-5Z" />
            </svg>
            <svg v-if="show('blockquote')" :class="btnCls" @click="quote" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Blockquote (CTRL+Q)</title>
                <path fill="currentColor" d="m15 17l2-4h-4V6h7v7l-2 4h-3Zm-9 0l2-4H4V6h7v7l-2 4H6Z" />
            </svg>
            <svg v-if="show('image')" :class="btnCls" @click="image" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Insert Image (CTRL+SHIFT+L)</title>
                <path fill="currentColor" d="M2.992 21A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992ZM20 15V5H4v14L14 9l6 6Zm0 2.828l-6-6L6.828 19H20v-1.172ZM8 11a2 2 0 1 1 0-4a2 2 0 0 1 0 4Z" />
            </svg>
            <svg v-if="show('code')" :class="btnCls" @click="code" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Insert Code (CTRL+&lt;)</title>
                <path fill="currentColor" d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6L8 18Zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6l-6 6Z" />
            </svg>
            <svg v-if="show('heading')" :class="btnCls" @click="heading" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>H2 Heading (CTRL+H)</title>
                <path fill="currentColor" d="M7 20V7H2V4h13v3h-5v13H7Zm9 0v-8h-3V9h9v3h-3v8h-3Z" />
            </svg>
            <svg v-if="show('orderedList')" :class="btnCls" icon @click="ol" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Numbered List (ALT+1)</title>
                <path fill="currentColor" d="M3 22v-1.5h2.5v-.75H4v-1.5h1.5v-.75H3V16h3q.425 0 .713.288T7 17v1q0 .425-.288.713T6 19q.425 0 .713.288T7 20v1q0 .425-.288.713T6 22H3Zm0-7v-2.75q0-.425.288-.713T4 11.25h1.5v-.75H3V9h3q.425 0 .713.288T7 10v1.75q0 .425-.288.713T6 12.75H4.5v.75H7V15H3Zm1.5-7V3.5H3V2h3v6H4.5ZM9 19v-2h12v2H9Zm0-6v-2h12v2H9Zm0-6V5h12v2H9Z" />
            </svg>
            <svg v-if="show('unorderedList')" :class="btnCls" @click="ul" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Bulleted List (ALT+-)</title>
                <path fill="currentColor" d="M9 19v-2h12v2H9Zm0-6v-2h12v2H9Zm0-6V5h12v2H9ZM5 20q-.825 0-1.413-.588T3 18q0-.825.588-1.413T5 16q.825 0 1.413.588T7 18q0 .825-.588 1.413T5 20Zm0-6q-.825 0-1.413-.588T3 12q0-.825.588-1.413T5 10q.825 0 1.413.588T7 12q0 .825-.588 1.413T5 14Zm0-6q-.825 0-1.413-.588T3 6q0-.825.588-1.413T5 4q.825 0 1.413.588T7 6q0 .825-.588 1.413T5 8Z" />
            </svg>
            <svg v-if="show('strikethrough')" :class="btnCls" @click="strikethrough" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Strike Through (ALT+S)</title>
                <path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
            </svg>
            <svg v-if="show('undo')" :class="btnCls" @click="undo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Undo (CTRL+Z)</title>
                <path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
            </svg>
            <svg v-if="show('redo')" :class="btnCls" @click="redo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><title>Redo (CTRL+SHIFT+Z)</title>
                <path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16a8.002 8.002 0 0 1 7.6-5.5c1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
            </svg>
            <slot name="toolbarbuttons" :instance="getCurrentInstance()?.exposed"></slot>
        </div>
        <div v-if="show('help') && helpUrl" class="p-2 flex flex-wrap gap-x-4">
            <a title="formatting help" target="_blank" :href="helpUrl" tabindex="-1">
                <svg :class="btnCls" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5c0-2.21-1.79-4-4-4z" />
                </svg>
            </a>
        </div>
    </div>
    <div class="">
        <textarea ref="txt" 
            :name="id"
            :id="id"
            :class="cls"
            :label="label" 
            :value="modelValue" 
            :rows="rows || 6" 
            :disabled="disabled" 
            @input="updateModelValue(($event.target as HTMLInputElement)?.value || '')" 
            @keydown.tab="tab"></textarea>
    </div>
    <p v-if="errorField" class="mt-2 text-sm text-red-500" :id="`${id}-error`">{{ errorField }}</p>
    <p v-else-if="help" class="mt-2 text-sm text-gray-500" :id="`${id}-description`">{{ help }}</p>
    <slot name="footer" :inputElement="txt" :id="id" :modelValue="modelValue" :status="status" v-bind="$attrs"></slot>
</div>
</template>

<script setup lang="ts">
import type { MarkdownInputProps, MarkdownInputEmits } from '@/components/types'
import { computed, inject, nextTick, onMounted, ref, getCurrentInstance } from 'vue'
import { filterClass, input } from "./css"
import { errorResponse, humanize, toPascalCase } from "@servicestack/client"
import type { ApiState, MarkdownInputOptions, ResponseStatus } from '@/types'
import { asOptions } from '@/use/utils'

const props = withDefaults(defineProps<MarkdownInputProps>(), {
    helpUrl: "https://guides.github.com/features/mastering-markdown/"
})

const emit = defineEmits<MarkdownInputEmits>()

type Item = { value:string, selectionStart?:number, selectionEnd?:number }

let history:Item[] = []
let redos:Item[] = []

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? (ctx as any)?.error.value }, props.id))
const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))

const allShow = 'bold,italics,link,image,blockquote,code,heading,orderedList,unorderedList,strikethrough,undo,redo,help'.split(',') as MarkdownInputOptions[]
const showOptions  = computed<{[k:string]:boolean}>(() => props.hide ? asOptions(allShow,props.hide)  : asOptions(allShow,[]))
function show(target:MarkdownInputOptions) { return showOptions.value[target] }


const cls = computed(() => filterClass(['shadow-sm font-mono' + input.base.replace('rounded-md',''), 
    errorField.value 
        ? 'text-red-900 focus:ring-red-500 focus:border-red-500 border-red-300'
        : 'text-gray-900 ' + input.valid, props.inputClass], 'MarkdownInput', props.filterClass))
const btnCls = "w-5 h-5 cursor-pointer select-none text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
  
const txt = ref()

defineExpose({ props, textarea:txt, updateModelValue, selection, hasSelection, selectionInfo, insert, replace })

function updateModelValue(value:string) {
    emit('update:modelValue', value)
}
function hasSelection() {
    return txt.value.selectionStart !== txt.value.selectionEnd
}
function selection() {
    const el = txt.value
    return el.value.substring(el.selectionStart, el.selectionEnd) || ''
}
function selectionInfo() {
    const el = txt.value;
    const value = el.value, selPos = el.selectionStart, sel = value.substring(selPos, el.selectionEnd) || '',
        beforeSel = value.substring(0, selPos), prevCRPos = beforeSel.lastIndexOf('\n');
    return {
        value,
        sel,
        selPos,
        beforeSel,
        afterSel: value.substring(selPos),
        prevCRPos,
        beforeCR: prevCRPos >= 0 ? beforeSel.substring(0, prevCRPos + 1) : '',
        afterCR: prevCRPos >= 0 ? beforeSel.substring(prevCRPos + 1) : '',
    }
}
function replace({ value, selectionStart, selectionEnd }:Item) {
    if (selectionEnd == null) {
        selectionEnd = selectionStart
    }
    updateModelValue(value)
    nextTick(() => {
        txt.value.focus()
        txt.value.setSelectionRange(selectionStart, selectionEnd)
    })
}
function insert(prefix:string, suffix:string, placeholder:string='', 
    { selectionAtEnd, offsetStart, offsetEnd, filterValue, filterSelection }
    :{ selectionAtEnd?:boolean, offsetStart?:number, offsetEnd?:number, filterValue?:Function, filterSelection?:Function } = {}) {
    const el = txt.value
    let value = el.value
    let pos = el.selectionEnd
    history.push({ value, selectionStart: el.selectionStart, selectionEnd: el.selectionEnd })
    redos = []
    const from = el.selectionStart, to = el.selectionEnd, len = to - from
    let beforeRange = value.substring(0, from)
    let afterRange = value.substring(to)
    const toggleOff = prefix && beforeRange.endsWith(prefix) && afterRange.startsWith(suffix)

    const noSelection = from == to
    if (noSelection) {
        if (!toggleOff) {
            value = beforeRange + prefix + placeholder + suffix + afterRange
            pos += prefix.length
            offsetStart = 0
            offsetEnd = placeholder?.length || 0
            if (selectionAtEnd) {
                pos += offsetEnd
                offsetEnd = 0
            }
        } else {
            value = beforeRange.substring(0, beforeRange.length - prefix.length) + afterRange.substring(suffix.length)
            pos += -suffix.length
        }
        if (filterValue) {
            var opt = { pos }
            value = filterValue(value, opt)
            pos = opt.pos
        }
    } else {
        var selectedText = value.substring(from, to)
        if (filterSelection) {
            selectedText = filterSelection(selectedText)
        }

        if (!toggleOff) {
            value = beforeRange + prefix + selectedText + suffix + afterRange

            if (offsetStart) {
                pos += (prefix + suffix).length
            } else {
                pos = from
                offsetStart = prefix.length
                offsetEnd = selectedText.length
            }
        } else {
            value = beforeRange.substring(0, beforeRange.length - prefix.length) + selectedText + afterRange.substring(suffix.length)
            offsetStart = -selectedText.length - prefix.length
            offsetEnd = selectedText.length
        }
    }

    updateModelValue(value)
    nextTick(() => {
        el.focus()
        offsetStart = pos + (offsetStart || 0)
        offsetEnd = (offsetStart || 0) + (offsetEnd || 0)
        el.setSelectionRange(offsetStart, offsetEnd)
    })
}
const bold = () => insert('**', '**', 'bold')
const italic = () => insert('_', '_', 'italics')
const strikethrough = () => insert('~~', '~~', 'strikethrough')
const link = () => insert('[', '](https://)', '', { offsetStart: -9, offsetEnd: 8 })
const quote = () => insert('\n> ', '\n', 'Blockquote', {})
const image = () => insert('![](', ')')
function code(e:MouseEvent|KeyboardEvent) {
    const sel = selection()
    if (sel && !e.shiftKey) {
        insert('`', '`', 'code')
    } else {
        const lang = props.lang || 'js'
        const partialSel = sel.indexOf('\n') === -1;
        if (partialSel) {
            insert('\n```' + lang + '\n', '\n```\n', '// code')
        } else {
            insert('```' + lang + '\n', '```\n', '')
        }
    }
}
function ol() {
    if (hasSelection()) {
        let { sel, selPos, beforeSel, afterSel, prevCRPos, beforeCR, afterCR } = selectionInfo()
        const partialSel = sel.indexOf('\n') === -1
        if (!partialSel) {
            const indent = !sel.startsWith(' 1. ')
            if (indent) {
                let index = 1
                insert('', '', ' - ', {
                    selectionAtEnd: true,
                    filterSelection: (v:string) => " 1. " + v.replace(/\n$/, '').replace(/\n/g, x => `\n ${++index}. `) + "\n"
                })
            } else {
                insert('', '', '', {
                    filterValue: (v:string, opt:any) => {
                        if (prevCRPos >= 0) {
                            let afterCRTrim = afterCR.replace(/^ - /, '')
                            beforeSel = beforeCR + afterCRTrim
                            opt.pos -= afterCR.length - afterCRTrim.length
                        }
                        return beforeSel + afterSel
                    },
                    filterSelection: (v:string) => v.replace(/^ 1. /g, '').replace(/\n \d+. /g, "\n")
                })
            }
        }
        else {
            insert('\n 1. ', '\n')
        }
    } else {
        insert('\n 1. ', '\n', 'List Item', { offsetStart: -10, offsetEnd: 9 })
    }
}
function ul() {
    if (hasSelection()) {
        let { sel, selPos, beforeSel, afterSel, prevCRPos, beforeCR, afterCR } = selectionInfo()
        const partialSel = sel.indexOf('\n') === -1
        if (!partialSel) {
            const indent = !sel.startsWith(' - ')
            if (indent) {
                insert('', '', ' - ', {
                    selectionAtEnd: true,
                    filterSelection: (v:string) => " - " + v.replace(/\n$/, '').replace(/\n/g, "\n - ") + "\n"
                })
            } else {
                insert('', '', '', {
                    filterValue: (v:string, opt:any) => {
                        if (prevCRPos >= 0) {
                            let afterCRTrim = afterCR.replace(/^ - /, '')
                            beforeSel = beforeCR + afterCRTrim
                            opt.pos -= afterCR.length - afterCRTrim.length
                        }
                        return beforeSel + afterSel
                    },
                    filterSelection: (v:string) => v.replace(/^ - /g, '').replace(/\n - /g, "\n")
                })
            }
        } else {
            insert('\n - ', '\n')
        }
    } else {
        insert('\n - ', '\n', 'List Item', { offsetStart: -10, offsetEnd: 9 })
    }
}
function heading() {
    const sel = selection(), partialSel = sel.indexOf('\n') === -1
    if (sel) {
        if (partialSel) {
            insert('\n## ', '\n', '')
        } else {
            insert('## ', '', '')
        }
    } else {
        insert('\n## ', '\n', 'Heading', { offsetStart: -8, offsetEnd: 7 })
    }
}
function comment() {
    let { sel, selPos, beforeSel, afterSel, prevCRPos, beforeCR, afterCR } = selectionInfo()
    const comment = !sel.startsWith('//') && !afterCR.startsWith('//')
    if (comment) {
        if (!sel) {
            replace({
                value: beforeCR + '//' + afterCR + afterSel,
                selectionStart: selPos + '//'.length
            })
        } else {
            insert('', '', '//', {
                selectionAtEnd: true,
                filterSelection: (v:string) => "//" + v.replace(/\n$/, '').replace(/\n/g, "\n//") + "\n"
            })
        }
    } else {
        insert('', '', '', {
            filterValue: (v:string, opt:any) => {
                if (prevCRPos >= 0) {
                    let afterCRTrim = afterCR.replace(/^\/\//, '');
                    beforeSel = beforeCR + afterCRTrim;
                    opt.pos -= afterCR.length - afterCRTrim.length;
                }
                return beforeSel + afterSel;
            },
            filterSelection: (v:string) => v.replace(/^\/\//g, '').replace(/\n\/\//g, "\n")
        })
    }
}
const blockComment = () => insert('/*\n', '*/\n', '')
function undo() {
    if (history.length === 0) return false
    const el = txt.value
    const lastState = history.pop()
    redos.push({ value: el.value, selectionStart: el.selectionStart, selectionEnd: el.selectionEnd })
    replace(lastState!)
    return true
}
function redo() {
    if (redos.length === 0) return false
    const el = txt.value
    const lastState = redos.pop()
    history.push({ value: el.value, selectionStart: el.selectionStart, selectionEnd: el.selectionEnd })
    replace(lastState!)
    return true
}
const tab = () => null //TODO

onMounted(() => {
    history = [], redos = [];
    const el = txt.value;

    el.onkeydown = (e:KeyboardEvent) => {
        if (e.key === "Escape" || e.keyCode === 27) {
            emit('close')
            return
        }

        const c = String.fromCharCode(e.keyCode).toLowerCase()
        if (c === '\t') { //tab: indent/unindent
            const indent = !e.shiftKey
            if (indent) {
                insert('', '', '    ', {
                    selectionAtEnd: true,
                    filterSelection: (v:string) => "    " + v.replace(/\n$/, '').replace(/\n/g, "\n    ") + "\n"
                })
            } else {
                insert('', '', '', {
                    filterValue: (v:string, opt:any) => {
                        let { selPos, beforeSel, afterSel, prevCRPos, beforeCR, afterCR } = selectionInfo()
                        if (prevCRPos >= 0) {
                            let afterCRTrim = afterCR.replace(/\t/g, '    ').replace(/^ ? ? ? ?/, '')
                            beforeSel = beforeCR + afterCRTrim
                            opt.pos -= afterCR.length - afterCRTrim.length
                        }
                        return beforeSel + afterSel
                    },
                    filterSelection: (v:string) => v.replace(/\t/g, '    ').replace(/^ ? ? ? ?/g, '').replace(/\n    /g, "\n")
                })
            }
            e.preventDefault()
        }
        else if (e.ctrlKey) {
            if (c === 'z') { //z: undo/redo
                if (!e.shiftKey) {
                    if (undo()) {
                        e.preventDefault()
                    }
                } else {
                    if (redo()) {
                        e.preventDefault()
                    }
                }
            } else if (c === 'b' && !e.shiftKey) { //b: bold
                bold()
                e.preventDefault()
            } else if (c === 'h' && !e.shiftKey) { //h: heading
                heading()
                e.preventDefault()
            } else if (c === 'i' && !e.shiftKey) { //i: italic
                italic()
                e.preventDefault()
            } else if (c === 'q' && !e.shiftKey) { //q: blockquote
                quote()
                e.preventDefault()
            } else if (c === 'k') { //l: link/image
                if (!e.shiftKey) {
                    link()
                    e.preventDefault()
                } else {
                    image()
                    e.preventDefault()
                }
            } else if ((c === ',' || e.key === '<' || e.key === '>' || e.keyCode === 188)) { //<>: code
                code(e)
                e.preventDefault()
            } else if (c === '/' || e.key === '/') {
                comment()
                e.preventDefault()
            } else if ((c === '?' || e.key === '?') && e.shiftKey) {
                blockComment()
                e.preventDefault()
            }
        }
        else if (e.altKey) {
            if (e.key === '1' || e.key === '0') {
                ol()
                e.preventDefault()
            } else if (e.key === '-') {
                ul()
                e.preventDefault()
            } else if (e.key === 's') {
                strikethrough()
                e.preventDefault()
            }
        }
    }
})
</script>
