<template>
<div>
    <div v-if="!typeName">
        <p class="text-red-700">Could not create view for unknown <b>type</b> {{ typeName }}</p>
    </div>
    <div v-else-if="formStyle=='card'" :class="panelClass">
        <div :class="formClass">
            <div>
                <div v-if="$slots['heading']"><slot name="heading"></slot></div>
                <h3 v-else :class="headingClass">{{ title }}</h3>
                
                <div v-if="$slots['subheading']"><slot name="subheading"></slot></div>
                <p v-else-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                <p v-else-if="metaType?.notes" :class="['notes',subHeadingClass]" v-html="metaType?.notes"></p>
            </div>
            <MarkupModel :value="model" />
        </div>
    </div>
    <div v-else class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0"></div>
        <div class="fixed inset-0 overflow-hidden">
            <div @mousedown="close" class="absolute inset-0 overflow-hidden">
                <div @mousedown.stop="" class="pointer-events-none fixed inset-y-0 right-0 flex pl-10">
                    <div :class="['pointer-events-auto w-screen xl:max-w-3xl md:max-w-xl max-w-lg',transition1]">
                        <div :class="formClass">
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
                                    <MarkupModel :value="model" />
                                </div>
                            </div>
                            <div :class="form.buttonsClass">
                                <div>
                                    <ConfirmDelete v-if="deleteType" @delete="onDelete" />
                                </div>
                                <div>
                                    <FormLoading v-if="showLoading && loading" />
                                </div>
                                <div class="flex justify-end"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '@/types'
import type { AutoViewFormProps, AutoViewFormEmits } from '@/components/types'
import { useMetadata, toFormValues, Apis } from '@/use/metadata'
import { form } from './css'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { transition } from '@/use/utils'
import { Sole }  from '@/use/config'
import { useClient } from '@/use/client'
import { ApiResult, humanize, map, mapGet } from '@servicestack/client'

const props = withDefaults(defineProps<AutoViewFormProps>(), {
    formStyle: "slideOver",
})

const emit = defineEmits<AutoViewFormEmits>()

const { typeOf, getPrimaryKey, Crud, createDto } = useMetadata()

const typeName = computed(() => props.typeName ?? props.apis!.dataModel!.name)
const metaType = computed(() => typeOf(typeName.value))
const panelClass = computed(() => props.panelClass || form.panelClass(props.formStyle))
const formClass = computed(() => props.formClass || form.formClass(props.formStyle))
const headingClass = computed(() => props.headingClass || form.headingClass(props.formStyle))
const subHeadingClass = computed(() => props.subHeadingClass || form.subHeadingClass(props.formStyle))

const title = computed(() => props.heading || typeOf(typeName.value)?.description || 
    (props.model?.id ? `${humanize(typeName.value)} ${props.model.id}` : 'View ' + humanize(typeName.value)))

const api = ref<ApiResponse>(new ApiResult<any>())
let origModel = Object.assign({}, toFormValues(props.model))
if (Sole.interceptors.has('AutoViewForm.new')) Sole.interceptors.invoke('AutoViewForm.new', { props })

let client = useClient()
let loading = computed(() => client.loading.value)
const getPk = () => map(metaType.value, dataModel => getPrimaryKey(dataModel))
const dataModel = computed(() => metaType.value)

async function onDelete(e:Event) {
    let pk = getPk()
    const id = pk ? mapGet(props.model, pk.name) : null
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
    if (props.done) {
        props.done()
    }
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