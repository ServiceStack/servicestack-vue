<template>
    <Component v-if="Sole.component(type)" :is="Sole.component(type)" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
    <SelectInput v-else-if="type=='select'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" :entries="input.allowableEntries" :values="input.allowableValues" v-bind="inputAttrs" />
    <CheckboxInput v-else-if="type=='checkbox'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
    <TagInput v-else-if="type=='tag'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" :allowableValues="input.allowableValues" :string="(input as InputProp).prop?.type == 'String'" v-bind="inputAttrs" />
    <Combobox v-else-if="type=='combobox'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" :entries="input.allowableEntries" :values="input.allowableValues" v-bind="inputAttrs" />
    <FileInput v-else-if="type=='file'" :id="input.id" :status="api?.error" v-model="modelField" :input-class="input.css?.input" :label-class="input.css?.label" :files="files" v-bind="inputAttrs" />
    <TextareaInput v-else-if="type=='textarea'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
    <MarkdownInput v-else-if="type=='MarkdownInput'" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
    <TextInput v-else :type="type" :id="input.id" v-model="modelField" :status="api?.error" :input-class="input.css?.input" :label-class="input.css?.label" v-bind="inputAttrs" />
</template>

<script setup lang="ts">
import type { UploadedFile, InputProp } from '@/types'
import type { DynamicInputProps, DynamicInputEmits } from '@/components/types'
import { Sole } from '@/use/config'
import { lastRightPart, map, omit } from '@servicestack/client'
import { computed, ref, watch } from 'vue'

const props = defineProps<DynamicInputProps>()

const emit = defineEmits<DynamicInputEmits>()

const type = computed(() => props.input.type || 'text')

const excludeAttrs = 'ignore,css,options,meta,allowableValues,allowableEntries,op,prop,type,id,name'.split(',')
const inputAttrs = computed(() => omit(props.input, excludeAttrs))

// const m = map(props.modelValue[props.input.id], v => inputValue(props.input.type, v))
// console.log('m', props.input.id, props.input.type, props.modelValue[props.input.id], m)
const modelField = ref<any>(type.value === 'file' 
    ? null
    : props.modelValue[props.input.id])

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