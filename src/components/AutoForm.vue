<template>
<div>
    <div v-if="!metaType">
        <p class="text-red-700">Could not create form for unknown <b>type</b> {{ typeName }}</p>
    </div>
    <div v-else-if="formStyle=='card'" :class="panelClass">
        <form ref="elForm" @submit.prevent="submitForm($event.target as HTMLFormElement)" autocomplete="off" :class="innerFormClass">
            <div :class="bodyClass">
                <div :class="headerClass">
                    <div v-if="$slots['heading']"><slot name="heading"></slot></div>
                    <h3 v-else :class="headingClass">{{ title }}</h3>

                    <div v-if="$slots['subheading']"><slot name="subheading"></slot></div>
                    <p v-else-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                    <p v-else-if="metaType?.notes" :class="['notes',subHeadingClass]" v-html="metaType?.notes"></p>
                </div>

                <slot name="header" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
                <input type="submit" class="hidden">
                <AutoFormFields ref="formFields" :key="formFieldsKey" :type="type" :modelValue="model" @update:modelValue="update" :api="api" 
                    :configureField="configureField" :configureFormLayout="configureFormLayout" />
                <slot name="footer" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
            </div>
            <slot name="buttons">
                <div :class="buttonsClass">
                    <div>
                        <slot name="leftbuttons" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
                    </div>
                    <div>
                        <FormLoading v-if="showLoading && loading" />
                    </div>
                    <div class="flex justify-end">
                        <div></div>
                        <PrimaryButton :disabled="loading || (allowSubmit ? !allowSubmit(model) : false)">{{ submitLabel }}</PrimaryButton>
                        <slot name="rightbuttons" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
                    </div>
                </div>
            </slot>
        </form>
    </div>
    <div v-else class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0"></div>
        <div class="fixed inset-0 overflow-hidden">
            <div @mousedown="close" class="absolute inset-0 overflow-hidden">
                <div @mousedown.stop="" class="pointer-events-none fixed inset-y-0 right-0 flex pl-10">
                    <div :class="['pointer-events-auto w-screen xl:max-w-3xl md:max-w-xl max-w-lg',transition1]">
                        <form ref="elForm" :class="formClass" @submit.prevent="submitForm($event.target as HTMLFormElement)">
                            <div class="flex min-h-0 flex-1 flex-col overflow-auto">
                                <div class="flex-1">
                                    <!-- Header -->
                                    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6">
                                        <div class="flex items-start justify-between space-x-3">
                                            <div class="space-y-1">
                                                <div v-if="$slots['heading']"><slot name="heading"></slot></div>
                                                <h3 v-else :class="headingClass">{{ title }}</h3>

                                                <div v-if="$slots['subheading']"><slot name="subheading"></slot></div>
                                                <p v-else-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                                                <p v-else-if="metaType?.notes" :class="['notes',subHeadingClass]" v-html="metaType?.notes"></p>
                                            </div>
                                            <div class="flex h-7 items-center">
                                                <CloseButton button-class="bg-gray-50 dark:bg-gray-900" @close="close"/>
                                            </div>
                                        </div>
                                    </div>
    
                                    <slot name="header" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
                                    <AutoFormFields ref="formFields" :key="formFieldsKey" :type="type" :modelValue="model" @update:modelValue="update" :api="api" 
                                        :configureField="configureField" :configureFormLayout="configureFormLayout" />
                                    <slot name="footer" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
    
                                </div>
                            </div>
                            <div :class="buttonsClass">
                                <div>
                                    <slot name="leftbuttons" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
                                </div>
                                <div>
                                    <FormLoading v-if="showLoading && loading" />
                                </div>
                                <div class="flex justify-end">
                                    <SecondaryButton @click="close" :disabled="loading">Cancel</SecondaryButton>
                                    <PrimaryButton class="ml-4" :disabled="loading || (allowSubmit ? !allowSubmit(model) : false)">{{ submitLabel }}</PrimaryButton>
                                    <slot name="rightbuttons" :instance="getCurrentInstance()?.exposed" :model="model"></slot>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ModalLookup v-if="modal?.name == 'ModalLookup' && modal.ref" :ref-info="modal.ref" @done="openModalDone"
        :configureField="configureField"/>
</div>
</template>

