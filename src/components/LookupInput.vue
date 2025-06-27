<template>
  <div class="lookup-field">
    <input type="hidden" :name="id" :value="value" />
    <div v-if="useLabel" class="flex justify-between">
        <label :for="id" :class="`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
        <div v-if="value" class="flex items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400 pr-1">{{value}}</span>
            <button @click="clear" type="button" title="clear" class="mr-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:ring-offset-black">
                <span class="sr-only">Clear</span>
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    </div>
    
    <div v-if="useRef" class="mt-1 relative">
        <button type="button" class="lookup flex relative w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @click="lookup(useRef!)"
            aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
            <span class="w-full inline-flex truncate">
                <span class="text-blue-700 dark:text-blue-300 flex cursor-pointer">
                    <Icon class="mr-1 w-5 h-5" :image="icon" />
                    <span>{{refInfoValue}}</span>
                </span>
            </span>
            <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </span>
        </button>
    </div>    
    
    <p v-if="errorField" class="mt-2 text-sm text-red-500" :id="`${id}-error`">{{ errorField }}</p>
    <p v-else-if="help" class="mt-2 text-sm text-gray-500" :id="`${id}-description`">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
import type { JsonServiceClient } from '@servicestack/client'
import type { ApiState, RefInfo, ModalProvider } from '@/types'
import type { LookupInputProps, LookupInputEmits } from '@/components/types'
import { Sole, useConfig } from '@/use/config'
import { getPrimaryKey, LookupValues, typeOf, typeProperties, useMetadata } from '@/use/metadata'
import { isComplexType, scopedExpr } from '@/use/utils'
import { errorResponse, humanize, mapGet, toPascalCase } from '@servicestack/client'
import { computed, inject, onMounted, ref, unref } from 'vue'

const { config } = useConfig()
const { metadataApi } = useMetadata()

const props = defineProps<LookupInputProps>()
const emit = defineEmits<LookupInputEmits>()

const id = computed(() => props.id || props.input.id)
const useLabel = computed(() => props.label ?? humanize(toPascalCase(id.value)))

let ctx = inject<ApiState|undefined>('ApiState', undefined)
const client = inject<JsonServiceClient>('client')!
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? ctx?.error.value }, id.value))

const refInfoValue = ref('')
const refPropertyName = ref('') //debug info
const value = computed(() => mapGet(props.modelValue, id.value))
const property = computed(() => typeProperties(props.metadataType).find(x => x.name.toLowerCase() == id.value.toLowerCase()))
const icon = computed(() => typeOf(property.value?.ref?.model)?.icon || config.value.tableIcon)

function withOptions(refInfo:RefInfo|null) {
    return !refInfo 
        ? null 
        : props.input.options
            ? Object.assign({}, refInfo, scopedExpr(props.input.options, { 
                input: props.input, 
                $typeFields: typeProperties(props.metadataType).map(x => x.name),
                ...Sole.config.scopeWhitelist 
            }))
            : refInfo
}
const useRef = computed(() => withOptions(property.value?.ref 
    ?? (props.input.type == 'lookup' ? { 
        model: props.metadataType.name, 
        refId: getPrimaryKey(props.metadataType)?.name ?? 'id',
        refLabel: props.metadataType.properties?.find(x => x.type == 'String' && !x.isPrimaryKey)?.name,
    } as RefInfo : null)))

let ModalProvider:ModalProvider|undefined

function lookup(ref:RefInfo) {
    if (!ref) {
        return
    }
    if (ModalProvider == null) {
        console.warn('No ModalProvider required by LookupInput')
        return
    }
    ModalProvider!.openModal({ name:'ModalLookup', ref }, (refModel:any) => {
        console.debug('openModal', refInfoValue.value, ' -> ', refModel, LookupValues.setRefValue(ref, refModel), ref)
        if (refModel) {
            const newValue = mapGet(refModel, ref.refId)
            refInfoValue.value = LookupValues.setRefValue(ref, refModel) || newValue

            const newModel = unref(props.modelValue)
            newModel[id.value] = newValue
            //console.debug('update:modelValue', newModel, id.value, newValue)

            emit('update:modelValue', newModel)
        }
    })
}

function clear() {
    props.modelValue[id.value] = null
    refInfoValue.value = ''
}

onMounted(async () => {
    ModalProvider = inject<ModalProvider|undefined>('ModalProvider', undefined)

    const model = props.modelValue
    if (!props.modelValue[id.value]) {
        props.modelValue[id.value] = null
    }

    const prop = property.value
    const refInfo = useRef.value
    if (!prop || !refInfo) {
        console.warn(`No RefInfo for property '${id.value}'`)
        return
    }

    refInfoValue.value = ''
    let refIdValue = refInfo.selfId == null
        ? mapGet(model, prop.name)
        : mapGet(model, refInfo.selfId)

    const isRefType = isComplexType(refIdValue)
    // console.log('refIdValue', refIdValue, isComplexType(refIdValue), model, refInfo)
    if (isRefType) {
        refIdValue = mapGet(model, refInfo.refId)
    }
    if (refIdValue == null)
        return

    const queryOp = metadataApi.value?.operations.find(x => x.dataModel?.name == refInfo.model)
    console.debug('LookupInput queryOp', queryOp)
    if (queryOp != null) {
        const propValue = mapGet(model, prop.name)
        if (isComplexType(propValue)) return

        refInfoValue.value = `${propValue}`
        refPropertyName.value = prop.name

        // console.debug('refInfoValue', refInfoValue.value)
        // console.debug('refInfo', refInfo)
        if (refInfo.refLabel != null) {
            const colModels = typeProperties(props.metadataType).filter(x => x.type == refInfo.model)
            if (!colModels.length) {
                console.warn(`Could not find ${refInfo.model} Property on ${props.metadataType.name}`)
            }
            const modelValues = colModels.map(x => mapGet(model, x.name)).filter(x => !!x)
            const modelValue = modelValues.length <= 1
                ? modelValues[0]
                : modelValues.find(x => x[refInfo.refId ?? 'id'] == refIdValue)
            // console.log('models', modelValue, colModels, modelValues)
            if (modelValue != null) {
                let label = mapGet(modelValue,refInfo.refLabel)
                // console.debug('LookupInput refInfoValue (label)', label, JSON.stringify(model), refInfo.refLabel)
                if (label) {
                    refInfoValue.value = `${label}`
                    LookupValues.setValue(refInfo.model, refIdValue, refInfo.refLabel, label)
                }
            } else {
                const isComputed = prop.attributes?.some(x => x.name == 'Computed') == true
                let label = await LookupValues.getOrFetchValue(client, metadataApi.value!, refInfo.model, refInfo.refId, refInfo.refLabel, isComputed, refIdValue)
                refInfoValue.value = label ? label : `${refInfo.model}: ${refInfoValue.value}`
                // console.debug('LookupInput refInfoValue (!label)', refInfoValue.value)
            }
        }
    }
})

</script>