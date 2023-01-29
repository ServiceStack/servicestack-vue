<template>

    <div v-if="!metaType">
        <p class="text-red-700">Could not create form for unknown <b>type</b> {{ typeName }}</p>
    </div>
    <div v-else-if="formStyle=='card'" :class="panelClass">
        <form @submit.prevent="save">
            <div :class="formClass">
                <div>
                    <h3 :class="headingClass">{{ title }}</h3>
                    <p v-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                    <p v-else-if="notes" :class="['notes',subHeadingClass]" v-html="notes"></p>
                </div>
    
                <AutoFormFields :modelValue="model" @update:modelValue="update" :api="api" />
    
            </div>
            <div :class="Css.form.buttonsClass">
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
                                                <h2 :class="headingClass" id="slide-over-title">{{ title }}</h2>
                                                <p v-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                                                <p v-else-if="notes" :class="['notes',subHeadingClass]" v-html="notes"></p>
                                            </div>
                                            <div class="flex h-7 items-center">
                                                <CloseButton button-class="bg-gray-50 dark:bg-gray-900" @close="close"/>
                                            </div>
                                        </div>
                                    </div>
    
                                    <AutoFormFields :modelValue="model" @update:modelValue="update" :api="api" />
    
                                </div>
                            </div>
                            <div :class="Css.form.buttonsClass">
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
    
    </template>
    
    <script setup lang="ts">
    import type { ApiRequest, ApiResponse, ResponseStatus } from '@/types'
    import { useAppMetadata, Css, createDto, formValues, useClient, sanitizeForUi } from '@/api'
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
    import { getTypeName, transition } from './utils'
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
        notes?: string
        autosave?: boolean
        showLoading?: boolean
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
    }
    
    const { typeOf, typeProperties, getId, getPrimaryKey, Crud } = useAppMetadata()
    
    const typeName = computed(() => typeof props.type == 'string' 
        ? props.type 
        : (props.type ? getTypeName(new props.type()) : null))
    
    const metaType = computed(() => typeOf(typeName.value))
    const model = ref(typeof props.type == 'string' 
        ? createDto(props.type, sanitizeForUi(props.modelValue)) 
        : (props.type ? new props.type(sanitizeForUi(props.modelValue)) : null))
    
    const panelClass = computed(() => props.panelClass || Css.form.panelClass(props.formStyle))
    const formClass = computed(() => props.formClass || Css.form.formClass(props.formStyle))
    const headingClass = computed(() => props.headingClass || Css.form.headingClass(props.formStyle))
    const subHeadingClass = computed(() => props.subHeadingClass || Css.form.subHeadingClass(props.formStyle))
    
    const dataModel = computed(() => Crud.model(metaType.value))
    const title = computed(() => props.heading || typeOf(typeName.value)?.description || 
        (dataModel.value ? `New ${humanize(dataModel.value)}` : humanize(typeName.value)))
    
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
            let formData = new FormData(form)
            if (pk && !Array.from(formData.keys()).some(k => k.toLowerCase() == pk.name.toLowerCase())) {
                formData.append(pk.name, mapGet(props.modelValue, pk.name))
            }

            if (!returnsVoid) {
                api.value = await client.apiForm(requestDto, formData, { jsconfig: 'eccn' })
            } else {
                api.value = await client.apiFormVoid(requestDto, formData, { jsconfig: 'eccn' })
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