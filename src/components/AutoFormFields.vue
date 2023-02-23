<template>
<ErrorSummary :status="api?.error" :except="visibleFields" />
<div class="flex flex-1 flex-col justify-between">
    <div class="divide-y divide-gray-200 px-4 sm:px-6">
        <div class="space-y-6 pt-6 pb-5">
            <fieldset class="grid grid-cols-12 gap-6">
                <div v-for="f in supportedFields" :class="[f.css?.field ?? (f.type == 'textarea' 
                    ? 'col-span-12'
                    : 'col-span-12 xl:col-span-6' + (f.type == 'checkbox' ? ' flex items-center' : '')),
                    f.type == 'hidden' ? 'hidden' : '']" style="width:100%">

                    <LookupInput v-if="f.prop?.ref != null && f.type != 'file' && !f.prop.isPrimaryKey" :metadataType="dataModelType" 
                                         :input="f" :modelValue="modelValue" @update:modelValue="updateField(f,$event)" :status="api?.error" />
                    <DynamicInput v-else :input="f" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" :api="api" />
                </div>
            </fieldset>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { InputInfo, ApiRequest, ResponseStatus, InputProp } from '@/types'
import { computed } from 'vue'
import { useMetadata } from '@/use/metadata'
import { getTypeName } from '@/use/utils'

const props = defineProps<{
  modelValue: ApiRequest
  api: {error?:ResponseStatus}|null
  formLayout?: InputInfo[]
  configureField?: (field:InputProp) => void
}>()

const emit = defineEmits<{
    (e: "update:modelValue", o:any): void
}>()

function updateField(f:InputInfo, value:any) {
    props.modelValue[f.id] = value
    emit('update:modelValue', props.modelValue)
}

const { metadataApi, supportsProp, typeOf, typeOfRef, createFormLayout } = useMetadata()

const typeName = computed(() => getTypeName(props.modelValue))

const type = computed(() => typeOf(typeName.value))
const dataModelType = computed(() => 
    typeOfRef(metadataApi.value?.operations.find(x => x.request.name == typeName.value)?.dataModel) || type.value)

const supportedFields = computed(() => {
    const metaType = type.value
    if (!metaType) throw new Error(`MetadataType for ${typeName.value} not found`)
    const dataModel = dataModelType.value
    const fields = props.formLayout 
        ? props.formLayout
        : createFormLayout(metaType)
    const ret:InputProp[] = []
    fields.forEach(f => {
        const propType = metaType.properties?.find(x => x.name == f.name)
        const prop = dataModel?.properties?.find(x => x.name.toLowerCase() == f.name?.toLowerCase())
        if (!prop) return
        if (f.ignore || !supportsProp(propType)) return
        f.disabled = prop.isPrimaryKey
        const inputProp = Object.assign({ prop }, f)
        if (props.configureField) props.configureField(inputProp)
        ret.push(inputProp)
    })
    return ret
})

const visibleFields = computed(() => supportedFields.value.filter(x => x.type != 'hidden').map(x => x.id))
</script>