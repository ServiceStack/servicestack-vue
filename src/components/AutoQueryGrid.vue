<template>
<div v-if="invalidState">
    <Alert v-html="invalidState" />
</div>
<div v-else-if="invalidAccess">
    <EnsureAccess :invalid-access="invalidAccess" />
</div>
<div v-else class="pt-1">
    <div v-if="create && apis.Create">
        <EnsureAccessDialog v-if="invalidCreateAccess" :invalid-access="invalidCreateAccess" />
        <slot v-else-if="slots.createForm" name="createForm" :done="createDone" :save="createSave"></slot>
        <AutoCreateForm v-else :type="apis.Create.request.name" @done="createDone" @save="createSave" />
    </div>
    <div v-else-if="edit && apis.AnyUpdate">
        <EnsureAccessDialog v-if="invalidUpdateAccess" :invalid-access="invalidUpdateAccess" />
        <slot v-else-if="slots.editForm" name="editForm" :done="editDone" :save="editSave"></slot>
        <AutoCreateForm v-else :type="apis.AnyUpdate.request.name" @done="editDone" @save="editSave" />
    </div>
    <slot v-if="slots.toolbar" name="toolbar"></slot>
    <div v-else-if="showToolbar">
        <QueryPrefs v-if="showQueryPrefs" :columns="viewModelColumns" :prefs="apiPrefs" @done="showQueryPrefs=false" @save="saveApiPrefs" />
        <div class="pl-1 pt-1 flex flex-wrap">
            <div class="flex pb-1 sm:pb-0">
                <button v-if="showPreferences" type="button" class="pl-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" :title="`${dataModelName} Preferences`" @click="showQueryPrefs=!showQueryPrefs">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-width="1.5" fill="none"><path d="M9 3H3.6a.6.6 0 0 0-.6.6v16.8a.6.6 0 0 0 .6.6H9M9 3v18M9 3h6M9 21h6m0-18h5.4a.6.6 0 0 1 .6.6v16.8a.6.6 0 0 1-.6.6H15m0-18v18" stroke="currentColor" /></g></svg>
                </button>

                <button v-if="showPagingNav" type="button" :class="['pl-2', canFirst ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="First page" :disabled="!canFirst" @click="skipTo(-total)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6l6 6zM6 6h2v12H6z" fill="currentColor" /></svg>
                </button>
                <button v-if="showPagingNav" type="button" :class="['pl-2', canPrev ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="Previous page" :disabled="!canPrev" @click="skipTo(-take)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z" fill="currentColor" /></svg>
                </button>
                <button v-if="showPagingNav" type="button" :class="['pl-2', canNext ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="Next page" :disabled="!canNext"  @click="skipTo(take)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" /></svg>
                </button>
                <button v-if="showPagingNav" type="button" :class="['pl-2', canLast ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="Last page" :disabled="!canLast" @click="skipTo(total)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6l-6-6zM16 6h2v12h-2z" fill="currentColor" /></svg>
                </button>
            </div>

            <div v-if="showPagingInfo" class="flex pb-1 sm:pb-0">
                <div class="px-4 text-lg text-black dark:text-white">
                    <span v-if="apiLoading">Querying...</span>
                    <span v-if="results.length">
                        <span class="hidden xl:inline">
                            Showing Results
                        </span> 
                        {{skip + 1}} - {{Math.min(skip + results.length, total)}} <span> of {{ total }}</span>
                    </span>
                    <span v-else-if="api.completed">No Results</span>
                </div>
            </div>

            <div class="flex pb-1 sm:pb-0">

                <div v-if="showRefresh" class="pl-2">
                    <button type="button" @click="refresh" title="Refresh" :class="toolbarButtonClass">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 20v-5h-5M4 4v5h5m10.938 2A8.001 8.001 0 0 0 5.07 8m-1.008 5a8.001 8.001  0 0 0 14.868 3" /></svg>
                    </button>
                </div>

                <div v-if="showDownloadCsv" class="pl-2">
                    <button type="button" @click="downloadCsv" title="Download CSV" :class="toolbarButtonClass">
                        <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M28.781 4.405h-10.13V2.018L2 4.588v22.527l16.651 2.868v-3.538h10.13A1.162 1.162 0 0 0 30 25.349V5.5a1.162 1.162 0 0 0-1.219-1.095zm.16 21.126H18.617l-.017-1.889h2.487v-2.2h-2.506l-.012-1.3h2.518v-2.2H18.55l-.012-1.3h2.549v-2.2H18.53v-1.3h2.557v-2.2H18.53v-1.3h2.557v-2.2H18.53v-2h10.411z" fill="#20744a" fill-rule="evenodd" /><path fill="#20744a" d="M22.487 7.439h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 10.94h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 14.441h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 17.942h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 21.443h4.323v2.2h-4.323z" /><path fill="#fff" fill-rule="evenodd" d="M6.347 10.673l2.146-.123l1.349 3.709l1.594-3.862l2.146-.123l-2.606 5.266l2.606 5.279l-2.269-.153l-1.532-4.024l-1.533 3.871l-2.085-.184l2.422-4.663l-2.238-4.993z" /></svg>
                        <span class="text-green-900 dark:text-green-100">Excel</span>
                    </button>
                </div>

                <div v-if="showCopyApiUrl" class="pl-2">
                    <button type="button" @click="copyApiUrl" title="Copy API URL" :class="toolbarButtonClass">
                        <svg v-if="copiedApiUrl" class="w-5 h-5 mr-1 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <svg v-else class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></g></svg>
                        <span>Copy URL</span>
                    </button>
                </div>

                <div v-if="hasPrefs && showResetPreferences" class="pl-2">
                    <button type="button" @click="resetPreferences" title="Reset Preferences & Filters" :class="toolbarButtonClass">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M6.78 2.72a.75.75 0 0 1 0 1.06L4.56 6h8.69a7.75 7.75 0 1 1-7.75 7.75a.75.75 0 0 1 1.5 0a6.25 6.25 0 1 0 6.25-6.25H4.56l2.22 2.22a.75.75 0 1 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Z" /></svg>
                    </button>
                </div>

                <div v-if="showFiltersView && filtersCount > 0" class="pl-2">
                    <button type="button" @click="open = open == 'filters' ? null : 'filters'" :class="toolbarButtonClass" aria-expanded="false">
                        <svg class="flex-none w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
                        </svg>
                        <span class="mr-1">
                            {{filtersCount}} {{filtersCount == 1 ? "Filter" : "Filters"}}
                        </span>
                        <svg v-if="open != 'filters'" class="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else class="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                <div v-if="showNewItem && apis.Create" class="pl-2">
                    <button type="button" @click="onShowNewItem" :title="dataModelName" :class="toolbarButtonClass">
                        <svg class="w-5 h-5 mr-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"></path></svg>
                        <span>New {{ dataModelName }}</span>
                    </button>
                </div>

                <slot v-if="slots.toolbarButtons" name="toolbarButtons"></slot>
            </div>

        </div>
    </div>

    <FilterViews v-if="open == 'filters'" class="border-y border-gray-200 dark:border-gray-800 py-8 my-2" 
       :definitions="definitions" :columns="columns" @done="open = null" @change="filtersChanged" />

    <ErrorSummary v-if="editApi.error ?? api.error" :status="editApi.error ?? api.error" />
    <Loading v-else-if="apiLoading" />

    <div v-if="showFilters">
        <FilterColumn :definitions="definitions" :column="showFilters.column" :top-left="showFilters.topLeft" @done="onFilterDone" @save="onFilterSave" />
    </div>

    <div v-if="results.length">
        <DataGrid :id="id" :items="results" :type="type" :selected-columns="filteredColumns"
            @filters-changed="update"
            :tableStyle="tableStyle" :gridClass="gridClass" :grid2Class="grid2Class" :grid3Class="grid3Class" :grid4Class="grid4Class"
            :tableClass="tableClass" :tableHeadClass="tableHeadClass" :tableHeaderRowClass="tableHeaderRowClass" :tableHeaderCellClass="tableHeaderCellClass" :tableBodyClass="tableBodyClass"
            @row-selected="onRowSelected" @header-selected="onHeaderSelected" :maxFieldLength="maxFieldLength">

            <template #header="{ column, label }">
                <div v-if="allowFiltering && column.allowFiltering !== false" class="cursor-pointer flex justify-between items-center hover:text-gray-900 dark:hover:text-gray-50">
                    <span class="mr-1 select-none">
                        {{ label }}
                    </span>
                    <SettingsIcons :column="columns.find(x => x.name.toLowerCase() === column.toLowerCase())" :is-open="showFilters?.column.name === column" />
                </div>
                <div v-else class="flex justify-between items-center">
                    <span class="mr-1 select-none">{{ label }}</span>
                </div>
            </template>

            <template v-for="slot in (Object.keys(slots) as any)" #[slot]="scope">
                <slot :name="slot" v-bind="scope"></slot>
            </template>

        </DataGrid>
    </div>

