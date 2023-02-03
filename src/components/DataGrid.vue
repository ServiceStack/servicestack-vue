<template>
<div v-if="items.length" ref="refResults" :class="gridClass">    
    <div :class="grid2Class">
        <div :class="grid3Class">
            <div :class="grid4Class">
                <table :class="tableClass">
                    <thead :class="tableHeadClass">
                        <tr :class="tableHeaderRowClass">
                            <td v-for="column in visibleColumns" @click="onHeaderSelected($event, column)" 
                                :class="[cellClass(column), tableHeaderCellClass, isOpen(column) ? 'text-gray-900 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400']">

                                <slot v-if="slots[column+'-header']" :name="column+'-header'" :column="column"></slot>
                                <div v-else-if="!allowFiltering" class="flex justify-between items-center">
                                    <span class="mr-1 select-none">
                                        {{ headerFormat(column) }}
                                    </span>
                                </div>
                                <div v-else class="flex justify-between items-center hover:text-gray-900 dark:hover:text-gray-50">
                                    <span class="mr-1 select-none">
                                        {{ headerFormat(column) }}
                                    </span>
                                    <SettingsIcons :column="column" :isOpen="isOpen(column)" />
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody :class="tableBodyClass">
                        <tr v-for="(item,i) in items" :class="getTableRowClass(item,i)" @click="onRowSelected($event, i, item)">
                            <td v-for="column in visibleColumns" :class="[cellClass(column), Css.grid.tableCellClass]">
                                <slot v-if="slots[column]" :name="column" v-bind="item"></slot>
                                <PreviewFormat v-else :value="item[column]" :format="columnFormat(column)" />
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
import type { MetadataType, TableStyleOptions } from '@/types'
import { Css } from './css'
import { computed, ref, useSlots } from 'vue'
import { humanify, map, uniqueKeys } from '@servicestack/client'
import { useAppMetadata } from '@/use/metadata'

const props = withDefaults(defineProps<{
    items: any[]
    type?: string|MetadataType
    tableStyle?: TableStyleOptions
    selectedColumns?:string[]
    gridClass?: string
    grid2Class?: string
    grid3Class?: string
    grid4Class?: string
    tableClass?: string
    tableHeadClass?: string
    tableBodyClass?: string
    tableHeaderRowClass?: string
    tableHeaderCellClass?: string
    isSelected?:(row:any) => boolean
    isHeaderSelected?:(column:string) => boolean
    allowFiltering?:boolean
    headerTitle?:(name:string) => string
    headerTitles?: {[name:string]:string}
    visibleFrom?: {[name:string]:"xs"|"sm"|"md"|"lg"|"xl"|"2xl"}
    rowClass?:(model:any,i:number) => string
}>(), {
    items: () => [],
    tableStyle: "stripedRows",
})

const emit = defineEmits<{
    (e: "headerSelected", name:string): void
    (e: "rowSelected", item:any): void
}>()

const refResults = ref<HTMLDivElement|null>()
const showFilters = ref<string|null>(null)
const isOpen = (column:string) => showFilters.value === column
const selectedIndex = ref<number|null>()

const slots = useSlots()
const columnSlots = computed(() => uniqueKeys(props.items).filter(k => !!(slots[k] || slots[k+'-header'])))

const { typeOf, typeProperties } = useAppMetadata()
const metaType = computed(() => typeof props.type == 'string' ? typeOf(props.type) : props.type)
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

const allowFiltering = false //AllowFiltering && column.AllowFiltering && !TextUtils.IsComplexType(column.FieldType) && !column.IsComputed;

const gridClass = computed(() => Css.grid.getGridClass(props.tableStyle))
const grid2Class = computed(() => Css.grid.getGrid2Class(props.tableStyle))
const grid3Class = computed(() => Css.grid.getGrid3Class(props.tableStyle))
const grid4Class = computed(() => Css.grid.getGrid4Class(props.tableStyle))
const tableClass = computed(() => Css.grid.getTableClass(props.tableStyle))
const tableHeadClass = computed(() => Css.grid.getTableHeadClass(props.tableStyle))
const tableHeaderRowClass = computed(() => Css.grid.getTableHeaderRowClass(props.tableStyle))
const tableHeaderCellClass = computed(() => Css.grid.getTableHeaderCellClass(props.tableStyle) + 
    (props.isHeaderSelected != null || props.allowFiltering ? ' cursor-pointer' : ''))

function getTableRowClass(item:any, i:number) {
    return Css.grid.getTableRowClass(props.tableStyle, i, props.isSelected && props.isSelected(item) ? true : false, props.isSelected != null)
}

const visibleColumns = computed(() => props.selectedColumns || (columnSlots.value.length > 0 ? columnSlots.value : uniqueKeys(props.items)))

function onHeaderSelected(e:Event, column:string) {
    emit('headerSelected', column)
}

function onRowSelected(e:Event, i:number, row:any) {
    emit('rowSelected', row)
}
</script>