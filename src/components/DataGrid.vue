<template>
<div v-if="items.length" ref="refResults" :class="gridClass">
    <div :class="grid2Class">
        <div :class="grid3Class">
            <div :class="grid4Class">
                <table :class="tableClass">
                    <thead :class="tableHeadClass">
                        <tr :class="tableHeaderRowClass">
                            <td v-for="column in visibleColumns" 
                                :class="[tableHeaderCellClass, isOpen(column) ? 'text-gray-900 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400']">

                                <div v-if="!allowFiltering" class="flex justify-between items-center">
                                    <span class="mr-1 select-none">
                                        {{ headerLabel(column) }}
                                    </span>
                                </div>
                                <div v-else @click="onHeaderSelected($event, column)" class="flex justify-between items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-50">
                                    <span class="mr-1 select-none">
                                        {{ headerLabel(column) }}
                                    </span>
                                    <SettingsIcons :column="column" :isOpen="isOpen(column)" />
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody :class="tableBodyClass">
                        <tr v-for="(item,i) in items" :class="getTableRowClass(item,i)" @click="onRowSelected($event, item)">
                            <td v-for="column in visibleColumns" :class="Css.grid.tableCellClass">
                                <PreviewFormat :value="item[column]" />
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
import type { TableStyleOptions } from '@/api'
import { computed, ref } from 'vue'
import { humanify, uniqueKeys } from '@servicestack/client'
import { Css } from '@/api'

const props = withDefaults(defineProps<{
    items?: any[]
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
    allowSelection?: boolean
    allowFiltering?:boolean
    headerLabel?:(name:string) => string
    rowClass?:(model:any,i:number) => string
}>(), {
    items: () => [],
    tableStyle: "stripedRows",
    headerLabel: humanify,
    allowSelection: true,
    allowFiltering: false,
})

const emit = defineEmits<{
    (e: "headerSelected", name:string): void
    (e: "rowSelected", item:any): void
}>()

const refResults = ref<HTMLDivElement|null>()
const showFilters = ref<string|null>(null)
const isOpen = (column:string) => showFilters.value === column
const selectedItem = ref<any|null>()

const allowFiltering = false //AllowFiltering && column.AllowFiltering && !TextUtils.IsComplexType(column.FieldType) && !column.IsComputed;

const gridClass = computed(() => Css.grid.getGridClass(props.tableStyle))
const grid2Class = computed(() => Css.grid.getGrid2Class(props.tableStyle))
const grid3Class = computed(() => Css.grid.getGrid3Class(props.tableStyle))
const grid4Class = computed(() => Css.grid.getGrid4Class(props.tableStyle))
const tableClass = computed(() => Css.grid.getTableClass(props.tableStyle))
const tableHeadClass = computed(() => Css.grid.getTableHeadClass(props.tableStyle))
const tableHeaderRowClass = computed(() => Css.grid.getTableHeaderRowClass(props.tableStyle))
const tableHeaderCellClass = computed(() => Css.grid.getTableHeaderCellClass(props.tableStyle))

function getTableRowClass(item:any, i:number) {
    return Css.grid.getTableRowClass(props.tableStyle, i, selectedItem.value === item, props.allowSelection)
}

const visibleColumns = computed(() => props.selectedColumns || uniqueKeys(props.items))

function onHeaderSelected(e:Event, column:string) {
    emit('headerSelected', column)
}

function onRowSelected(e:Event, row:any) {
    selectedItem.value = row === selectedItem.value ? null : row
    emit('rowSelected', selectedItem.value)
}
</script>