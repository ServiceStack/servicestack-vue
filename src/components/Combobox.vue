<template>
    <input type="hidden" :id="id" :name="id" :value="formValue" />
    <Autocomplete ref="input" :id="id" :options="kvpValues" :match="match" :multiple="multiple" v-bind="$attrs"
                 v-model="model" @update:modelValue="updateModelValue">
        <template #item="{ key, value }">
            <span class="block truncate">{{ value }}</span>
        </template>
    </Autocomplete>
</template>

<script setup lang="ts">
import type { Pair } from '@/types';
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
    id: string
    modelValue?: any,
    multiple?: boolean,
    options?: any
    values?: string[]
    entries?: { key:string, value:string }[],
}>()

defineExpose({ 
    toggle(expand:boolean) {
        input.value?.toggle(expand)
    }
})

const emit = defineEmits<{
    (e: "update:modelValue", value: any[]|any): void
}>()

function updateModelValue(model:any[]|any) {
    emit('update:modelValue', model)
}

const multiple = computed(() => props.multiple != null ? props.multiple : Array.isArray(props.modelValue))

const input = ref()

function match(item:{key:string,value:string}, value:string) {
    const ret = !value || item.value.toLowerCase().includes(value.toLowerCase())
    return ret
}

const kvpValues = computed<Pair[]>(() => props.entries || (props.values 
    ? props.values.map(x => ({ key:x, value:x }))
    : props.options 
        ? Object.keys(props.options).map(key => ({ key, value:props.options[key] }))
        : []))

const model = ref<Pair|Pair[]|null>(multiple.value ? [] : null) // {key:string,value:string}

onMounted(() => {
    if (props.modelValue == null || props.modelValue === '') {
        model.value = (multiple.value ? [] : null)
    } else if (typeof props.modelValue == 'string') {
        model.value = kvpValues.value.find(x => x.key === props.modelValue) || null
    } else if (Array.isArray(props.modelValue)) {
        model.value = kvpValues.value.filter(x => props.modelValue.includes(x.key))
    }
})

const formValue = computed(() => model.value == null ? '' : (Array.isArray(model.value) 
    ? model.value.map(x => encodeURIComponent(x.key)).join(',')
    : model.value.key))
</script>