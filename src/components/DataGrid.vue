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
                                <CellFormat v-else-if="columnProp(column)" :type="metaType" :propType="columnProp(column)" :modelValue="item" />
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

import type { Breakpoint, FormatInfo, MetadataPropertyType } from '@/types'
import type { DataGridProps, DataGridEmits } from '@/components/types'

import { form, grid } from './css'
import { computed, ref, useSlots, type Slots, type StyleValue } from 'vue'
import { humanify, map, uniqueKeys, mapGet } from '@servicestack/client'
import { useMetadata } from '@/use/metadata'
import { getTypeName } from '@/use/utils'

const props = withDefaults(defineProps<DataGridProps>(), {
    id: 'DataGrid',
    items: () => [],
    tableStyle: "stripedRows",
})

const emit = defineEmits<DataGridEmits>()

const refResults = ref<HTMLDivElement|null>()
const showFilters = ref<string|null>(null)
const isOpen = (column:string) => showFilters.value === column

const slots:Slots = useSlots()
const slotHeader = (column:string) => Object.keys(slots).find(x => x.toLowerCase() == column.toLowerCase()+'-header')
const slotColumn = (column:string) => Object.keys(slots).find(x => x.toLowerCase() == column.toLowerCase())
const columnSlots = computed(() => uniqueKeys(props.items).filter(k => !!(slots[k] || slots[k+'-header'])))

const { typeOf, typeProperties } = useMetadata()
const typeName = computed(() => getTypeName(props.type))
const metaType = computed(() => typeOf(typeName.value))
const typeProps = computed(() => typeProperties(metaType.value))

function headerFormat(column:string) {
    const title = props.headerTitles && mapGet(props.headerTitles,column) || column
    return props.headerTitle 
        ? props.headerTitle(title)
        : humanify(title)
}

function columnProp(column:string) {
    const columnLower = column.toLowerCase()
    return typeProps.value.find(x => x.name.toLowerCase() == columnLower)
}

function columnFormat(column:string) {
    const prop = columnProp(column)
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
    never:'',
}
function cellClass(column:string) {
    const breakpoint = props.visibleFrom && mapGet(props.visibleFrom,column) as Breakpoint
    return breakpoint && map(cellBreakpoints[breakpoint], cls => `hidden ${cls}`)
}

const gridClass = computed(() => props.gridClass ?? grid.getGridClass(props.tableStyle))
const grid2Class = computed(() => props.grid2Class ?? grid.getGrid2Class(props.tableStyle))
const grid3Class = computed(() => props.grid3Class ?? grid.getGrid3Class(props.tableStyle))
const grid4Class = computed(() => props.grid4Class ?? grid.getGrid4Class(props.tableStyle))
const tableClass = computed(() => props.tableClass ?? grid.getTableClass(props.tableStyle))
const tbodyClass = computed(() => props.tbodyClass ?? grid.getTbodyClass(props.tbodyClass))
const theadClass = computed(() => props.theadClass ?? grid.getTheadClass(props.tableStyle))
const theadRowClass = computed(() => props.theadRowClass ?? grid.getTheadRowClass(props.tableStyle))
const theadCellClass = computed(() => props.theadCellClass ?? grid.getTheadCellClass(props.tableStyle))

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

const visibleColumns = computed(() => {
    const ret = (typeof props.selectedColumns == 'string' ? props.selectedColumns.split(',') : props.selectedColumns) || 
        (columnSlots.value.length > 0 ? columnSlots.value : uniqueKeys(props.items))
    
    const formatMap = typeProps.value.reduce((acc:{[k:string]:FormatInfo|undefined},x:MetadataPropertyType) => 
        { acc[x.name!.toLowerCase()] = x.format; return acc }, {})
    return ret.filter(x => formatMap[x.toLowerCase()]?.method != 'hidden')
})

function onHeaderSelected(e:Event, column:string) {
    emit('headerSelected', column, e)
}

function onRowSelected(e:Event, i:number, row:any) {
    emit('rowSelected', row, e)
}
</script>