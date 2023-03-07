<template>
<ErrorSummary v-if="!hideSummary" :status="api?.error" :except="visibleFields" />
<div :class="flexClass">
    <div :class="divideClass">
        <div :class="spaceClass">
            <fieldset :class="fieldsetClass">
                <div v-for="f in supportedFields" key="f.id" :class="['w-full', f.css?.field ?? (f.type == 'textarea' 
                    ? 'col-span-12'
                    : 'col-span-12 xl:col-span-6' + (f.type == 'checkbox' ? ' flex items-center' : '')),
                    f.type == 'hidden' ? 'hidden' : '']">

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
import { typeForInput, typeProperties, useMetadata } from '@/use/metadata'
import { getTypeName } from '@/use/utils'
import { mapGet } from "@servicestack/client"

const props = withDefaults(defineProps<{
  modelValue: ApiRequest
  type?: string
  api: {error?:ResponseStatus}|null
  formLayout?: InputInfo[]
  configureField?: (field:InputProp) => void
  hideSummary?: boolean
  flexClass?: string
  divideClass?: string
  spaceClass?: string
  fieldsetClass?: string
}>(), {
    flexClass: "flex flex-1 flex-col justify-between",
    divideClass: "divide-y divide-gray-200 px-4 sm:px-6",
    spaceClass: "space-y-6 pt-6 pb-5",
    fieldsetClass: "grid grid-cols-12 gap-6"
})

const emit = defineEmits<{
    (e: "update:modelValue", o:any): void
}>()

function updateField(f:InputInfo, newModel:any) {
    props.modelValue[f.id] = mapGet(newModel, f.id)
    emit('update:modelValue', props.modelValue)
}

const { metadataApi, apiOf, typeOf, typeOfRef, createFormLayout, Crud } = useMetadata()

const typeName = computed(() => props.type || getTypeName(props.modelValue))

const type = computed(() => typeOf(typeName.value))
const dataModelType = computed(() => 
    typeOfRef(metadataApi.value?.operations.find(x => x.request.name == typeName.value)?.dataModel) || type.value)

const supportedFields = computed(() => {
    const metaType = type.value
    if (!metaType) {
        if (props.formLayout) {
            return props.formLayout.map(f => {
                const prop = { name:f.id, type:typeForInput(f.type) }
                const inputProp = Object.assign({ prop }, f) as InputProp
                if (props.configureField) props.configureField(inputProp)
                return inputProp
            })
        }
        throw new Error(`MetadataType for ${typeName.value} not found`)
    }
    const metaTypeProps = typeProperties(metaType)
    const dataModel = dataModelType.value
    const fields = props.formLayout 
        ? props.formLayout
        : createFormLayout(metaType)
    const ret:InputProp[] = []
    const op = apiOf(metaType.name)
    fields.forEach(f => {
        const propType = metaTypeProps.find(x => x.name == f.name)
        if (f.ignore) return
        const prop = dataModel?.properties?.find(x => x.name.toLowerCase() == f.name?.toLowerCase()) ?? propType
        const inputProp = Object.assign({ prop, op }, f) as InputProp
        if (props.configureField) props.configureField(inputProp)
        ret.push(inputProp)
    })
    return ret
})

const visibleFields = computed(() => supportedFields.value.filter(x => x.type != 'hidden').map(x => x.id))
</script>