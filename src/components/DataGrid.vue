<template>
<div v-if="items.length" ref="refResults" :class="gridClass">    
    <div :class="grid2Class">
        <div :class="grid3Class">
            <div :class="grid4Class">
                <table :class="tableClass">
                    <thead :class="theadClass">
                        <tr :class="theadRowClass">
                            <td v-for="column in visibleColumns"
                                :class="[cellClass(column), theadCellClass, isOpen(column) ? 'text-gray-900 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400']">

                                <div @click="onHeaderSelected($event, column)">
                                    <slot v-if="slots[column+'-header']" :name="column+'-header'" :column="column"></slot>
                                    <slot v-else-if="slotHeader(column)" :name="slotHeader(column)" :column="column"></slot>
                                    <slot v-else-if="slots.header" name="header" :column="column" :label="headerFormat(column)"></slot>
                                    <div v-else class="flex justify-between items-center">
                                        <span class="mr-1 select-none">
                                            {{ headerFormat(column) }}
                                        </span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody :class="tbodyClass">
                        <tr v-for="(item,i) in items" :class="getTableRowClass(item,i)" :style="getTableRowStyle(item,i)" @click="onRowSelected($event, i, item)">
                            <td v-for="column in visibleColumns" :class="[cellClass(column), grid.tableCellClass]">
                                <slot v-if="slots[column]" :name="column" v-bind="item"></slot>
                                <slot v-else-if="slotColumn(column)" :name="slotColumn(column)" v-bind="item"></slot>
                                <PreviewFormat v-else :value="mapGet(item,column)" :format="columnFormat(column)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">

import type { Breakpoint, TableStyleOptions } from '@/types'
import { grid } from './css'
import { computed, ref, useSlots, type StyleValue } from 'vue'
import { humanify, map, uniqueKeys, mapGet } from '@servicestack/client'
import { useMetadata } from '@/use/metadata'
import { getTypeName } from '@/use/utils'

const props = withDefaults(defineProps<{
    items: any[]
    id?: string
    type?: string|InstanceType<any>|Function
    tableStyle?: TableStyleOptions
    selectedColumns?:string[]|string
    gridClass?: string
    grid2Class?: string
    grid3Class?: string
    grid4Class?: string
    tableClass?: string
    theadClass?: string
    tbodyClass?: string
    theadRowClass?: string
    theadCellClass?: string
    isSelected?:(row:any) => boolean
    headerTitle?:(name:string) => string
    headerTitles?: {[name:string]:string}
    visibleFrom?: {[name:string]:Breakpoint}
    rowClass?:(model:any,i:number) => string
    rowStyle?:(model:any,i:number) => StyleValue | undefined
}>(), {
    id: 'DataGrid',
    items: () => [],
    tableStyle: "stripedRows",
})

const emit = defineEmits<{
    (e:"headerSelected", name:string, ev:Event): void
    (e:"rowSelected", item:any, ev:Event): void
}>()

const refResults = ref<HTMLDivElement|null>()
const showFilters = ref<string|null>(null)
const isOpen = (column:string) => showFilters.value === column

const slots = useSlots()
const slotHeader = (column:string) => Object.keys(slots).find(x => x.toLowerCase() == column.toLowerCase()+'-header')
const slotColumn = (column:string) => Object.keys(slots).find(x => x.toLowerCase() == column.toLowerCase())
const columnSlots = computed(() => uniqueKeys(props.items).filter(k => !!(slots[k] || slots[k+'-header'])))

const { typeOf, typeProperties } = useMetadata()
const typeName = computed(() => getTypeName(props.type))
const metaType = computed(() => typeOf(typeName.value))
const typeProps = computed(() => typeProperties(metaType.value))

function headerFormat(column:string) {
    const title = props.headerTitles && props.headerTitles[column] || column
    return props.headerTitle 
        ? props.headerTitle(title)
        : humanify(title)
}

function columnFormat(column:string) {
    const columnLower = column.toLowerCase()
    const prop = typeProps.value.find(x => x.name.toLowerCase() == columnLower)
    if (prop?.format)
        return prop.format
    if (prop?.type == 'TimeSpan' || prop?.type == 'TimeOnly')
        return { method:'time' }
    return null
}

const cellBreakpoints = { 
    xs:'xs:table-cell',
    sm:'sm:table-cell',
    md:'md:table-cell',
    lg:'lg:table-cell',
    xl:'xl:table-cell',
    '2xl':'2xl:table-cell',
}
function cellClass(column:string) {
    const breakpoint = props.visibleFrom && props.visibleFrom[column]
    return breakpoint && map(cellBreakpoints[breakpoint], cls => `hidden ${cls}`)
}

const gridClass = computed(() => grid.getGridClass(props.tableStyle))
const grid2Class = computed(() => grid.getGrid2Class(props.tableStyle))
const grid3Class = computed(() => grid.getGrid3Class(props.tableStyle))
const grid4Class = computed(() => grid.getGrid4Class(props.tableStyle))
const tableClass = computed(() => grid.getTableClass(props.tableStyle))
const theadClass = computed(() => grid.getTheadClass(props.tableStyle))
const theadRowClass = computed(() => grid.getTheadRowClass(props.tableStyle))
const theadCellClass = computed(() => grid.getTheadCellClass(props.tableStyle))

function getTableRowClass(item:any, i:number) {
    return props.rowClass 
        ? props.rowClass(item, i)
        : grid.getTableRowClass(props.tableStyle, i, props.isSelected && props.isSelected(item) ? true : false, props.isSelected != null)
}
function getTableRowStyle(item:any, i:number) {
    return props.rowStyle
        ? props.rowStyle(item,i)
        : undefined
}

const visibleColumns = computed(() => (typeof props.selectedColumns == 'string' ? props.selectedColumns.split(',') : props.selectedColumns) || 
    (columnSlots.value.length > 0 ? columnSlots.value : uniqueKeys(props.items)))

function onHeaderSelected(e:Event, column:string) {
    emit('headerSelected', column, e)
}

function onRowSelected(e:Event, i:number, row:any) {
    emit('rowSelected', row, e)
}
</script>