<template>
<div class="fixed z-20 inset-0 overflow-y-auto" @click="done" @vue:mounted="updated">
    <div class="absolute" :style="`top:${topLeft.y}px;left:${topLeft.x}px`" @click.stop="">
        <div class="absolute top-0 right-0 bg-white dark:bg-black border dark:border-gray-800 rounded normal-case text-sm shadow w-80">
            <div class="p-4">
                <h3 class="text-base font-medium mb-3 dark:text-gray-100">Sort</h3>
                <div class="flex w-full justify-center">
                    <button type="button" title="Sort Ascending" @click="sort('ASC')"
                            :class="`${settings.sort==='ASC' ? 'bg-indigo-100 border-indigo-500' : 'bg-white hover:bg-gray-50 border-gray-300'} mr-1 inline-flex items-center px-2.5 py-1.5 border shadow-sm text-sm font-medium rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="currentColor"><path fill-rule="evenodd" d="M10.082 5.629L9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"/><path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999l.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z"/></g></svg>
                        <span>ASC</span>
                    </button>
                    <button type="button" title="Sort Descending" @click="sort('DESC')"
                            :class="`${settings.sort==='DESC' ? 'bg-indigo-100 border-indigo-500' : 'bg-white hover:bg-gray-50 border-gray-300'} ml-1 inline-flex items-center px-2.5 py-1.5 border shadow-sm text-sm font-medium rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="currentColor"><path d="M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V7z"/><path fill-rule="evenodd" d="M10.082 12.629L9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371h-1.781zm1.57-.785L11 9.688h-.047l-.652 2.156h1.351z"/><path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999l.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z"/></g></svg>
                        <span>DESC</span>
                    </button>
                </div>
                <h3 class="text-base font-medium mt-4 mb-2">
                    Filter
                </h3>
                <div v-if="isEnum">
                    <div v-for="x in enumValues" :key="x.key" class="flex items-center">
                        <input type="checkbox" :id="x.key" :value="x.key" v-model="selectedEnums" 
                               class="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500">
                        <label :for="x.key" class="ml-3">{{x.value}}</label>
                    </div>
                </div>
                <div v-else>
                    <div v-for="(filter,index) in filters" class="mb-2">
                        <span class="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 text-indigo-700">
                          {{column.name}} {{filter.name}} {{filterValue(filter)}}
                          <button type="button" @click="removeFilter(index)" 
                                  class="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white">
                            <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </span>
                    </div>
                    <div class="flex">
                        <SelectInput id="filterRule" class="w-32 mr-1" v-model="newQuery" :entries="filterEntries" label="" placeholder="" />
                        <TextInput ref="txtFilter" id="filterValue" class="w-32 mr-1" v-if="filterRule(column.type, newQuery)?.valueType !== 'none'" type="text" v-model="newValue" @keyup.enter="addFilter" label="" placeholder="" />
                        <div class="pt-1">
                            <button type="button" @click="addFilter" 
                                    class="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <!-- Heroicon name: solid/plus-sm -->
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <PrimaryButton @click="save" color="red" class="ml-2">
                    Save
                </PrimaryButton>
                <SecondaryButton @click="done">
                    Cancel
                </SecondaryButton>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watchEffect } from 'vue'
import type { ColumnSettings, Filter } from '@/types'
import type { FilterColumnProps, FilterColumnEmits } from '@/components/types'
import type TextInput from '../TextInput.vue'
import { isString, enumOptions, asKvps, filterRuleValue, typeOf } from '@/use/metadata'

const props = defineProps<FilterColumnProps>()

const emit = defineEmits<FilterColumnEmits>()

const txtFilter = ref<typeof TextInput>()
const newQuery = ref('')
const newValue = ref('')
const selectedEnums = ref<string[]>([])

const isEnum = computed(() => props.column.meta.isEnum == true)
const propType = computed(() => typeOf(props.column.meta.type === "Nullable`1" ? props.column.meta.genericArgs![0] : props.column.meta.type))
const enumValues = computed(() => props.column.meta.isEnum == true ? asKvps(enumOptions(propType.value!.name)) : [])
const filterEntries = computed(() => filterRules(props.column.type)?.map(x => ({ key:x.value, value:x.name })) || [])
const settings = ref<ColumnSettings>({ filters:[] })
const filters = computed(() => settings.value.filters)

watchEffect(() => settings.value = Object.assign({}, props.column.settings, {
    filters: Array.from(props.column.settings.filters)
}))
watchEffect(() => {
    let values = props.column.settings.filters?.[0]?.value?.split(',') || []
    if (values.length > 0 && propType.value?.isEnumInt) {
        const flagValue = values[0] && parseInt(values[0]) || 0
        values = propType.value.enumValues?.filter(x => (flagValue & parseInt(x)) > 0) || []
    }
    selectedEnums.value = values
})

function filterRules(type:string) {
    let c = props.definitions
    if (!isString(type)) {
        c = c.filter(x => x.types !== 'string')
    }
    return c
}
function filterRule(type:string, value:string) {
    return filterRules(type).find(x => x.value === value)
}

function addFilter() {
    if (!newQuery.value) return
    let name = filterRule(props.column.type, newQuery.value)?.name
    if (!name) return
    settings.value.filters.push({ key:newQuery.value, name, value:newValue.value })
    newQuery.value = newValue.value = ''
}

function removeFilter(index:number) {
    settings.value.filters.splice(index,1)
}

function filterValue(filter:Filter) {
    return filterRuleValue(filterRule(props.column.type, filter.key)!, props.column.type, filter)
}

function done() {
    emit('done')
}
function updated() {
    newQuery.value = '%'
    txtFilter.value?.focus()
}

function save() {
    if (newValue.value) {
        addFilter()
    }
    if (isEnum.value) {
        /**: selectedEnums = {0:'', 1:'Value'} */
        let selected = Object.values(selectedEnums.value).filter(x => x)
        settings.value.filters = selected.length > 0
            ? propType.value?.isEnumInt
                ? [{ key:'%HasAny', name:'HasAny', value:selected.map(x => parseInt(x)).reduce((acc,x) => acc + x, 0).toString() }]
                : [{ key:'%In', name:'In', value:selected.join(',')}]
            : []
    }

    emit('save', settings.value)
    emit('done')
}

function sort(order?:"ASC"|"DESC") {
    settings.value.sort = order === settings.value.sort ? undefined : order
    nextTick(save)
}

</script>