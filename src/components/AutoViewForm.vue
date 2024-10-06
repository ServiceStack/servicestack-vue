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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </template>
    
    <script setup lang="ts">
    import { useMetadata, Apis } from '@/use/metadata'
    import { form } from './css'
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
    import { transition } from '@/use/utils'
    import { Sole }  from '@/use/config'
    import { humanize } from '@servicestack/client'
    
    const props = withDefaults(defineProps<{
        model: any
        apis?: Apis,
        typeName?: string,
        done?: Function,
        formStyle?: "slideOver" | "card"
        panelClass?: string
        formClass?: string
        headingClass?: string
        subHeadingClass?: string
        heading?: string
        subHeading?: string
    }>(), {
        formStyle: "slideOver",
    })
    
    const emit = defineEmits<{
        (e:'done'): void
    }>()
    
    const { typeOf } = useMetadata()
    
    const typeName = computed(() => props.typeName ?? props.apis!.dataModel!.name)
    const metaType = computed(() => typeOf(typeName.value))
    const panelClass = computed(() => props.panelClass || form.panelClass(props.formStyle))
    const formClass = computed(() => props.formClass || form.formClass(props.formStyle))
    const headingClass = computed(() => props.headingClass || form.headingClass(props.formStyle))
    const subHeadingClass = computed(() => props.subHeadingClass || form.subHeadingClass(props.formStyle))
    
    const title = computed(() => props.heading || typeOf(typeName.value)?.description || 
        (props.model?.id ? `${humanize(typeName.value)} ${props.model.id}` : 'View ' + humanize(typeName.value)))
    
    if (Sole.interceptors.has('AutoViewForm.new')) Sole.interceptors.invoke('AutoViewForm.new', { props })
    
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