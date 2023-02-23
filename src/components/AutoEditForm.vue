<template>
<div>
    <div v-if="!metaType">
        <p class="text-red-700">Could not create form for unknown <b>type</b> {{ typeName }}</p>
    </div>
    <div v-else-if="formStyle=='card'" :class="panelClass">
        <form @submit.prevent="save">
            <div :class="formClass">
                <div>
                    <div v-if="$slots['heading']"><slot name="heading"></slot></div>
                    <h3 v-else :class="headingClass">{{ title }}</h3>

                    <div v-if="$slots['sub-heading']"><slot name="sub-heading"></slot></div>
                    <p v-else-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                    <p v-else-if="metaType?.notes" :class="['notes',subHeadingClass]" v-html="metaType?.notes"></p>
                </div>
    
                <AutoFormFields :modelValue="model" @update:modelValue="update" :api="api" :configureField="configureField" />
    
            </div>
            <div :class="form.buttonsClass">
                <div>
                    <ConfirmDelete v-if="deleteType" @delete="onDelete" />
                </div>
                <div>
                    <FormLoading v-if="showLoading && loading" />
                </div>
                <div class="flex justify-end">
                    <SecondaryButton @click="close" :disabled="loading">Cancel</SecondaryButton>
                    <PrimaryButton type="submit" class="ml-4" :disabled="loading">Save</PrimaryButton>
                </div>
            </div>
        </form>
    </div>
    <div v-else class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0"></div>
        <div class="fixed inset-0 overflow-hidden">
            <div @mousedown="close" class="absolute inset-0 overflow-hidden">
                <div @mousedown.stop="" class="pointer-events-none fixed inset-y-0 right-0 flex pl-10">
                    <div :class="['pointer-events-auto w-screen xl:max-w-3xl md:max-w-xl max-w-lg',transition1]">
                        <form :class="formClass" @submit.prevent="save">
                            <div class="flex min-h-0 flex-1 flex-col">
                                <div class="flex-1">
                                    <!-- Header -->
                                    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6">
                                        <div class="flex items-start justify-between space-x-3">
                                            <div class="space-y-1">
                                                <div v-if="$slots['heading']"><slot name="heading"></slot></div>
                                                <h3 v-else :class="headingClass">{{ title }}</h3>

                                                <div v-if="$slots['sub-heading']"><slot name="sub-heading"></slot></div>
                                                <p v-else-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                                                <p v-else-if="metaType?.notes" :class="['notes',subHeadingClass]" v-html="metaType?.notes"></p>
                                            </div>
                                            <div class="flex h-7 items-center">
                                                <CloseButton button-class="bg-gray-50 dark:bg-gray-900" @close="close"/>
                                            </div>
                                        </div>
                                    </div>
    
                                    <AutoFormFields :modelValue="model" @update:modelValue="update" :api="api" :configureField="configureField" />
    
                                </div>
                            </div>
                            <div :class="form.buttonsClass">
                                <div>
                                    <ConfirmDelete v-if="deleteType" @delete="onDelete" />
                                </div>
                                <div>
                                    <FormLoading v-if="showLoading && loading" />
                                </div>
                                <div class="flex justify-end">
                                    <SecondaryButton @click="close" :disabled="loading">Cancel</SecondaryButton>
                                    <PrimaryButton type="submit" class="ml-4" :disabled="loading">Save</PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <ModalLookup v-if="modal?.name == 'ModalLookup' && modal.ref" :ref-info="modal.ref" @done="openModalDone" />
</div>
</template>

<script setup lang="ts">
import type { ApiRequest, ApiResponse, ResponseStatus, ModalProvider, InputProp } from '@/types'
import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useClient } from '@/use/client'
import { toFormValues, useMetadata } from '@/use/metadata'
import { form } from './css'
import { getTypeName, transition } from '@/use/utils'
import { ApiResult, HttpMethods, humanize, map, mapGet } from '@servicestack/client'

const props = withDefaults(defineProps<{
    modelValue: any
    type: string|InstanceType<any>|Function
    deleteType?: string|InstanceType<any>|Function
    formStyle?: "slideOver" | "card"
    panelClass?: string
    formClass?: string
    headingClass?: string
    subHeadingClass?: string
    heading?: string
    subHeading?: string
    autosave?: boolean
    showLoading?: boolean
    configureField?: (field:InputProp) => void
}>(), {
    formStyle: "slideOver",
    autosave: true,
    showLoading: true,
})

const emit = defineEmits<{
    (e:'done'): void
    (e:'save', response:any): () => void
    (e:'delete', response:any): () => void
    (e:'error', status:ResponseStatus): void
}>()

function update(value:ApiRequest) {
    //console.log('update', JSON.stringify(value))
}

const ModalProvider: ModalProvider = {
    openModal
}
provide('ModalProvider', ModalProvider)
const modal = ref<{name:string} & any>()
const modalDone = ref<(result:any) => any>()

function openModal(info:{name:string} & any, done:(result:any) => any) {
    modal.value = info
    modalDone.value = done
}
async function openModalDone(result:any) {
    if (modalDone.value) {
        modalDone.value(result)
    }
    modal.value = undefined
    modalDone.value = undefined
}

const { typeOf, apiOf, typeProperties, createFormLayout, getPrimaryKey, Crud, createDto, formValues } = useMetadata()

const typeName = computed(() => getTypeName(props.type))
const metaType = computed(() => typeOf(typeName.value))
const model = ref(typeof props.type == 'string' 
    ? createDto(props.type, toFormValues(props.modelValue)) 
    : (props.type ? new props.type(toFormValues(props.modelValue)) : null))

