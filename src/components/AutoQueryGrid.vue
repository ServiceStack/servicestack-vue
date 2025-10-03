<template>
<div v-if="invalidState">
    <Alert v-html="invalidState" />
</div>
<div v-else-if="invalidAccess">
    <EnsureAccess :invalid-access="invalidAccess" />
</div>
<div v-else class="pt-1">
    <div v-if="show('forms') && create && apis.Create">
        <EnsureAccessDialog v-if="invalidCreateAccess" :title="`Create ${modelTitle}`" :invalid-access="invalidCreateAccess" alert-class="text-yellow-700" @done="createDone" />
        <slot v-else-if="slots.createform" name="createform" :type="apis.Create.request.name" :configure="configureField" :done="createDone" :save="createSave"></slot>
        <AutoCreateForm ref="createForm" v-else :type="apis.Create.request.name" :configure="configureField" @done="createDone" @save="createSave">
            <template #header>
                <slot name="formheader" form="create" :formInstance="createForm" :apis="apis" :type="dataModelName" :updateModel="setCreate"></slot>
            </template>
            <template #footer>
                <slot name="formfooter" form="create" :formInstance="createForm" :apis="apis" :type="dataModelName" :updateModel="setCreate"></slot>
            </template>
        </AutoCreateForm>
    </div>
    <div v-else-if="show('forms') && edit && apis.AnyUpdate">
        <EnsureAccessDialog v-if="invalidUpdateAccess" :title="`Update ${modelTitle}`" :invalid-access="invalidUpdateAccess" alert-class="text-yellow-700" @done="editDone" />
        <slot v-else-if="slots.editform" name="editform" :model="edit" :type="apis.AnyUpdate.request.name" :deleteType="canDelete ? apis.Delete!.request.name : null"
            :configure="configureField" :done="editDone" :save="editSave"></slot>
        <AutoEditForm ref="editForm" v-else v-model="edit" :type="apis.AnyUpdate.request.name" :deleteType="canDelete ? apis.Delete!.request.name : null" 
            :configure="configureField" @done="editDone" @save="editSave" @delete="editSave">
            <template #header>
                <slot name="formheader" form="edit" :formInstance="editForm" :apis="apis" :type="dataModelName" :model="edit" :id="editId" :updateModel="setEdit"></slot>
            </template>
            <template #footer>
                <slot name="formfooter" form="edit" :formInstance="editForm" :apis="apis" :type="dataModelName" :model="edit" :id="editId" :updateModel="setEdit"></slot>
            </template>
        </AutoEditForm>
    </div>
    <div v-else-if="show('forms') && edit">
        <slot v-if="slots.viewform" name="viewform" :model="edit" :apis="apis" :done="editDone"></slot>
        <AutoViewForm v-else :model="edit" :apis="apis" :deleteType="canDelete ? apis.Delete!.request.name : null" :done="editDone"  @save="editSave" @delete="editSave" />
    </div>
    <slot v-if="slots.toolbar" name="toolbar"></slot>
    <div v-else-if="show('toolbar')">
        <QueryPrefs v-if="showQueryPrefs" :columns="viewModelColumns" :prefs="apiPrefs" @done="showQueryPrefs=false" @save="saveApiPrefs" />
        <div class="pl-1 pt-1 flex flex-wrap">
            <div class="flex mt-1">
                <button v-if="show('preferences')" type="button" class=" text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" :title="`${modelTitle} Preferences`" @click="showQueryPrefs=!showQueryPrefs">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-width="1.5" fill="none"><path d="M9 3H3.6a.6.6 0 0 0-.6.6v16.8a.6.6 0 0 0 .6.6H9M9 3v18M9 3h6M9 21h6m0-18h5.4a.6.6 0 0 1 .6.6v16.8a.6.6 0 0 1-.6.6H15m0-18v18" stroke="currentColor" /></g></svg>
                </button>

                <button v-if="show('pagingNav')" type="button" :class="['pl-2', canFirst ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="First page" :disabled="!canFirst" @click="skipTo(-total)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6l6 6zM6 6h2v12H6z" fill="currentColor" /></svg>
                </button>
                <button v-if="show('pagingNav')" type="button" :class="['pl-2', canPrev ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="Previous page" :disabled="!canPrev" @click="skipTo(-take)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z" fill="currentColor" /></svg>
                </button>
                <button v-if="show('pagingNav')" type="button" :class="['pl-2', canNext ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="Next page" :disabled="!canNext"  @click="skipTo(take)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" /></svg>
                </button>
                <button v-if="show('pagingNav')" type="button" :class="['pl-2', canLast ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' : 'text-gray-400 dark:text-gray-500']"
                    title="Last page" :disabled="!canLast" @click="skipTo(total)">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6l-6-6zM16 6h2v12h-2z" fill="currentColor" /></svg>
                </button>
            </div>

            <div v-if="show('pagingInfo')" class="flex mt-1">
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

            <div class="flex flex-wrap">

                <div v-if="show('refresh')" class="pl-2 mt-1">
                    <button type="button" @click="refresh" title="Refresh" :class="toolbarButtonClass">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 20v-5h-5M4 4v5h5m10.938 2A8.001 8.001 0 0 0 5.07 8m-1.008 5a8.001 8.001  0 0 0 14.868 3" /></svg>
                    </button>
                </div>

                <div v-if="show('downloadCsv')" class="pl-2 mt-1">
                    <button type="button" @click="downloadCsv" title="Download CSV" :class="toolbarButtonClass">
                        <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M28.781 4.405h-10.13V2.018L2 4.588v22.527l16.651 2.868v-3.538h10.13A1.162 1.162 0 0 0 30 25.349V5.5a1.162 1.162 0 0 0-1.219-1.095zm.16 21.126H18.617l-.017-1.889h2.487v-2.2h-2.506l-.012-1.3h2.518v-2.2H18.55l-.012-1.3h2.549v-2.2H18.53v-1.3h2.557v-2.2H18.53v-1.3h2.557v-2.2H18.53v-2h10.411z" fill="#20744a" fill-rule="evenodd" /><path fill="#20744a" d="M22.487 7.439h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 10.94h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 14.441h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 17.942h4.323v2.2h-4.323z" /><path fill="#20744a" d="M22.487 21.443h4.323v2.2h-4.323z" /><path fill="#fff" fill-rule="evenodd" d="M6.347 10.673l2.146-.123l1.349 3.709l1.594-3.862l2.146-.123l-2.606 5.266l2.606 5.279l-2.269-.153l-1.532-4.024l-1.533 3.871l-2.085-.184l2.422-4.663l-2.238-4.993z" /></svg>
                        <span class="text-green-900 dark:text-green-100">Excel</span>
                    </button>
                </div>

                <div v-if="show('copyApiUrl')" class="pl-2 mt-1">
                    <button type="button" @click="copyApiUrl" title="Copy API URL" :class="toolbarButtonClass">
                        <svg v-if="copiedApiUrl" class="w-5 h-5 mr-1 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <svg v-else class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></g></svg>
                        <span class="whitespace-nowrap">Copy URL</span>
                    </button>
                </div>

                <div v-if="hasPrefs && show('resetPreferences')" class="pl-2 mt-1">
                    <button type="button" @click="resetPreferences" title="Reset Preferences & Filters" :class="toolbarButtonClass">
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M6.78 2.72a.75.75 0 0 1 0 1.06L4.56 6h8.69a7.75 7.75 0 1 1-7.75 7.75a.75.75 0 0 1 1.5 0a6.25 6.25 0 1 0 6.25-6.25H4.56l2.22 2.22a.75.75 0 1 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Z" /></svg>
                    </button>
                </div>

                <div v-if="show('filtersView') && filtersCount > 0" class="pl-2 mt-1">
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
                
                <div v-if="show('newItem') && apis.Create && canCreate" class="pl-2 mt-1">
                    <button type="button" @click="onShowNewItem" :title="modelTitle" :class="toolbarButtonClass">
                        <svg class="w-5 h-5 mr-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"></path></svg>
                        <span class="whitespace-nowrap">{{ newButtonLabel }}</span>
                    </button>
                </div>

                <slot v-if="slots.toolbarbuttons" name="toolbarbuttons" :toolbarButtonClass="toolbarButtonClass"></slot>
            </div>

        </div>
    </div>

    <FilterViews v-if="open == 'filters'" class="border-y border-gray-200 dark:border-gray-800 py-8 my-2" 
       :definitions="definitions" :columns="columns" @done="open = null" @change="filtersChanged" />

    <ErrorSummary v-if="editApi.error ?? api.error" :status="editApi.error ?? api.error" />
    <Loading v-else-if="apiLoading" class="p-2" />

    <div v-if="showFilters">
        <FilterColumn :definitions="definitions" :column="showFilters.column" :top-left="showFilters.topLeft" @done="onFilterDone" @save="onFilterSave" />
    </div>

    <DataGrid v-if="results.length" :id="id" :items="results" :type="type" :selected-columns="filteredColumns" class="mt-1"
        @filters-changed="update"
        :tableStyle="tableStyle" :gridClass="gridClass" :grid2Class="grid2Class" :grid3Class="grid3Class" :grid4Class="grid4Class"
        :tableClass="tableClass" :theadClass="theadClass" :theadRowClass="theadRowClass" :theadCellClass="theadCellClass" :tbodyClass="tbodyClass"
        :rowClass="getTableRowClass" @row-selected="onRowSelected" :rowStyle="rowStyle"
        :headerTitle="headerTitle" :headerTitles="headerTitles" :visibleFrom="visibleFrom"
        @header-selected="onHeaderSelected">

        <template #header="{ column, label }">
            <div v-if="allow('filtering') && canFilter(column)" class="cursor-pointer flex justify-between items-center hover:text-gray-900 dark:hover:text-gray-50">
                <span class="mr-1 select-none">
                    {{ label }}
                </span>
                <SettingsIcons :column="columns.find((x:Column) => x.name.toLowerCase() === column.toLowerCase())" :is-open="showFilters?.column.name === column" />
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
</template>

