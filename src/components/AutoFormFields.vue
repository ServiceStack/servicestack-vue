<template>
<ErrorSummary :status="api?.error" :except="visibleFields" />
<div class="flex flex-1 flex-col justify-between">
    <div class="divide-y divide-gray-200 px-4 sm:px-6">
        <div class="space-y-6 pt-6 pb-5">
            <fieldset class="grid grid-cols-12 gap-6">
                <div v-for="[f,dataModelProp] in supportedFields" :class="[f.css?.field ?? (f.type == 'textarea' 
                    ? 'col-span-12'
                    : 'col-span-12 xl:col-span-6' + (f.type == 'checkbox' ? ' flex items-center' : '')),
                    f.type == 'hidden' ? 'hidden' : '']" style="width:100%">

                    <LookupInput v-if="dataModelProp?.ref != null && f.type != 'file'"
                        :metadataType="dataModelType" :input="f" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" :status="api?.error" />
                    <DynamicInput :input="f" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)" :api="api" />
                </div>
            </fieldset>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { InputInfo, MetadataPropertyType, ApiRequest, ResponseStatus } from '@/types'
import { computed } from 'vue'
import { useMetadata } from '@/use/metadata'
import { getTypeName } from '@/use/utils'

const props = defineProps<{
  modelValue: ApiRequest
  api: {error?:ResponseStatus}|null
  formLayout?: InputInfo[]
}>()

const emit = defineEmits<{
    (e: "update:modelValue", o:any): void
}>()

const { metadataApi, supportsProp, typeOf, typeOfRef, createFormLayout } = useMetadata()

const typeName = computed(() => getTypeName(props.modelValue))

const type = computed(() => typeOf(typeName.value))
const dataModelType = computed(() => 
    typeOfRef(metadataApi.value?.operations.find(x => x.request.name == typeName.value)?.dataModel) || type.value)

const supportedFields = computed(() => {
    const metaType = type.value
    if (!metaType) throw new Error(`MetadataType for ${typeName.value} not found`)
    const dataModel = dataModelType.value
    const fields = props.formLayout || createFormLayout(metaType)
    const ret:[InputInfo,MetadataPropertyType|undefined][] = []
    fields.forEach(f => {
        const propType = metaType.properties?.find(x => x.name == f.name)
        const dataModelProp = dataModel?.properties?.find(x => x.name == f.name)
        if (f.ignore || !supportsProp(propType)) return
        ret.push([f,dataModelProp])
    })
    return ret
})

const visibleFields = computed(() => supportedFields.value.filter(x => x[0].type != 'hidden').map(x => x[0].id))
</script>