const panelClass = computed(() => props.panelClass || form.panelClass(props.formStyle))
const formClass = computed(() => props.formClass || form.formClass(props.formStyle))
const headingClass = computed(() => props.headingClass || form.headingClass(props.formStyle))
const subHeadingClass = computed(() => props.subHeadingClass || form.subHeadingClass(props.formStyle))

const dataModel = computed(() => Crud.model(metaType.value))
const title = computed(() => props.heading || typeOf(typeName.value)?.description || 
    (dataModel.value ? `Update ${humanize(dataModel.value)}` : humanize(typeName.value)))

const api = ref<ApiResponse>(new ApiResult<any>())

let client = useClient()
let loading = computed(() => client.loading.value)
const getPk = () => map(typeOf(Crud.model(metaType.value)), dataModel => getPrimaryKey(dataModel))

async function save(e:Event) {
    let form = e.target as HTMLFormElement
    if (!props.autosave) {
        emit('save', new model.value.constructor(formValues(form, typeProperties(metaType.value))))
        return
    }

    let method = map(model.value?.['getMethod'], fn => typeof fn =='function' ? fn() : null) || 'POST'
    let returnsVoid = map(model.value?.['createResponse'], fn => typeof fn == 'function' ? fn() : null) == null
    let pk = getPk()

    if (HttpMethods.hasRequestBody(method)) {
        let requestDto = new model.value.constructor()
        let pkValue = mapGet(props.modelValue, pk.name)
        let formData = new FormData(form)
        if (pk && !Array.from(formData.keys()).some(k => k.toLowerCase() == pk.name.toLowerCase())) {
            formData.append(pk.name, pkValue)
        }

        let reset:string[] = []
        const apiType = typeName.value && apiOf(typeName.value)
        if (apiType && Crud.isPatch(apiType)) {
            let origModel = toFormValues(props.modelValue)
            let formLayout = createFormLayout(metaType.value)
            let dirtyValues:{[k:string]:any} = {}
            if (pk) dirtyValues[pk.name] = pkValue
            formLayout.forEach(input => {
                let id = input.id
                let origValue = mapGet(origModel, id)
                if (pk && pk.name.toLowerCase() === id.toLowerCase()) {
                    return
                }
                let newValue = formData.get(id)
                let exists = newValue != null // only exists if checked 
                let changed = input.type === 'checkbox' 
                    ? exists !== !!origValue
                    : input.type === 'file'
                        ? exists
                        : newValue != origValue
                if (!newValue && !origValue) changed = false
                if (changed) {
                    if (newValue) {
                        dirtyValues[id] = newValue
                    } else {
                        if (input.type !== 'file') {
                            reset.push(id)
                        }
                    }
                }
            })
            Array.from(formData.keys()).filter(k => !dirtyValues[k]).forEach(k => formData.delete(k))

            let keys = Array.from(formData.keys()).filter(k => k.toLowerCase() != pk.name.toLowerCase())
            if (keys.length == 0 && reset.length == 0) {
                close()
                return
            }
        }

        const args = reset.length > 0 ? { jsconfig: 'eccn', reset } : { jsconfig: 'eccn' }
        if (!returnsVoid) {
            api.value = await client.apiForm(requestDto, formData, args)
        } else {
            api.value = await client.apiFormVoid(requestDto, formData, args)
        }
    } else {
        let fieldValues = formValues(form, typeProperties(metaType.value))
        if (pk && !mapGet(fieldValues,pk.name)) {
            fieldValues[pk.name] = mapGet(props.modelValue, pk.name)
        }

        let requestDto = new model.value.constructor(fieldValues)
        if (!returnsVoid) {
            api.value = await client.api(requestDto, { jsconfig: 'eccn' })
        } else {
            api.value = await client.apiVoid(requestDto, { jsconfig: 'eccn' })
        }
    }

    if (api.value.succeeded) {
        form.reset()
        emit('save', api.value.response)
    } else {
        emit('error', api.value.error!)
    }
}

async function onDelete(e:Event) {
    let pk = getPk()
    const id = pk ? mapGet(props.modelValue, pk.name) : null
    if (!id) {
        console.error(`Could not find Primary Key for Type ${typeName.value} (${dataModel.value})`)
        return
    }
    const args = { [pk!.name]: id }
    const request = typeof props.deleteType == 'string' 
        ? createDto(props.deleteType, args) 
        : (props.deleteType ? new props.deleteType(args) : null)

    let returnsVoid = map(request['createResponse'], fn => typeof fn == 'function' ? fn() : null) == null
    if (!returnsVoid) {
        api.value = await client.api(request)
    } else {
        api.value = await client.apiVoid(request)
    }

    if (api.value.succeeded) {
        emit('delete', api.value.response)
    } else {
        emit('error', api.value.error!)
    }
}

function done() {
    emit('done')
}

/* SlideOver */
const show = ref(false)
const transition1 = ref('')
const rule1 = {
    entering: { cls: 'transform transition ease-in-out duration-500 sm:duration-700', from: 'translate-x-full', to: 'translate-x-0' },
    leaving:  { cls: 'transform transition ease-in-out duration-500 sm:duration-700', from: 'translate-x-0', to: 'translate-x-full' }
}
watch(show, () => {
    transition(rule1, transition1, show.value)
    if (!show.value) setTimeout(done, 700)
})
show.value = true
function close() {
    if (props.formStyle == 'slideOver') {
        show.value = false
    } else {
        done()
    }
}

const globalKeyHandler = (e:KeyboardEvent) => { if (e.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', globalKeyHandler))
onUnmounted(() => window.removeEventListener('keydown', globalKeyHandler))
</script>