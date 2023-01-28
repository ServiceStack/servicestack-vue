<template>

<div v-if="formStyle=='card'" :class="panelClass">
    <form @submit.prevent="save">
        <div :class="formClass">
            <div>
                <h3 :class="headingClass">{{ title }}</h3>
                <p v-if="subHeading" :class="subHeadingClass">{{ subHeading }}</p>
                <p v-else-if="notes" :class="['notes',subHeadingClass]" v-html="notes"></p>
            </div>

            <AutoFormFields :modelValue="modelValue" @update:modelValue="update" :api="api" />
            
        </div>
        <div :class="Css.form.buttonsClass">
            <div></div>
            <div class="flex justify-end">
                <SecondaryButton @click="done">Cancel</SecondaryButton>
                <PrimaryButton type="submit" class="ml-4">Save</PrimaryButton>
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

                                <AutoFormFields :modelValue="modelValue" @update:modelValue="update" :api="api" />

                            </div>
                        </div>
                        <div :class="Css.form.buttonsClass">
                            <div></div>
                            <div class="flex justify-end">
                                <SecondaryButton @click="close">Cancel</SecondaryButton>
                                <PrimaryButton type="submit" class="ml-4">Save</PrimaryButton>
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
import type { ApiRequest } from '@/types'
import { useAppMetadata, Css } from '@/api'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getTypeName, transition } from './utils'
import { ApiResult, humanize } from '@servicestack/client'

const props = withDefaults(defineProps<{
    modelValue: ApiRequest
    formStyle?: "slideOver" | "card"
    panelClass?: string
    formClass?: string
    headingClass?: string
    subHeadingClass?: string
    heading?: string
    subHeading?: string
    notes?: string
}>(), {
    formStyle: "slideOver",    
})

const emit = defineEmits<{
    (e: "update:modelValue", o:ApiRequest): void
    (e:'done'): void
}>()

function update(value:ApiRequest) {
    emit('update:modelValue', value)
}

const panelClass = computed(() => props.panelClass || Css.form.panelClass(props.formStyle))
const formClass = computed(() => props.formClass || Css.form.formClass(props.formStyle))
const headingClass = computed(() => props.headingClass || Css.form.headingClass(props.formStyle))
const subHeadingClass = computed(() => props.subHeadingClass || Css.form.subHeadingClass(props.formStyle))

const { typeOf } = useAppMetadata()
const typeName = computed(() => getTypeName(props.modelValue))

const title = computed(() => props.heading || typeOf(typeName.value)?.description || `New ${humanize(typeName.value)}`)

const api = ref(new ApiResult<any>())

function save() {
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
const close = () => show.value = false

const globalKeyHandler = (e:KeyboardEvent) => { if (e.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', globalKeyHandler))
onUnmounted(() => window.removeEventListener('keydown', globalKeyHandler))
</script>