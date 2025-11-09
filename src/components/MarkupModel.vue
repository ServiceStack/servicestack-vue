<template>
    <table :class="props.tableClass ?? 'my-2 w-full'">
        <tbody>
            <tr v-for="(v,k) in basic" :class="props.basicTrClass ?? 'leading-7'">
                <th :class="props.basicThClass ?? 'px-2 text-left align-top'">{{humanize(k as string)}}</th>
                <td :class="props.basicTdClass ?? 'align-top'"><MarkupFormat :value="v" /></td>
            </tr>
            <template v-for="(v,k) in complex">
                <tr :class="props.complexTitleTrClass ?? 'my-2 leading-7'">
                    <th colspan="2" :class="props.complexTitleTdClass ?? 'px-2 bg-indigo-700 text-white'">{{humanize(k as string)}}</th>
                </tr>
                <tr :class="props.complexBodyTrClass ?? 'leading-7'">
                    <td colspan="2" :class="props.complexBodyTdClass ?? 'px-2 align-top'"><MarkupFormat :value="v" /></td>
                </tr>
            </template>
        </tbody>
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
