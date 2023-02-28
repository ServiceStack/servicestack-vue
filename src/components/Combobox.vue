<template>
    <Autocomplete v-bind="$attrs" :options="kvpValues" :match="match" :multiple="multiple">
        <template #item="{ key, value }">
            <span class="block truncate">{{ value }}</span>
        </template>
    </Autocomplete>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps<{
    multiple?: boolean,
    options?: any
    values?: string[]
    entries?: { key:string, value:string }[],
}>()

const attrs = useAttrs()

const multiple = computed(() => props.multiple != null ? props.multiple : Array.isArray(attrs.modelValue))

function match(item:{key:string,value:string}, value:string) {
    const ret = !value || item.value.toLowerCase().includes(value.toLowerCase())
    return ret
}

const kvpValues = computed(() => props.entries || (props.values 
    ? props.values.map(x => ({ key:x, value:x }))
    : props.options 
        ? Object.keys(props.options).map(key => ({ key, value:props.options[key] }))
        : []))
</script>