</div>
</template>

<script setup lang="ts">
import type { ApiPrefs, ApiResponse, AutoQueryConvention, AutoQueryGridDefaults, Column, ColumnSettings, Filter, TableStyleOptions } from '@/types'
import { computed, inject, nextTick, onMounted, ref, useAttrs, useSlots, type ComputedRef } from 'vue'
import { ApiResult, appendQueryString, combinePaths, delaySet, JsonServiceClient, leftPart, mapGet, queryString, rightPart, uniqueKeys } from '@servicestack/client'
import { Apis, createDto, getPrimaryKey, getPrimaryKeyByProps, typeProperties, useMetadata } from '@/use/metadata'
import { Css } from './css'
import { getTypeName, parseJson } from '@/use/utils'
import { useAuth } from '@/use/auth'
import EnsureAccess from './EnsureAccess.vue'

import FilterColumn from './grids/FilterColumn.vue'
import FilterViews from './grids/FilterViews.vue'
import QueryPrefs from './grids/QueryPrefs.vue'
import { useConfig } from '@/use/config'
import ErrorSummary from './ErrorSummary.vue'
import Loading from './Loading.vue'

//slots: toolbar, toolbarButtons, createForm, editForm

const { config, autoQueryGridDefaults } = useConfig()
const aqd = autoQueryGridDefaults
const client:JsonServiceClient = inject('client')!
const storage = config.value.storage!

