<template>
    <table class="my-2 w-full">
        <tr v-for="(v,k) in basic" class="leading-7">
            <th class="px-2 text-left align-top">{{humanize(k as string)}}</th>
            <td colspan="align-top"><MarkupFormat :value="v" /></td>                    
        </tr>
        <template v-for="(v,k) in complex">
        <tr class="my-2 leading-7">
            <td colspan="2" class="px-2 bg-indigo-700 text-white">{{humanize(k as string)}}</td>
        </tr>
        <tr class="leading-7">
            <td colspan="2" class="px-2 align-top"><MarkupFormat :value="v" /></td>                    
        </tr>
        </template>
    </table>
</template>

<script setup lang="ts">
import type { MarkupModelProps } from '@/components/types'
import { humanize } from '@servicestack/client'

const props = defineProps<MarkupModelProps>()

const fields = Object.keys(props.value)
const basic:{[k:string]:any} = {}
const complex:{[k:string]:any} = {}
fields.forEach(k => {
    const v = props.value[k]
    const t = typeof v
    if (v == null || t === 'function' || t === 'symbol') {
        basic[k] = `(${v == null ? 'null' : 't'})`
    }
    else if (t === 'object') {
        complex[k] = v
    } else {
        basic[k] = v
    }
})
</script>