<script setup lang="ts">
import type { MetadataType, ApiRequest, ResponseStatus, ModalProvider, InputProp } from '@/types'
import type { AutoFormProps, AutoFormEmits } from '@/components/types'
import { computed, provide, ref, getCurrentInstance, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ApiResult, HttpMethods, humanize, map, omitEmpty } from '@servicestack/client'
import { useClient } from '@/use/client'
import { transition, useUtils } from '@/use/utils'
import { useMetadata } from '@/use/metadata'
import { form, card, slideOver } from './css'

const props = withDefaults(defineProps<AutoFormProps>(), {
    formStyle: "card",
    headerClass: 'p-6',
    submitLabel: 'Submit',
    jsconfig: 'eccn,edv',
    showLoading: true,
})

const emit = defineEmits<AutoFormEmits>()

const formFields = ref()
const formFieldsKey = ref(1)
const elForm = ref()

function forceUpdate() {
    formFieldsKey.value++ //required to force revalidation
    model.value = resolveModel()
    const instance = getCurrentInstance()
    instance?.proxy?.$forceUpdate()
}
async function setModel(args:any) {
    Object.assign(model.value, args)
    forceUpdate()
    await nextTick(() => null) //allow callers to wait for when model is serialized to the form
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


const client = useClient()

const { getTypeName } = useUtils()
const { typeOf, Crud, createDto } = useMetadata()

const api = ref(new ApiResult())

const panelClass = computed(() => props.panelClass || form.panelClass(props.formStyle))
const formClass = computed(() => props.formClass || props.formStyle == "card" ? 'shadow sm:rounded-md' : slideOver.formClass)
const headingClass = computed(() => props.headingClass || form.headingClass(props.formStyle))
const subHeadingClass = computed(() => props.subHeadingClass || form.subHeadingClass(props.formStyle))
const buttonsClass = computed(() => typeof props.buttonsClass == 'string' ? props.buttonsClass : form.buttonsClass)

const typeName = computed(() => props.type ? getTypeName(props.type) : props.modelValue?.['getTypeName'] ? props.modelValue.getTypeName() : null)
const metaType = computed(() => props.metaType ?? typeOf(typeName.value))
const resolveModel = () => props.modelValue || newDto()
const model = ref(resolveModel())
const loading = computed(() => client.loading.value)
const title = computed(() => props.heading != null ? props.heading : (metaType.value?.description || humanize(typeName.value)))

defineExpose({ forceUpdate, props, setModel, formFields, submit, close, model })

function newDto() {
    return typeof props.type == 'string' ? createDto(props.type) : props.type ? new props.type() : props.modelValue
}

async function submitForm(form:HTMLFormElement) {
    if (!form || form.tagName != 'FORM') {
        console.error("Not a valid form", form)
        return
    }
    const dto = newDto()
    let method = map(dto?.['getMethod'], fn => typeof fn =='function' ? fn() : null) || 'POST'
    let returnsVoid = map(dto?.['createResponse'], fn => typeof fn == 'function' ? fn() : null) == null
    const jsconfig = props.jsconfig

    if (HttpMethods.hasRequestBody(method)) {
        let requestDto = new dto.constructor()
        let formData = new FormData(form)
        // console.debug('AutoForm.submitForm', requestDto, [...formData.keys()], [...formData.values()])
        if (!returnsVoid) {
            api.value = await client.apiForm(requestDto, formData, { jsconfig })
        } else {
            api.value = await client.apiFormVoid(requestDto, formData, { jsconfig })
        }
    } else {
        //let fieldValues = formValues(form, typeProperties(metaType.value))
        let requestDto = new dto.constructor(omitEmpty(model.value))
        console.debug('AutoForm.submit', requestDto)
        if (!returnsVoid) {
            api.value = await client.api(requestDto, { jsconfig })
        } else {
            api.value = await client.apiVoid(requestDto, { jsconfig })
        }
    }

    if (api.value.succeeded) {
        //console.debug('success',api.value?.response)
        emit('success', api.value.response)
        close()
    } else {
        //console.debug('error',api.value?.error)
        emit('error', api.value.error!)
    }
}


async function submit() {
    submitForm(elForm.value)
}

function update(newModel:ApiRequest|any) {
    emit('update:modelValue', newModel)
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
