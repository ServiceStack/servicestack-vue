<template>
<ModalDialog v-if="refInfo" ref="modalDialog" :id="id" @done="done">
     <div class="pt-2 overflow-auto" style="min-height:620px">
        <div class="mt-3 pl-5 flex flex-wrap items-center">
            <h3 class="hidden sm:block text-xl leading-6 font-medium text-gray-900 dark:text-gray-50 mr-3">
                Select <span class="hidden md:inline">{{humanize(refInfo.model)}}</span>
            </h3>
            <div class="flex pb-1 sm:pb-0">
                <button v-if="showPreferences" type="button" class="pl-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" :title="`${refInfo.model} Preferences`" @click="showQueryPrefs=!showQueryPrefs">
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
            <div v-if="apis.Create && canCreate" class="pl-2 mt-1">
                <button type="button" @click="onShowNewItem()" title="modelTitle" :class="grid.toolbarButtonClass">
                    <svg class="w-5 h-5 mr-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"></path></svg>
                    <span class="whitespace-nowrap">{{ newButtonLabel }}</span>
                </button>
                <AutoCreateForm v-if="create" ref="createForm" :type="apis.Create.request.name" :configure="configureField" @done="createDone" @save="createSave">
                    <template #header>
                        <slot name="formheader" form="create" :formInstance="createForm" :apis="apis" :type="dataModelName" :updateModel="setCreate"></slot>
                    </template>
                    <template #footer>
                        <slot name="formfooter" form="create" :formInstance="createForm" :apis="apis" :type="dataModelName" :updateModel="setCreate"></slot>
                    </template>
                </AutoCreateForm>
            </div>
            
            <div v-if="hasPrefs && showResetPreferences" class="pl-2">
                <button type="button" @click="resetPreferences" title="Reset Preferences & Filters" :class="toolbarButtonClass">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M6.78 2.72a.75.75 0 0 1 0 1.06L4.56 6h8.69a7.75 7.75 0 1 1-7.75 7.75a.75.75 0 0 1 1.5 0a6.25 6.25 0 1 0 6.25-6.25H4.56l2.22 2.22a.75.75 0 1 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Z" /></svg>
                </button>
            </div>

            <div class="flex pb-1 sm:pb-0">
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
            </div>

        </div>

        <FilterViews v-if="open == 'filters'" class="border-y border-gray-200 dark:border-gray-800 py-8 my-2" 
            :definitions="definitions" :columns="columns" @done="open = null" @change="filtersChanged" />

        <div v-if="showFilters">
            <FilterColumn :definitions="definitions" :column="showFilters.column" :top-left="showFilters.topLeft" @done="onFilterDone" @save="onFilterSave" />
        </div>

        <ErrorSummary v-if="api.error" :status="api.error" />
        <Loading v-else-if="apiLoading" />

        <div v-else>
            <div v-if="results.length">
                <DataGrid :id="id" :items="results" :type="refInfo.model" :selected-columns="filteredColumns"
                    @filters-changed="update"
                    tableStyle="fullWidth"
                    :rowClass="getTableRowClass" @row-selected="onRowSelected" 
                    @header-selected="onHeaderSelected">

                    <template #header="{ column, label }">
                        <div v-if="allowFiltering && (!props.canFilter || props.canFilter(column))" class="cursor-pointer flex justify-between items-center hover:text-gray-900 dark:hover:text-gray-50">
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
        </div>

    </div>
</ModalDialog>
<QueryPrefs v-if="showQueryPrefs" :columns="viewModelColumns" :prefs="apiPrefs" @done="showQueryPrefs=false" @save="saveApiPrefs" />
</template>

<script setup lang="ts">
import type { JsonServiceClient } from '@servicestack/client'
import type { ApiPrefs, ApiResponse, Column, ColumnSettings, MetadataPropertyType } from '@/types'
import type { ModalLookupProps, ModalLookupEmits } from '@/components/types'
import { computed, getCurrentInstance, inject, nextTick, onMounted, ref, useSlots, type Slots } from 'vue'
import { ApiResult, delaySet, humanize, mapGet } from '@servicestack/client'
import { parseJson, getTypeName } from '@/use/utils'
import { useConfig } from '@/use/config'
import { Apis, createDto, Crud, getPrimaryKey, typeOf, typeProperties, useMetadata } from '@/use/metadata'
import { grid } from './css'
import { canAccess } from '@/use/auth'

import FilterColumn from './grids/FilterColumn.vue'
import FilterViews from './grids/FilterViews.vue'
import QueryPrefs from './grids/QueryPrefs.vue'

const props = withDefaults(defineProps<ModalLookupProps>(), {
    id: 'ModalLookup',
    skip: 0,
    allowFiltering: true,
    showPreferences: true,
    showPagingNav: true,
    showPagingInfo: true,
    showFiltersView: true,
    showResetPreferences: true,
})

const emit = defineEmits<ModalLookupEmits>()


const slots:Slots = useSlots()
const { config } = useConfig()
const { metadataApi, filterDefinitions } = useMetadata()
const client = inject<JsonServiceClient>('client')!
const storage = config.value.storage!