const props = withDefaults(defineProps<{
    filterDefinitions?: AutoQueryConvention[]
    id?: string
    apis?: string|string[]
    type?: string|InstanceType<any>|Function
    prefs?: ApiPrefs

    allowSelection?: boolean|null
    allowFiltering?: boolean|null
    allowQueryFilters?: boolean|null
    showToolbar?: boolean|null
    showPreferences?: boolean|null
    showPagingNav?: boolean|null
    showPagingInfo?: boolean|null
    showDownloadCsv?: boolean|null
    showRefresh?: boolean|null
    showCopyApiUrl?: boolean|null
    showResetPreferences?: boolean|null
    showFiltersView?: boolean|null
    showNewItem?: boolean|null
    maxFieldLength?: number|null
    
    selectedColumns?:string[]|string
    toolbarButtonClass?: string
    tableStyle?: TableStyleOptions
    gridClass?: string
    grid2Class?: string
    grid3Class?: string
    grid4Class?: string
    tableClass?: string
    tableHeadClass?: string
    tableBodyClass?: string
    tableHeaderRowClass?: string
    tableHeaderCellClass?: string

    apiPrefs?: ApiPrefs
    disableKeyBindings?:(column:string) => boolean
    skip?: number
    new?: boolean
    edit?: string
}>(), {
    id: 'AutoQueryGrid',
    skip: 0,
    allowSelection: null,
    allowFiltering: null,
    allowQueryFilters: null,
    showToolbar: null,
    showPreferences: null,
    showPagingNav: null,
    showPagingInfo: null,
    showDownloadCsv: null,
    showRefresh: null,
    showCopyApiUrl: null,
    showResetPreferences: null,
    showFiltersView: null,
    showNewItem: null,
    maxFieldLength: null,
})

