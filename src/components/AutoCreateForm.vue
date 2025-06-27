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
                    
                    <div v-if="$slots['subheading']"><slot name="subheading"></slot></div>
                    <p v-else-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                    <p v-else-if="metaType?.notes" :class="['notes',subHeadingClass]" v-html="metaType?.notes"></p>
                </div>

                <slot name="header" :formInstance="getCurrentInstance()?.exposed" :model="model"></slot>
                <AutoFormFields ref="formFields" :key="formFieldsKey" :modelValue="model" @update:modelValue="update" :api="api" :configureField="configureField" :configureFormLayout="configureFormLayout" />
                <slot name="footer" :formInstance="getCurrentInstance()?.exposed" :model="model"></slot>

            </div>
            <div :class="buttonsClass">
                <div>
                    <FormLoading v-if="showLoading && loading" />
                </div>
                <div class="flex justify-end">
                    <SecondaryButton v-if="showCancel" @click="close" :disabled="loading">Cancel</SecondaryButton>
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

                                    <slot name="header" :formInstance="getCurrentInstance()?.exposed" :model="model"></slot>
                                    <AutoFormFields ref="formFields" :key="formFieldsKey" :modelValue="model" @update:modelValue="update" :api="api" :configureField="configureField" :configureFormLayout="configureFormLayout" />
                                    <slot name="footer" :formInstance="getCurrentInstance()?.exposed" :model="model"></slot>

                                </div>
                            </div>
                            <div :class="buttonsClass">
                                <div>
                                    <FormLoading v-if="showLoading && loading" />
                                </div>
                                <div class="flex justify-end">
                                    <SecondaryButton v-if="showCancel" @click="close" :disabled="loading">Cancel</SecondaryButton>
                                    <PrimaryButton type="submit" class="ml-4" :disabled="loading">Save</PrimaryButton>
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
import type { ApiRequest, ApiResponse, ModalProvider } from '@/types'
import type { AutoCreateFormProps, AutoCreateFormEmits } from '@/components/types'
import { useClient } from '@/use/client'
import { useMetadata } from '@/use/metadata'
import { form } from './css'
import { computed, getCurrentInstance, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { getTypeName, transition } from '@/use/utils'
import { Sole }  from '@/use/config'
import { ApiResult, HttpMethods, humanize, map } from '@servicestack/client'

const props = withDefaults(defineProps<AutoCreateFormProps>(), {
    formStyle: "slideOver",
    autosave: true,
    showLoading: true,
    showCancel: true
})

const emit = defineEmits<AutoCreateFormEmits>()

const formFields = ref()
const formFieldsKey = ref(1)
function forceUpdate() {
    formFieldsKey.value++ //required to force revalidation
    formFields.value?.forceUpdate()
    const instance = getCurrentInstance()
    instance?.proxy?.$forceUpdate()
}
function setModel(args:any) {
    Object.assign(model.value, args)
    forceUpdate()
}

function update(value:ApiRequest) {
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

const { typeOf, typeProperties, Crud, createDto, formValues } = useMetadata()

const typeName = computed(() => getTypeName(props.type))
const metaType = computed(() => typeOf(typeName.value))
const resolveModel = () => typeof props.type == 'string' ? createDto(props.type) : props.type ? new props.type() : null
const model = ref(resolveModel())
defineExpose({ forceUpdate, props, setModel, formFields, model })

const panelClass = computed(() => props.panelClass || form.panelClass(props.formStyle))
const formClass = computed(() => props.formClass || form.formClass(props.formStyle))
const headingClass = computed(() => props.headingClass || form.headingClass(props.formStyle))
const subHeadingClass = computed(() => props.subHeadingClass || form.subHeadingClass(props.formStyle))
const buttonsClass = computed(() => props.buttonsClass || form.buttonsClass)

const dataModel = computed(() => Crud.model(metaType.value))
const title = computed(() => props.heading || typeOf(typeName.value)?.description || 
    (dataModel.value ? `New ${humanize(dataModel.value)}` : humanize(typeName.value)))

const api = ref<ApiResponse>(new ApiResult<any>())

let client = useClient()
let loading = computed(() => client.loading.value)

if (Sole.interceptors.has('AutoCreateForm.new')) Sole.interceptors.invoke('AutoCreateForm.new', { props, model })

async function save(e:Event) {
    let form = e.target as HTMLFormElement
    if (!props.autosave) {
        emit('save', new model.value.constructor(formValues(form, typeProperties(metaType.value))))
        return
    }

    let method = map(model.value?.['getMethod'], fn => typeof fn =='function' ? fn() : null) || 'POST'
    let returnsVoid = map(model.value?.['createResponse'], fn => typeof fn == 'function' ? fn() : null) == null

    if (HttpMethods.hasRequestBody(method)) {
        let requestDto = new model.value.constructor()
        let formData = new FormData(form)
        if (!returnsVoid) {
            api.value = await client.apiForm(requestDto, formData, { jsconfig: 'eccn' })
        } else {
            api.value = await client.apiFormVoid(requestDto, formData, { jsconfig: 'eccn' })
        }
    } else {
        let fieldValues = formValues(form, typeProperties(metaType.value))
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