<script setup lang="ts">
import type { JsonServiceClient } from '@servicestack/client'
import type { ApiPrefs, ApiResponse, Column, ColumnSettings, MetadataPropertyType, GridAllowOptions, GridShowOptions } from '@/types'
import type { AutoQueryGridProps, AutoQueryGridEmits } from '@/components/types'
import { computed, inject, nextTick, onMounted, ref, useSlots, getCurrentInstance, type Slots } from 'vue'
import { ApiResult, appendQueryString, combinePaths, delaySet, leftPart, mapGet, queryString, rightPart } from '@servicestack/client'
import { Apis, createDto, getPrimaryKey, isComplexProp, typeProperties, useMetadata } from '@/use/metadata'
import { a, grid } from './css'
import { asOptions, asStrings, copyText, getTypeName, parseJson, pushState, uniqueIgnoreCase } from '@/use/utils'
import { canAccess, useAuth } from '@/use/auth'
import { Sole }  from '@/use/config'
import EnsureAccess from './EnsureAccess.vue'

import FilterColumn from './grids/FilterColumn.vue'
import FilterViews from './grids/FilterViews.vue'
import QueryPrefs from './grids/QueryPrefs.vue'
import { useConfig } from '@/use/config'

//slots: toolbar, toolbarButtons, createForm, editForm