const emit = defineEmits<{
    (e: "headerSelected", name:string, ev:Event): void
    (e: "rowSelected", item:any, ev:Event): void
}>()

const bool = (value:boolean|undefined|null, orElse:boolean|undefined) => typeof value == 'boolean' ? value : orElse || false

const allowSelection = computed(() => bool(props.allowSelection, aqd.value.allowSelection))
const allowFiltering = computed(() => bool(props.allowFiltering, aqd.value.allowFiltering))
const allowQueryFilters = computed(() => bool(props.allowQueryFilters, aqd.value.allowQueryFilters))
const showToolbar = computed(() => bool(props.showToolbar, aqd.value.showToolbar))
const showPreferences = computed(() => bool(props.showPreferences, aqd.value.showPreferences))
const showPagingNav = computed(() => bool(props.showPagingNav, aqd.value.showPagingNav))
const showPagingInfo = computed(() => bool(props.showPagingInfo, aqd.value.showPagingInfo))
const showDownloadCsv = computed(() => bool(props.showDownloadCsv, aqd.value.showDownloadCsv))
const showRefresh = computed(() => bool(props.showRefresh, aqd.value.showRefresh))
const showCopyApiUrl = computed(() => bool(props.showCopyApiUrl, aqd.value.showCopyApiUrl))
const showResetPreferences = computed(() => bool(props.showResetPreferences, aqd.value.showResetPreferences))
const showFiltersView = computed(() => bool(props.showFiltersView, aqd.value.showFiltersView))
const showNewItem = computed(() => bool(props.showNewItem, aqd.value.showNewItem))
const maxFieldLength = computed(() => props.maxFieldLength ?? aqd.value.maxFieldLength)

const tableStyle = computed(() => props.tableStyle ?? aqd.value.tableStyle)
const gridClass = computed(() => props.gridClass ?? Css.grid.getGridClass(tableStyle.value))
const grid2Class = computed(() => props.grid2Class ?? Css.grid.getGrid2Class(tableStyle.value))
const grid3Class = computed(() => props.grid3Class ?? Css.grid.getGrid3Class(tableStyle.value))
const grid4Class = computed(() => props.grid4Class ?? Css.grid.getGrid4Class(tableStyle.value))
const tableClass = computed(() => props.tableClass ?? Css.grid.getTableClass(tableStyle.value))
const tableHeadClass = computed(() => props.tableHeadClass ?? Css.grid.getTableHeadClass(tableStyle.value))
const tableHeaderRowClass = computed(() => props.tableHeaderRowClass ?? Css.grid.getTableHeaderRowClass(tableStyle.value))
const tableHeaderCellClass = computed(() => props.tableHeaderCellClass ?? 
    (Css.grid.getTableHeaderCellClass(tableStyle.value) + (allowFiltering.value ? ' cursor-pointer' : '')))
const toolbarButtonClass = computed(() => props.toolbarButtonClass ?? Css.grid.toolbarButtonClass)

const slots = useSlots()

const asStrings = (o?:string|string[]|null) => typeof o == 'string' ? o.split(',') : o || []

//const dataModel = computed(() => typeOf(apis.value.AnyQuery!.dataModel.name))
const viewModel = computed(() => typeOf(apis.value.AnyQuery!.viewModel?.name || apis.value.AnyQuery!.dataModel.name))