const toolbarButtonClass = computed(() => props.toolbarButtonClass ?? grid.toolbarButtonClass)
const definitions = computed(() => filterDefinitions.value)

const defaultTake = 25
const apiPrefs = ref<ApiPrefs>({ take:defaultTake })
const api = ref<ApiResponse>(new ApiResult<any>())
const skip = ref(props.skip)
const apiLoading = ref(false)
const open = ref<"filters"|null>()

const asStrings = (o?:string|string[]|null) => typeof o == 'string' ? o.split(',') : o || []

function getTableRowClass(item:any, i:number) {
    return grid.getTableRowClass("fullWidth", i, false, true)
}

function getSelectedColumns() {
    let selectedCols = asStrings(props.selectedColumns)
    return selectedCols.length > 0
        ? selectedCols
        : []
}

const viewModel = computed(() => typeOf(props.refInfo.model))

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

const take = computed(() => apiPrefs.value.take ?? defaultTake)
const results = computed<any[]>(() => (api.value.response ? mapGet(api.value.response, 'results') : null) ?? [])
const total = computed<number>(() => api.value.response?.total ?? results.value.length ?? 0)

const canFirst = computed(() => skip.value > 0)
const canPrev = computed(() => skip.value > 0)
const canNext = computed(() => results.value.length >= take.value)
const canLast = computed(() => results.value.length >= take.value)

const columns = ref<Column[]>([])

const hasPrefs = computed(() => columns.value.some(x => x.settings.filters.length > 0 || !!x.settings.sort))
const filtersCount = computed(() => columns.value.map(x => x.settings.filters.length).reduce((acc,x) => acc + x, 0))
const primaryKey = computed(() => getPrimaryKey(viewModel.value))

const queryOp = computed(() => metadataApi.value?.operations.find(op => op.dataModel?.name == props.refInfo.model && Crud.isAnyQuery(op)))

const modalDialog = ref()
const showQueryPrefs = ref(false)
const showFilters = ref<{ column:Column, topLeft:{x:number,y:number}}|null>()

const typeName = computed(() => getTypeName(props.refInfo.model))
const apis = computed(() => Apis.forType(typeName.value, metadataApi.value))
const dataModelName = computed(() => typeName.value || queryOp.value?.dataModel.name)
const modelTitle = computed(() => props.modelTitle || dataModelName.value)
const newButtonLabel = computed(() => props.newButtonLabel || `New ${modelTitle.value}`)
const canCreate = computed(() => canAccess(apis.value.Create))

const createForm = ref()
const create = ref(false)
function onShowNewItem() {
    create.value = true
}

function createDone() {
    create.value = false
}
async function createSave(result:any) {
    createDone()
    emit('done', result)
}
function setCreate(props:any) {
    if (!createForm.value) return
    Object.assign(createForm.value?.model, props)
    console.log('setCreate', JSON.stringify(props, null, 2))
    forceUpdate()
}
function forceUpdate() {
    createForm.value?.forceUpdate()
    const instance = getCurrentInstance()
    instance?.proxy?.$forceUpdate()
}


const prefsCacheKey = () => `${props.id}/ApiPrefs/${props.refInfo.model}`
const columnCacheKey = (name:string) => `Column/${props.id}:${props.refInfo.model}.${name}`

async function skipTo(value:number) {
    skip.value += value
    if (skip.value < 0)
        skip.value = 0

    var lastPage = Math.floor(total.value / take.value) * take.value
    if (skip.value > lastPage)
        skip.value = lastPage

    //pushState({ skip:skip.value || undefined })
    await update()
}
async function onRowSelected(item:any, ev:Event) {
    emit('done', item)
}
function done() {
    emit('done', null)
}

function onHeaderSelected(name:string, e:MouseEvent) {
    let elTarget = e.target as HTMLElement
    if (elTarget?.tagName !== 'TD') {
        let tableRect = elTarget?.closest('TABLE')?.getBoundingClientRect()
        let column = columns.value.find(x => x.name.toLowerCase() == name.toLowerCase())
        if (column && tableRect) {
            let filterDialogWidth = 318
            let div = (e.target as HTMLElement)?.tagName === 'DIV' ? e.target as HTMLElement : (e.target as HTMLElement)?.closest('DIV')
            let rect = div!.getBoundingClientRect()
            let minLeft = filterDialogWidth + 25
            showFilters.value = {
                column,
                topLeft: { 
                    x:Math.max(Math.floor(rect.x + 25), minLeft), 
                    y:Math.floor(115) 
                } 
            }
        }
    }
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

async function search(args:any) {
    const op = queryOp.value
    if (!op) {
        console.error(`No Query API was found for ${props.refInfo.model}`)
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
    if (typeof args.skip == 'undefined' && skip.value > 0) {    
        args.skip = skip.value
    }

    if (orderBy.length > 0) {
        args.orderBy = orderBy.join(',')
    }
    return args
}

async function resetPreferences() {
    columns.value.forEach(column => {
        column.settings = { filters: [] }
        storage.removeItem(columnCacheKey(column.name))
    })
    await update()
}

onMounted(async () => {
    //console.debug('ModalLookup.onMounted', props.id, props.refInfo?.model, props.refInfo)
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

    await update()
})

</script>