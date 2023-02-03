<template>
<div :class="depth == 0 ? 'prose html-format' : ''">
    <div v-if="isScalar" v-html="formatValue(value)"></div>
    <div v-else-if="isArray" :class="classes('array','div',depth,'flex flex-col')">
        <div :class="classes('array','div',depth,'-my-2 sm:-mx-6 lg:-mx-8')">
            <div :class="classes('array','div',depth,'py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8')">
                <div :class="classes('array','div',depth,'md:shadow overflow-hidden border-b border-gray-200 md:rounded-lg')">
                    <table :class="classes('object','table',depth,'table-array min-w-full divide-y divide-gray-200')">
                        <thead :class="classes('array','thead',depth,'bg-gray-50')">
                        <tr>
                            <th v-for="k in fields" :class="classes('array','th',depth,'px-6 py-3 text-left tracking-wider whitespace-nowrap text-sm text-gray-500 font-medium')">
                                <b></b>{{keyFmt(k)}}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row,index) in value" :class="classes('array','tr',depth,index % 2 == 0 ? 'bg-white' : 'bg-gray-50',index)">
                                <td v-for="k in fields" :class="classes('array','td',depth,'px-6 py-4 whitespace-nowrap text-sm text-gray-900')">
                                    <HtmlFormat :value="row[k]" :field-attrs="fieldAttrs" :depth="depth+1" :classes="classes" v-bind="getAttrs(k)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <table :class="classes('object','table',depth,'table-object')">
            <tr v-for="row in rows(value)" :class="classes('object','tr',depth,'')">
                <th :class="classes('object','th',depth,'text-left font-medium align-top py-2 px-4 whitespace-nowrap')">{{row.key}}</th>
                <td :class="classes('object','td',depth,'align-top py-2 px-4')">
                    <HtmlFormat :value="row.val" :field-attrs="fieldAttrs" :depth="depth+1" :classes="classes" v-bind="getAttrs(row.key)" />
                </td>
            </tr>
        </table>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { humanify, uniqueKeys } from '@servicestack/client'
import { isPrimitive } from '@/use/utils'
import { formatValue } from '@/use/formatters'

const props = withDefaults(defineProps<{
    value?: any,
    depth?: number
    fieldAttrs?: (k:string) => any
    classes?: (type:'object'|'array',tag:'div'|'table'|'thead'|'th'|'tr'|'td',depth:number,cls:string,index?:number) => string
}>(), {
    depth: 0,
    classes: (type:'object'|'array',tag:'div'|'table'|'thead'|'th'|'tr'|'td',depth:number,cls:string,index?:number) => {
        return cls
    }
})

const isScalar = computed(() => isPrimitive(props.value))
const isArray = computed(() => Array.isArray(props.value))
const keyFmt = (s:string) => humanify(s)
const getAttrs = (k:string) => props.fieldAttrs ? props.fieldAttrs(k) : null
const fields = computed(() => uniqueKeys(props.value))
const rows = (val:any) => Object.keys(val).map(k => ({ key:keyFmt(k), val: val[k] }))
</script>