const columnSlots = computed(() => {
    const slotColumns = Object.keys(slots).map(x => x.toLowerCase())    
    return typeProperties(viewModel.value)
        .filter(p => slotColumns.includes(p.name.toLowerCase()) || slotColumns.includes(p.name.toLowerCase()+'-header'))
        .map(x => x.name)
})

function getSelectedColumns() {
    let selectedCols = asStrings(props.selectedColumns)
    return selectedCols.length > 0
        ? selectedCols
        : columnSlots.value.length > 0
            ? columnSlots.value
            : []
}

const viewModelColumns = computed(() => {
    let selectedCols = getSelectedColumns()
    let selectedLower = selectedCols.map(x => x.toLowerCase())
    const viewProps = typeProperties(viewModel.value)
    return selectedLower.length > 0
        ? viewProps.filter(p => selectedLower.includes(p.name.toLowerCase()))
        : viewProps
})
const filteredColumns = computed(() => {
    let viewColumns = viewModelColumns.value.map(x => x.name)
    let filterColumns = asStrings(apiPrefs.value.selectedColumns).map(x => x.toLowerCase())
    return filterColumns.length > 0
        ? viewColumns.filter(x => filterColumns.includes(x.toLowerCase()))
        : viewColumns
})

const columns = ref<Column[]>([])
const hasPrefs = computed(() => columns.value.some(x => x.settings.filters.length > 0 || !!x.settings.sort))
const filtersCount = computed(() => columns.value.map(x => x.settings.filters.length).reduce((acc,x) => acc + x, 0))
//const properties = computed(() => typeProperties(typeOf(typeName.value || apis.value.AnyQuery?.dataModel.name)))
const primaryKey = computed(() => getPrimaryKey(typeOf(typeName.value || apis.value.AnyQuery?.dataModel.name)))

const api = ref<ApiResponse>(new ApiResult<any>())
const editApi = ref<ApiResponse>(new ApiResult<any>())

const open = ref<"filters"|null>()
const items = ref<any[]>([])

const create = ref(false)
const editId = ref()
const edit = ref()
const lastQuery = ref('')
const showQueryPrefs = ref(false)
const showFilters = ref<{ column:Column, topLeft:{x:number,y:number}}|null>()

const take = computed(() => apiPrefs.value.take ?? defaultTake)
const results = computed<any[]>(() => api.value.response?.results ?? [])
const total = computed<number>(() => api.value.response?.total ?? api.value.response?.results.length ?? 0)

const skip = ref(props.skip)
const canFirst = computed(() => skip.value > 0)
const canPrev = computed(() => skip.value > 0)
const canNext = computed(() => results.value.length >= take.value)
const canLast = computed(() => results.value.length >= take.value)

const Errors = {
    NoQuery: `No Query API was found`
}

function setQueryString(url:string, args:any) {
    const baseUrl = leftPart(url, '?')
    const qs = Object.assign(queryString(url), args)
    return appendQueryString(baseUrl, qs)
}

async function skipTo(value:number) {
    skip.value += value
    if (skip.value < 0)
        skip.value = 0

    var lastPage = Math.floor(total.value / take.value) * take.value
    if (skip.value > lastPage)
        skip.value = lastPage

    if (typeof history != 'undefined') {
        const url = setQueryString(location.href, { skip:skip.value || undefined })
        history.pushState({}, '', url)
    }
    await update()
}

function onRowSelected(item:any, ev:Event) {
    emit('rowSelected', item, ev)
}
function onHeaderSelected(name:string, e:MouseEvent) {
    let elTarget = e.target as HTMLElement
    if (elTarget?.tagName !== 'TD') {
        let tableRect = elTarget?.closest('TABLE')?.getBoundingClientRect()
        let column = columns.value.find(x => x.name.toLowerCase() == name.toLowerCase())
        if (column && tableRect) {
            let filterDialogWidth = 318
            let minLeft = tableRect.x + filterDialogWidth + 10
            showFilters.value = {
                column,
                topLeft: {
                    x: Math.max(Math.floor(e.clientX + filterDialogWidth / 2), minLeft),
                    y: tableRect.y + 45,
                }
            }
        }
    }

    emit('headerSelected', name, e)
}

