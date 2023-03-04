<template>
    <form v-if="metaType" @submit.prevent="submit" autocomplete="off" :class="formClass">
        <div :class="innerFormClass">
            <div :class="bodyClass">
                <div :class="headerClass">
                    <div v-if="$slots['heading']"><slot name="heading"></slot></div>
                    <h3 v-else :class="headingClass">{{ title }}</h3>

                    <div v-if="$slots['subheading']"><slot name="subheading"></slot></div>
                    <p v-else-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                    <p v-else-if="metaType?.notes" :class="['notes',subHeadingClass]" v-html="metaType?.notes"></p>
                </div>

                <slot name="header"></slot>
                <input type="submit" class="hidden">
                <AutoFormFields :type="type" :modelValue="model" @update:modelValue="update" :api="api" :configureField="configureField" />
                <slot name="footer"></slot>
            </div>
            <slot name="buttons">
                <div :class="buttonsClass">
                    <div>
                        <FormLoading v-if="showLoading && loading" />
                    </div>
                    <div class="flex justify-end">
                        <div></div>
                        <PrimaryButton>{{ submitLabel }}</PrimaryButton>
                    </div>
                </div>
            </slot>
        </div>
    
        <ModalLookup v-if="modal?.name == 'ModalLookup' && modal.ref" :ref-info="modal.ref" @done="openModalDone" />
    </form>
</template>

<script setup lang="ts">
import type { ApiRequest, ResponseStatus, ModalProvider } from '@/types'
import { computed, provide, ref } from 'vue'
import { ApiResult, HttpMethods, humanize, map } from '@servicestack/client'
import { useClient } from '@/use/client'
import { useUtils } from '@/use/utils'
import { useMetadata } from '@/use/metadata'
import { form, card } from './css'

const props = withDefaults(defineProps<{
    type: string|InstanceType<any>|Function
    modelValue?: ApiRequest|any
    jsconfig?: string
    heading?: string
    subHeading?: string
    showLoading?: boolean
    configureField?: string
    bodyClass?: string
    formClass?: string
    innerFormClass?: string
    headerClass?: string
    buttonsClass?: string
    headingClass?: string
    subHeadingClass?: string
    submitLabel?: string
}>(), {
    formClass: 'shadow sm:rounded-md',
    headerClass: 'p-6',
    submitLabel: 'Submit',
    jsconfig: 'eccn,edv',
    showLoading: true,
})

const emit = defineEmits<{
    (e:'success', response:any): void
    (e:'error', error:ResponseStatus): void
    (e:'update:modelValue', model:any): void
}>()

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

const buttonsClass = computed(() => typeof props.buttonsClass == 'string' ? props.formClass : form.buttonsClass)
const headingClass = computed(() => typeof props.headingClass == 'string' ? props.formClass : card.headingClass)
const subHeadingClass = computed(() => typeof props.subHeadingClass == 'string' ? props.subHeadingClass : card.subHeadingClass)

const typeName = computed(() => getTypeName(props.type))
const metaType = computed(() => typeOf(typeName.value))
const model = ref(props.modelValue || newDto())
const loading = computed(() => client.loading.value)
const title = computed(() => props.heading || typeOf(typeName.value)?.description || humanize(typeName.value))

function newDto() {
    return typeof props.type == 'string' ? createDto(props.type) : props.type ? new props.type() : props.modelValue
}

async function submit(e:Event) {
    let form = e.target as HTMLFormElement

    const dto = newDto()
    let method = map(dto?.['getMethod'], fn => typeof fn =='function' ? fn() : null) || 'POST'
    let returnsVoid = map(dto?.['createResponse'], fn => typeof fn == 'function' ? fn() : null) == null
    const jsconfig = props.jsconfig

    if (HttpMethods.hasRequestBody(method)) {
        let requestDto = new dto.constructor()
        let formData = new FormData(form)
        console.debug('AutoForm.submitForm', requestDto, formData)
        if (!returnsVoid) {
            api.value = await client.apiForm(requestDto, formData, { jsconfig })
        } else {
            api.value = await client.apiFormVoid(requestDto, formData, { jsconfig })
        }
    } else {
        //let fieldValues = formValues(form, typeProperties(metaType.value))
        let requestDto = new dto.constructor(model.value)
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
    } else {
        //console.debug('error',api.value?.error)
        emit('error', api.value.error!)
    }
}

function update(newModel:ApiRequest|any) {
    emit('update:modelValue', newModel)
}
</script>