const { config, autoQueryGridDefaults } = useConfig()
const aqd = autoQueryGridDefaults
const storage = config.value.storage!

const props = withDefaults(defineProps<AutoQueryGridProps>(), {
    id: 'AutoQueryGrid',
    skip: 0
})

const emit = defineEmits<AutoQueryGridEmits>()

const client = inject<JsonServiceClient>('client')!

const allAllow = 'filtering,queryString,queryFilters'.split(',') as GridAllowOptions[]
const allShow = 'copyApiUrl,downloadCsv,filtersView,newItem,pagingInfo,pagingNav,preferences,refresh,resetPreferences,toolbar,forms'.split(',') as GridShowOptions[]

const allowOptions = computed<{[k:string]:boolean}>(() => props.deny ? asOptions(allAllow,props.deny) : asOptions(allAllow,aqd.value.deny))
const showOptions  = computed<{[k:string]:boolean}>(() => props.hide ? asOptions(allShow,props.hide)  : asOptions(allShow,aqd.value.hide))

function allow(target:GridAllowOptions) {
    return allowOptions.value[target]
}
function show(target:GridShowOptions) {
    return showOptions.value[target]
}

const tableStyle = computed(() => props.tableStyle ?? aqd.value.tableStyle)
const gridClass = computed(() => props.gridClass ?? grid.getGridClass(tableStyle.value))
const grid2Class = computed(() => props.grid2Class ?? grid.getGrid2Class(tableStyle.value))
const grid3Class = computed(() => props.grid3Class ?? grid.getGrid3Class(tableStyle.value))
const grid4Class = computed(() => props.grid4Class ?? grid.getGrid4Class(tableStyle.value))
const tableClass = computed(() => props.tableClass ?? grid.getTableClass(tableStyle.value))
const theadClass = computed(() => props.theadClass ?? grid.getTheadClass(tableStyle.value))
const theadRowClass = computed(() => props.theadRowClass ?? grid.getTheadRowClass(tableStyle.value))
const theadCellClass = computed(() => props.theadCellClass ?? grid.getTheadCellClass(tableStyle.value))
const toolbarButtonClass = computed(() => props.toolbarButtonClass ?? grid.toolbarButtonClass)

