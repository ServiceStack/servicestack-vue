<template>
    <SelectInput v-if="type=='select'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" :entries="input.allowableEntries" :values="input.allowableValues" v-bind="inputAttrs" />
    <CheckboxInput v-else-if="type=='checkbox'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
    <TagInput v-else-if="type=='tag'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" :allowableValues="input.allowableValues" :string="(input as InputProp).prop?.type == 'String'" v-bind="inputAttrs" />
    <Combobox v-else-if="type=='combobox'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" :entries="input.allowableEntries" :values="input.allowableValues" v-bind="inputAttrs" />
    <FileInput v-else-if="type=='file'" :id="input.id" :status="api?.error" v-model="modelField" :input-class="input.css?.input" :label-class="input.css?.label" :files="files" v-bind="inputAttrs" />
    <TextareaInput v-else-if="type=='textarea'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
    <TextInput v-else :type="type" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
</template>

<script setup lang="ts">
import type { InputInfo, ApiRequest, ApiResponseType, UploadedFile, InputProp } from '@/types'
import { dateInputFormat, timeInputFormat } from '@/use/utils'
import { lastRightPart, map, pick } from '@servicestack/client'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
    input: InputProp|InputInfo
    modelValue: ApiRequest
    api: ApiResponseType|null
}>()

const emit = defineEmits<{
    (e: "update:modelValue", o:any): void
}>()

const type = computed(() => props.input.type || 'text')

const attrNames = 'placeholder,help,label,title,size,pattern,readOnly,required,disabled,autocomplete,autofocus,min,max,step,minLength,maxLength,accept,capture,multiple'.split(',')
const inputAttrs = computed(() => pick(props.input, attrNames))

const modelField = ref<any>(map(props.modelValue[props.input.id], 
    v => props.input.type === 'file' 
        ? null
        : (props.input.type === 'date' && v instanceof Date 
            ? dateInputFormat(v) 
            : props.input.type === 'time'
                ? timeInputFormat(v) 
                : v)))

watch(modelField, () => {
    props.modelValue[props.input.id] = modelField.value
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