function onFilterDone() {
    showFilters.value = null
}
async function onFilterSave(settings:ColumnSettings) {
    let column = showFilters.value?.column
    if (column) {
        column.settings = settings
        storage.setItem(columnCacheKey(column.name), JSON.stringify(column.settings))
        await update()
    }
    showFilters.value = null
}
async function filtersChanged(column:Column) {
    storage.setItem(columnCacheKey(column.name), JSON.stringify(column.settings))
    await update()
}

async function saveApiPrefs(prefs:ApiPrefs) {
    showQueryPrefs.value = false
    apiPrefs.value = prefs
    storage.setItem(prefsCacheKey(), JSON.stringify(prefs))
    await update()
}

async function update() {
    await search(createRequestArgs())
}
async function refresh() {
    lastQuery.value = ''
    await update()
}

async function search(args:any) {
    const op = apis.value.AnyQuery
    if (!op) {
        console.error(Errors.NoQuery)
        return
    }
    let requestDto = createDto(op, args)
    let complete = delaySet(x => {
        api.value.response = api.value.error = undefined
        apiLoading.value = x
    })
    let r = await client.api(requestDto)
    complete()
    // Fix for iOS which doesn't pick up reactive update on initial onload
    nextTick(() => api.value = r)
    let results = (r.response as any)?.results || []
    if (!r.succeeded || results.label == 0) return
    // Forms.fetchLookupValues(results, this.columns, () => this.refreshResults())
}

function createRequestArgs() {
    let args:any = {
        include:'total',
        take:take.value,
    }
    let selectedColumns = asStrings(apiPrefs.value.selectedColumns || props.selectedColumns)
    if (selectedColumns.length > 0) {
        let pk = primaryKey.value
        if (pk && selectedColumns.includes(pk.name))
            selectedColumns = [pk.name, ...selectedColumns]
        args.fields = selectedColumns.join(',')
    }
    let orderBy:string[] = []
    columns.value.forEach(c => {
        if (c.settings.sort) orderBy.push((c.settings.sort === 'DESC' ? '-' : '') + c.name)
        c.settings.filters.forEach(filter => {
            let k = filter.key.replace('%', c.name)
            args[k] = filter.value
        })
    })
    if (allowQueryFilters.value) {
        let qs = queryString(location.search)
        Object.keys(qs).forEach(k => {
            let field = viewModelColumns.value.find(x => x.name === k)
            if (field) {
                args[k] = qs[k]
            }
            if (k === 'skip') {
                const num = parseInt(qs[k])
                if (!isNaN(num)) {
                    skip.value = args[k] = num
                }
            }
        })
    } else {
        if (skip.value > 0) {    
            args.skip = skip.value
        }
    }
    if (orderBy.length > 0) {
        args.orderBy = orderBy.join(',')
    }
    return args
}

const copiedApiUrl = ref(false)

function copyText(text:string) {
    if (typeof navigator != 'undefined') navigator.clipboard.writeText(text)
}
function downloadCsv() {
    var apiUrl = createApiUrl("csv")
    copyText(apiUrl)
    if (typeof window != 'undefined') window.open(apiUrl)
}
function copyApiUrl() {
    var apiUrl = createApiUrl("json")
    copyText(apiUrl)
    copiedApiUrl.value = true
    setTimeout(() => copiedApiUrl.value = false, 3000)
}
function createApiUrl(ext = "json") {
    const args = createRequestArgs();
    const url = `/api/${apis.value.AnyQuery?.request.name}`
    const absoluteUrl = combinePaths(client.baseUrl, appendQueryString(url, { ...args, jsconfig: "edv"}))
    var formatUrl = absoluteUrl.indexOf('?') >= 0
        ? leftPart(absoluteUrl, '?') + "." + ext + "?" + rightPart(absoluteUrl, '?')
        : absoluteUrl + ".json"
    return formatUrl
}
async function resetPreferences() {
    columns.value.forEach(column => {
        column.settings = { filters: [] }
        storage.removeItem(columnCacheKey(column.name))
    })
    await update()
}
function onShowNewItem() {}

