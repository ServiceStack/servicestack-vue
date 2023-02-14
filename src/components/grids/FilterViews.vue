<template>
<div class="px-4 sm:px-6 lg:px-8 text-sm">
    <div class="flex flex-wrap">
        <fieldset v-for="column in columnsWithFilters" class="group pr-4 sm:pr-6 lg:pr-8">
            <legend class="flex justify-between w-full font-medium">
                <span>{{humanize(column.name)}}</span>
                <span class="w-6 flex justify-end">
                    <span class="hidden group-hover:inline">
                        <button @click="removeFilters(column)" :title="`Clear all ${humanize(column.name)} filters`"
                                class="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-red-600 hover:bg-red-200 hover:text-red-500 focus:outline-none focus:bg-red-500 focus:text-white">
                            <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                        </button>
                    </span>
                </span>
            </legend>
            <div v-if="column.meta.isEnum" class="pt-2">
                <div v-for="value in enumValues(column.settings.filters)" :key="value" class="flex items-center">
                    <label class="ml-2">{{value}}</label>
                </div>
            </div>
            <div v-else>
                <div v-for="(filter,index) in column.settings.filters" class="pt-2">
                    <span class="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 text-indigo-700">
                      {{column.name}} {{filter.name}} {{filterValue(column, filter)}}
                      <button type="button" @click="removeFilter(column,index)"
                              class="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white">
                        <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                </div>
            </div>
        </fieldset>
    </div>
    <div class="flex justify-center pt-4">
        <button type="button" @click="clearAll"
                class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span>Clear All</span>
        </button>
    </div>
</div>
</template>

<script setup lang="ts">
import type { AutoQueryConvention, Column, Filter } from '@/types'
import { humanize } from '@servicestack/client'
import { computed } from 'vue'
import { filterRuleValue, isString } from '@/use/metadata'

const props = defineProps<{
    definitions: AutoQueryConvention[]
    columns: Column[]
}>()

const emit = defineEmits<{
    (e:'done'): void,
    (e:'change', column:Column): () => void
}>()

const columnsWithFilters = computed(() => props.columns.filter(c => c.settings.filters.length > 0))

function enumValues(filters:Filter[]) {
    return filters?.[0]?.value?.split(',')
}

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

function filterValue(column:Column, filter:Filter) {
    return filterRuleValue(filterRule(column.type, filter.value)!, column.type, filter)
}

function removeFilters(column:Column) {
    column.settings.filters = []
    emit('change', column)
}
function removeFilter(column:Column, index:number) {
    column.settings.filters.splice(index,1)
    emit('change', column)
}

function clearAll() {
    props.columns.forEach(column => {
        column.settings.filters = []
        emit('change', column)
    })
    emit('done')
}

</script>