<template>
<div :class="depth == 0 ? 'prose html-format' : ''">
    <div v-if="isScalar" v-html="formatValue(value)"></div>
    <div v-else-if="isArray" :class="classes('array','div',depth,grid.gridClass)">
        <div v-if="isPrimitive(value[0])">[ {{ value.join(', ')}} ]</div>
        <div v-else :class="classes('array','div',depth, grid.grid2Class)">
            <div :class="classes('array','div',depth, grid.grid3Class)">
                <div :class="classes('array','div',depth, grid.grid4Class)">
                    <table :class="classes('object','table',depth, grid.tableClass)">
                        <thead :class="classes('array','thead',depth, grid.theadClass)">
                        <tr>
                            <th v-for="k in fields" :class="classes('array','th',depth, grid.theadCellClass + ' whitespace-nowrap')">
                                <b></b>{{keyFmt(k)}}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row,index) in value" :class="classes('array','tr',depth,index % 2 == 0 ? 'bg-white' : 'bg-gray-50',index)">
                                <td v-for="k in fields" :class="classes('array','td',depth, grid.tableCellClass)">
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
                <th :class="classes('object','th',depth, 'align-top py-2 px-4 text-left text-sm font-medium tracking-wider whitespace-nowrap')">{{row.key}}</th>
                <td :class="classes('object','td',depth, 'align-top py-2 px-4 text-sm')">
                    <HtmlFormat :value="row.val" :field-attrs="fieldAttrs" :depth="depth+1" :classes="classes" v-bind="getAttrs(row.key)" />
                </td>
            </tr>
        </table>
    </div>
</div>
</template>

<script setup lang="ts">
import type { HtmlFormatProps } from '@/components/types'
import { computed } from 'vue'
import { humanify, uniqueKeys } from '@servicestack/client'
import { isPrimitive } from '@/use/utils'
import { formatValue } from '@/use/formatters'
import { grid } from '../components/css'

const props = withDefaults(defineProps<HtmlFormatProps>(), {
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
const rows = (val:any) => val ? Object.keys(val).map(k => ({ key:keyFmt(k), val: val[k] })) : []
</script>