const typeName = computed(() => getTypeName(props.type))
const dataModelName = computed(() => typeName.value || apis.value.AnyQuery?.dataModel.name)
const prefsCacheKey = () => `${props.id}/ApiPrefs/${typeName.value || apis.value.AnyQuery?.dataModel.name}`
const columnCacheKey = (name:string) => `Column/${props.id}:${typeName.value || apis.value.AnyQuery?.dataModel.name}.${name}`

const defaultTake = 25
const apiPrefs = ref<ApiPrefs>({ take:defaultTake })

const apiLoading = ref(false)

const { metadataApi, typeOf, apiOf, filterDefinitions } = useMetadata()

const { invalidAccessMessage } = useAuth()
const definitions = computed(() => props.filterDefinitions || filterDefinitions.value)


const apis = computed(() => {
    let opNames = asStrings(props.apis)
    return opNames.length > 0 
        ? Apis.from(opNames.map(x => apiOf(x)).filter(x => x != null).map(x => x!)) 
        : Apis.forType(typeName.value, metadataApi.value)
})

const warn = (msg:string) => `<span class="text-yellow-700">${msg}</span>`
const invalidState = computed(() => {
    if (!metadataApi.value)
        return warn(`AppMetadata not loaded, see <a class="${Css.a.blue}" href="https://docs.servicestack.net/vue/use-metadata" target="_blank">useMetadata()</a>`)
    let opNames = asStrings(props.apis)
    let invalidApis = opNames.map(op => apiOf(op) == null ? op : null).filter(x => x != null)
    if (invalidApis.length > 0)
        return warn(`Unknown API${invalidApis.length > 1 ? 's' : ''}: ${invalidApis.join(', ')}`)
    let aq = apis.value
    if (aq.empty)
        return warn(`Mising DataModel in property 'type' or AutoQuery APIs to use in property 'apis'`)
    if (!aq.AnyQuery)
        return warn(Errors.NoQuery)
    return null
})

const invalidAccess = computed(() => apis.value.AnyQuery && invalidAccessMessage(apis.value.AnyQuery))
const invalidCreateAccess = computed(() => apis.value.Create && invalidAccessMessage(apis.value.Create))
const invalidUpdateAccess = computed(() => apis.value.AnyUpdate && invalidAccessMessage(apis.value.AnyUpdate))

function editDone() {
    edit.value = null
    editId.value = null
    // NavigationManager.NavigateTo(NavigationManager.Uri.SetQueryParam(QueryParams.Edit, null));
}
function createDone() {
    create.value = false
    // NavigationManager.NavigateTo(NavigationManager.Uri.SetQueryParam(QueryParams.New, null));
}

function editSave() {
    lastQuery.value = ''
    editDone()
}
function createSave() {
    lastQuery.value = ''
    createDone()
}

onMounted(async () => {
    const prefs = props.prefs || parseJson(storage.getItem(prefsCacheKey()))
    if (prefs) apiPrefs.value = prefs
    columns.value = viewModelColumns.value.map(p => ({
        name: p.name,
        type: p.type,
        meta: p,
        allowFiltering: allowFiltering.value,
        settings: Object.assign({
                filters: []
            }, 
            parseJson(storage.getItem(columnCacheKey(p.name)))
        )
    }))
    if (!isNaN(props.skip)) {
        skip.value = props.skip
    }
    await update()
})

</script>