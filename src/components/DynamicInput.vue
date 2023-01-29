<template>
    <SelectInput v-if="type=='select'" :id="input.id" v-model="modelValue" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" :entries="input.allowableEntries" />
    <CheckboxInput v-else-if="type=='checkbox'" :id="input.id" v-model="modelValue" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" />
    <TagInput v-else-if="type=='tag'" :id="input.id" v-model="modelValue" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" />
    <FileInput v-else-if="type=='file'" :id="input.id" :status="api?.error" v-model="modelValue" :input-class="input.css?.input" :label-class="input.css?.label" :files="files" :multiple="input.multiple" />
    <TextareaInput v-else-if="type=='textarea'" :id="input.id" v-model="modelValue" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" />
    <TextInput v-else :type="type" :id="input.id" v-model="modelValue" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" />
</template>

<script setup lang="ts">
import type { InputInfo, ApiRequest, ResponseStatus, UploadedFile } from '@/types'
import { lastRightPart, map } from '@servicestack/client'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
    input: InputInfo
    modelValue: ApiRequest
    api: {error?:ResponseStatus}|null
}>()

const emit = defineEmits<{
    (e: "update:modelValue", o:any): void
}>()

const type = computed(() => props.input.type || 'text')

const modelValue = ref<any>(map(props.modelValue[props.input.id], v => props.input.type !== 'file' ? v : null))

watch(modelValue, () => {
    props.modelValue[props.input.id] = modelValue.value
    emit('update:modelValue', props.modelValue)
})

const files = computed(() => {
    const val = props.modelValue[props.input.id]
    if (props.input.type !== 'file' || !val) return []
    if (typeof val == 'string') return [{ filePath: val, fileName: lastRightPart(val,'/') }]
    if (!Array.isArray(val) && typeof val == 'object') return val
    if (Array.isArray(val)) {
        const to:UploadedFile[] = []
        val.forEach(x => {
            if (typeof x == 'string') to.push({ filePath: x, fileName: lastRightPart(x,'/') })
            else if (typeof x == 'object') to.push(x)
        })
        return to
    }
})
</script>