function getTableRowClass(item:any, i:number) {
    if (props.rowClass) return props.rowClass(item, i)
    const canUpdate = !!apis.value.AnyUpdate
    const itemPk = primaryKey.value?.name ? mapGet(item, primaryKey.value.name) : null
    const isSelected = itemPk == editId.value
    return grid.getTableRowClass(props.tableStyle, i, isSelected, canUpdate)
}

const slots: Slots = useSlots()

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
        ? selectedLower.map(x => viewProps.find(p => p.name.toLowerCase() === x)).filter(x => x != null) as MetadataPropertyType[]
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
const api = ref<ApiResponse>(new ApiResult<any>())
const editApi = ref<ApiResponse>(new ApiResult<any>())

const open = ref<"filters"|null>()
const create = ref(false)
const editId = ref<any>()
const edit = ref<any>()
const showQueryPrefs = ref(false)
const showFilters = ref<{ column:Column, topLeft:{x:number,y:number}}|null>()
const skip = ref(props.skip)
const copiedApiUrl = ref(false)

const defaultTake = 25
const apiPrefs = ref<ApiPrefs>({ take:defaultTake })
const apiLoading = ref(false)

const hasPrefs = computed(() => columns.value.some(x => x.settings.filters.length > 0 || !!x.settings.sort) 
    || apiPrefs.value.selectedColumns)
const filtersCount = computed(() => columns.value.map(x => x.settings.filters.length).reduce((acc,x) => acc + x, 0))
const properties = computed(() => typeProperties(typeOf(typeName.value || apis.value.AnyQuery?.dataModel.name)))
const primaryKey = computed(() => getPrimaryKey(typeOf(typeName.value || apis.value.AnyQuery?.dataModel.name)))

const take = computed(() => apiPrefs.value.take ?? defaultTake)
const results = computed<any[]>(() => (api.value.response ? mapGet(api.value.response, 'results') : null) ?? [])
const total = computed<number>(() => (api.value.response?.total || results.value.length) ?? 0)

const canFirst = computed(() => skip.value > 0)
const canPrev = computed(() => skip.value > 0)
const canNext = computed(() => results.value.length >= take.value)
const canLast = computed(() => results.value.length >= take.value)

const createForm = ref()
const editForm = ref()

const Errors = {
    NoQuery: `No Query API was found`
}

defineExpose({ 
    update, search, createRequestArgs, reset, createDone, createSave, editDone, editSave, forceUpdate, setEdit, 
    edit, createForm, editForm, apiPrefs, results, skip, take, total,
})

if (Sole.interceptors.has('AutoQueryGrid.new')) Sole.interceptors.invoke('AutoQueryGrid.new', { props })

function canFilter(column:string) {
    if (column) {
        if (props.canFilter)
            return props.canFilter(column)
        
        const prop = properties.value.find(x => x.name.toLowerCase() == column.toLowerCase())
        if (prop) {
            return !isComplexProp(prop)            
        }
    }
    return false
}

function updateUrl(args:Record<string,any>) {
    emit('nav', args)
    if (!allow('queryString')) return
    pushState(args)
}

async function skipTo(value:number) {
    skip.value += value
    if (skip.value < 0)
        skip.value = 0

    const lastPage = Math.floor(total.value / take.value) * take.value
    if (skip.value > lastPage)
        skip.value = lastPage

    updateUrl({ skip:skip.value || undefined })
    await update()
}

