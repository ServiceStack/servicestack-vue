<template>
<div>
    <div class="sm:hidden">
        <label :for="id" class="sr-only">Select a tab</label>
        <select :id="id" :name="id" class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" @change="select(($event.target as HTMLSelectElement)?.value)">
            <option :key="tab" v-for="tab in tabNames" :value="tab">{{ label(tab) }}</option>
        </select>
    </div>
    <div class="hidden sm:block">
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex" aria-label="Tabs">
            <a v-for="tab in tabNames" href="#" @click.prevent="select(tab)" :style="{ width }"
                :class="[!isSelected(tab) ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-1 text-center border-b-2 font-medium text-sm'
                                          : 'border-indigo-500 text-indigo-600 py-4 px-1 text-center border-b-2 font-medium text-sm', tabClass]">{{ label(tab) }}</a>
            </nav>
        </div>
    </div>
    <div :class="bodyClass">
        <component :is="tabs[selected]"></component>
    </div>
</div>
</template>

<script setup lang="ts">
import type { TabsProps } from '@/components/types'
import { humanize, queryString, rightPart } from '@servicestack/client'
import { computed, onMounted, ref, type Component } from 'vue'
import { pushState } from '@/use/utils'

const props = withDefaults(defineProps<TabsProps>(), {
    id: 'tabs',
    param: 'tab',
    label: (tab:string) => humanize(tab),
    bodyClass: 'p-4',
    url:true,
    clearQuery:false,
})

const tabNames = computed(() =>  Object.keys(props.tabs))
const label = (tab:string) => props.label ? props.label(tab) : humanize(tab)

const id = computed(() => props.id || 'tabs')
const param = computed(() => props.param || 'tab')

const selected = ref()

function select(tab:string) {
    selected.value = tab
    if (props.url) {
        const firstTab = tabNames.value[0]
        pushState({ tab: tab === firstTab ? undefined : tab }, props.clearQuery)
    }
}

function isSelected(tab:string) {
    return selected.value === tab
}

const width = computed(() => `${100 / Object.keys(props.tabs).length}%`)

onMounted(() => {
    selected.value = props.selected || Object.keys(props.tabs)[0]
    if (props.url) {
        const search = location.search ? location.search : location.hash.includes('?') ? '?' + rightPart(location.hash,'?') : ''
        let qs = queryString(search)
        const tab = qs[param.value]
        if (tab) {
            selected.value = tab
        }
    }
})

</script>