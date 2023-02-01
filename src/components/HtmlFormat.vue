<template>
<div :class="nested ? '' : 'prose html-format'">
    <div v-if="isScalar" v-html="formatValue(value)"></div>
    <div v-else-if="isArray" class="flex flex-col">
        <div class="-my-2 sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div class="md:shadow overflow-hidden border-b border-gray-200 md:rounded-lg">    
                    <table class="table-array min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                        <tr>
                            <th v-for="k in fields" :class="['px-6 py-3 text-left tracking-wider whitespace-nowrap',thClass]">
                                <b></b>{{keyFmt(k)}}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row,index) in value" :class="index % 2 == 0 ? 'bg-white' : 'bg-gray-50'">
                                <td v-for="k in fields" :class="['px-6 py-4 whitespace-nowrap',tdClass]">
                                    <HtmlFormat :value="row[k]" :field-attrs="fieldAttrs" :nested="true" :th-class="thClass" :td-class="tdClass" v-bind="getAttrs(k)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <table class="table-object">
            <tr v-for="row in rows(value)">
                <th class="text-left font-medium align-top py-2 px-4 whitespace-nowrap">{{row.key}}</th>
                <td class="align-top py-2 px-4">
                    <HtmlFormat :value="row.val" :field-attrs="fieldAttrs" :nested="true" :th-class="thClass" :td-class="tdClass" v-bind="getAttrs(row.key)" />
                </td>
            </tr>
        </table>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { humanify, uniqueKeys } from '@servicestack/client'
import { isPrimitive } from '@/utils'
import { formatValue } from '@/formatters'

const props = withDefaults(defineProps<{
    value?: any,
    fieldAttrs?: (k:string) => any
    nested?: boolean
    thClass?: string
    tdClass?: string
}>(), {
    thClass: 'text-sm text-gray-500 font-medium',
    tdClass: 'text-sm text-gray-900',
})

const isScalar = computed(() => isPrimitive(props.value))
const isArray = computed(() => Array.isArray(props.value))
const keyFmt = (s:string) => humanify(s)
const getAttrs = (k:string) => props.fieldAttrs ? props.fieldAttrs(k) : null
const fields = computed(() => uniqueKeys(props.value))
const rows = (val:any) => Object.keys(val).map(k => ({ key:keyFmt(k), val: val[k] }))
</script>