async function setEditId(pkName:string, pkValue:any) {    
    edit.value = null
    editId.value = pkValue
    if (!pkName || !pkValue) return
    
    let requestDto = createDto(apis.value.AnyQuery!, { [pkName]: pkValue })
    const api = await client.api(requestDto)
    if (api.succeeded) {
        let result = mapGet(api.response, 'results')?.[0]
        if (!result) {
            console.warn(`API ${apis.value.AnyQuery?.request.name}(${pkName}:${pkValue}) returned no results`)
        }
        edit.value = result
    }
}

async function onRowSelected(item:any, ev:Event) {
    emit('rowSelected', item, ev)
    const pkName = primaryKey.value?.name
    const pkValue = pkName ? mapGet(item, pkName) : null
    if (!pkName || !pkValue) return
    updateUrl({ edit: pkValue })
    setEditId(pkName, pkValue)
}
function onHeaderSelected(name:string, e:MouseEvent) {
    if (!allow('filtering')) return
    let elTarget = e.target as HTMLElement
    if (canFilter(name) && elTarget?.tagName !== 'TD') {
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

function setCreate(props:any) {
    if (!createForm.value) return
    Object.assign(createForm.value?.model, props)
    forceUpdate()
}

function setEdit(props:any) {
    Object.assign(edit.value, props)
    forceUpdate()
}

function forceUpdate() {
    createForm.value?.forceUpdate()
    editForm.value?.forceUpdate()
    const instance = getCurrentInstance()
    instance?.proxy?.$forceUpdate()
}

async function update() {
    await search(createRequestArgs())
}
async function refresh() {
    await update()
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
async function search(args:any) {
    const op = apis.value.AnyQuery
    if (!op) {
        console.error(Errors.NoQuery)
        return
    }
    let requestDto = createDto(op, args)
    
    let r = await client.api(requestDto)
    let complete = delaySet(x => {
        api.value.response = api.value.error = undefined
        apiLoading.value = x
        if (!isIOS) {
            api.value = r
        } else {
            // Fix for iOS which doesn't pick up reactive update on initial onload
            nextTick(() => api.value = r)
        }
    })
    complete()

    let results = mapGet(r.response as any,'results') || []
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
        if (pk && !selectedColumns.includes(pk.name))
            selectedColumns = [pk.name, ...selectedColumns]
        
        // Include FK Id for [Ref] complex props
        const metaProps = properties.value
        const refProps:string[] = []
        // console.debug('selectedColumns', selectedColumns, 'slots', Object.keys(slots), 'metaProps', metaProps)
        selectedColumns.forEach(column => {
            const prop = metaProps.find(x => x.name.toLowerCase() == column.toLowerCase())
            if (prop?.ref?.selfId) {
                refProps.push(prop.ref.selfId)
            }
            // If they have a custom slot defined, include any [Ref] props it might use
            const slot = mapGet(slots, column)
            if (slot) {
                // console.debug('hasSlot', JSON.stringify(prop))
                refProps.push(...metaProps.filter(x => x.ref?.selfId?.toLowerCase() == column.toLowerCase()).map(x => x.name))
            }
        })
        refProps.forEach(column => {
            if (!selectedColumns.includes(column))
                selectedColumns.push(column)
        })

        args.fields = uniqueIgnoreCase(selectedColumns).join(',')
    }

    let orderBy:string[] = []
    columns.value.forEach(c => {
        if (c.settings.sort) orderBy.push((c.settings.sort === 'DESC' ? '-' : '') + c.name)
        c.settings.filters.forEach(filter => {
            let k = filter.key.replace('%', c.name)
            args[k] = filter.value
        })
    })
    if (props.filters) {
        Object.keys(props.filters).forEach(k => {
            args[k] = props.filters[k]
        })
    }
    if (allow('queryString') && allow('queryFilters')) {
        const search = location.search ? location.search : location.hash.includes('?') ? '?' + rightPart(location.hash,'?') : ''
        let qs = queryString(search)
        Object.keys(qs).forEach(k => {
            let field = viewModelColumns.value.find(x => x.name.toLowerCase() === k.toLowerCase())
            if (field) {
                args[k] = qs[k]
            }
        })
        if (typeof qs.skip != 'undefined') {
            const num = parseInt(qs.skip)
            if (!isNaN(num)) {
                skip.value = args.skip = num
            }
        }
    }
    if (typeof args.skip == 'undefined' && skip.value > 0) {    
        args.skip = skip.value
    }

    if (orderBy.length > 0) {
        args.orderBy = orderBy.join(',')
    }
    return args
}

function downloadCsv() {
    const apiUrl = createApiUrl("csv")
    copyText(apiUrl)
    if (typeof window != 'undefined') window.open(apiUrl)
}
function copyApiUrl() {
    const apiUrl = createApiUrl("json")
    copyText(apiUrl)
    copiedApiUrl.value = true
    setTimeout(() => copiedApiUrl.value = false, 3000)
}
function createApiUrl(ext = "json") {
    const args = createRequestArgs();
    const url = `/api/${apis.value.AnyQuery?.request.name}`
    const absoluteUrl = combinePaths(client.baseUrl, appendQueryString(url, { ...args, jsconfig: "edv"}))
    const formatUrl = absoluteUrl.indexOf('?') >= 0
        ? leftPart(absoluteUrl, '?') + "." + ext + "?" + rightPart(absoluteUrl, '?')
        : absoluteUrl + ".json"
    return formatUrl
}
async function resetPreferences() {
    columns.value.forEach(column => {
        column.settings = { filters: [] }
        storage.removeItem(columnCacheKey(column.name))
    })
    apiPrefs.value = { take:defaultTake }
    storage.removeItem(prefsCacheKey())
    await update()
}
function onShowNewItem() {
    create.value = true
    updateUrl({ create:null })
}

const typeName = computed(() => getTypeName(props.type))
const dataModelName = computed(() => typeName.value || apis.value.AnyQuery?.dataModel.name)
const modelTitle = computed(() => props.modelTitle || dataModelName.value)
const newButtonLabel = computed(() => props.newButtonLabel || `New ${modelTitle.value}`)
const prefsCacheKey = () => `${props.id}/ApiPrefs/${typeName.value || apis.value.AnyQuery?.dataModel.name}`
const columnCacheKey = (name:string) => `Column/${props.id}:${typeName.value || apis.value.AnyQuery?.dataModel.name}.${name}`

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
        return warn(`AppMetadata not loaded, see <a class="${a.blue}" href="https://docs.servicestack.net/vue/use-metadata" target="_blank">useMetadata()</a>`)
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

const canCreate = computed(() => canAccess(apis.value.Create))
const canUpdate = computed(() => canAccess(apis.value.AnyUpdate))
const canDelete = computed(() => canAccess(apis.value.Delete))

function editDone() {
    edit.value = null
    editId.value = null
    updateUrl({ edit: undefined })
}
function createDone() {
    create.value = false
    updateUrl({ create: undefined })
}

async function editSave() {
    await update()
    editDone()
}
async function createSave() {
    await update()
    createDone()
}


function reset() {
    api.value = new ApiResult<any>()
    editApi.value = new ApiResult<any>()
    create.value = false
    editId.value = null
    edit.value = null
    showQueryPrefs.value = false
    showFilters.value = null
    skip.value = props.skip
    copiedApiUrl.value = false
    apiPrefs.value = { take:defaultTake }
    apiLoading.value = false

    const prefs = props.prefs || parseJson(storage.getItem(prefsCacheKey()))
    if (prefs) apiPrefs.value = prefs
    columns.value = viewModelColumns.value.map(p => ({
        name: p.name,
        type: p.type,
        meta: p,
        settings: Object.assign({
                filters: []
            }, 
            parseJson(storage.getItem(columnCacheKey(p.name)))
        )
    }))
    if (!isNaN(props.skip)) {
        skip.value = props.skip
    }
    let pkName = primaryKey.value?.name
    if (allow('queryString')) {
        const search = location.search ? location.search : location.hash.includes('?') ? '?' + rightPart(location.hash,'?') : ''
        let qs = queryString(search)
        if (typeof qs.create != 'undefined') {
            create.value = typeof qs.create != 'undefined'
        }
        else if (pkName && (typeof qs.edit == 'string' || typeof qs.edit == 'number')) {
            setEditId(pkName, qs.edit)
        }
    }
    if (props.create === true) {
        create.value = true
    }
    if (pkName && props.edit != null) {
        setEditId(pkName, props.edit)
    }    
}

onMounted(async () => {
    reset()
    await update()
})

</script>