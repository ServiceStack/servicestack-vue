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
import { computed, onMounted, ref } from 'vue'
import type { Pair } from '@/types';
import type { ComboboxProps, ComboboxEmits, ComboboxExpose } from '@/components/types'

const props = defineProps<ComboboxProps>()

defineExpose<ComboboxExpose>({ 
    toggle(expand:boolean) {
        input.value?.toggle(expand)
    }
})

const emit = defineEmits<ComboboxEmits>()

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

function update() {
    // Can be {key,value} when updated with setModel() 
    let modelValue = props.modelValue && typeof props.modelValue == 'object' && !Array.isArray(props.modelValue)
        ? props.modelValue.key
        : props.modelValue
    if (modelValue == null || modelValue === '') {
        model.value = (multiple.value ? [] : null)
    } else if (typeof modelValue == 'string') {
        model.value = kvpValues.value.find(x => x.key === modelValue) || null
    } else if (Array.isArray(modelValue)) {
        model.value = kvpValues.value.filter(x => modelValue.includes(x.key))
    }
}
onMounted(update)

const formValue = computed(() => model.value == null ? '' : (Array.isArray(model.value) 
    ? model.value.map(x => encodeURIComponent(x.key)).join(',')
    : model.value.key))
</script>