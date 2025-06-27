<template>
<ErrorSummary v-if="!hideSummary" :status="api?.error" :except="visibleFields()" />
<div :class="flexClass">
    <div :class="divideClass">
        <div :class="spaceClass">
            <fieldset :class="fieldsetClass">
                <div v-for="f in getSupportedFields()" :key="f.id" :class="['w-full', f.css?.field ?? (f.type == 'textarea' 
                    ? 'col-span-12'
                    : 'col-span-12 xl:col-span-6' + (f.type == 'checkbox' ? ' flex items-center' : '')),
                    f.type == 'hidden' ? 'hidden' : '']">

                    <LookupInput v-if="f.type === 'lookup' || (f.prop?.ref != null && f.type != 'file' && !f.prop.isPrimaryKey)" :metadataType="dataModelType" 
                                         :input="f" :modelValue="modelValue" @update:modelValue="updateField(f,$event)" :status="api?.error" />
                    <DynamicInput v-else :input="f" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" :api="api" />
                </div>
            </fieldset>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { InputInfo, InputProp } from '@/types'
import type { AutoFormFieldsProps, AutoFormFieldsEmits } from '@/components/types'
import { computed, getCurrentInstance } from 'vue'
import { typeForInput, typeProperties, useMetadata } from '@/use/metadata'
import { getTypeName } from '@/use/utils'
import { mapGet } from "@servicestack/client"

const props = withDefaults(defineProps<AutoFormFieldsProps>(), {
    flexClass: "flex flex-1 flex-col justify-between",
    divideClass: "divide-y divide-gray-200 px-4 sm:px-6",
    spaceClass: "space-y-6 pt-6 pb-5",
    fieldsetClass: "grid grid-cols-12 gap-6"
})

const emit = defineEmits<AutoFormFieldsEmits>()

defineExpose({ forceUpdate, props, updateValue })
function forceUpdate() {
    const instance = getCurrentInstance()
    instance?.proxy?.$forceUpdate()
}

function updateField(f:InputInfo, newModel:any) {
    updateValue(f.id, mapGet(newModel, f.id))
}
function updateValue(id:string, value:any) {
    props.modelValue[id] = value
    emit('update:modelValue', props.modelValue)
    forceUpdate()
}

const { metadataApi, apiOf, typeOf, typeOfRef, createFormLayout, Crud } = useMetadata()

const typeName = computed(() => props.type || getTypeName(props.modelValue))

const type = computed(() => props.metaType ?? typeOf(typeName.value))
const dataModelType = computed(() => 
    typeOfRef(metadataApi.value?.operations.find(x => x.request.name == typeName.value)?.dataModel) || type.value)

function getSupportedFields() {
    const metaType = type.value
    if (!metaType) {
        if (props.formLayout) {
            const ret = props.formLayout.map(f => {
                const prop = { name:f.id, type:typeForInput(f.type) }
                const inputProp = Object.assign({ prop }, f) as InputProp
                if (props.configureField) props.configureField(inputProp)
                return inputProp
            })
            if (props.configureFormLayout)
                props.configureFormLayout(ret)
            return ret
        }
        throw new Error(`MetadataType for ${typeName.value} not found`)
    }
    const metaTypeProps = typeProperties(metaType)
    const dataModel = dataModelType.value
    const fields = props.formLayout 
        ? Array.from(props.formLayout)
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
    if (props.configureFormLayout)
        props.configureFormLayout(ret)
    return ret
}

const visibleFields = () => getSupportedFields().filter(x => x.type != 'hidden').map(x => x.id)
</script>