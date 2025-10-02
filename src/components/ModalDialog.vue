<template>
<div :id="id" :data-transition-for="id" @mousedown="close" class="relative z-10"
    :aria-labelledby="`${id}-title`" role="dialog" aria-modal="true">

    <div :class="['fixed inset-0 bg-gray-500/75 transition-opacity', transition1]"></div>

    <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div :class="[modalClass, sizeClass, transition2]" @mousedown.stop="">
                <div>
                    <slot v-if="(slots as any).closebutton" name="createform"></slot>
                    <div v-else class="hidden sm:block absolute top-0 right-0 pt-4 pr-4 z-10">
                        <button type="button" @click="close":class="closeButtonClass" title="Close">
                            <span class="sr-only">Close</span>
                            <!-- Heroicon name: outline/x -->
                            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <slot></slot>
                </div>
            </div>
            <slot name="bottom"></slot>
        </div>
    </div>

    <ModalLookup v-if="modal?.name == 'ModalLookup' && modal.ref" :ref-info="modal.ref" @done="openModalDone"
        :configureField="configureField"/>
</div>
</template>

<script setup lang="ts">
import type { ModalProvider } from "@/types"
import type { ModalDialogProps, ModalDialogEmits } from '@/components/types'
import { onMounted, onUnmounted, watch, ref, provide, useSlots } from "vue"
import { transition } from '@/use/utils'
import * as css from "./css"

const slots = useSlots()

const props = withDefaults(defineProps<ModalDialogProps>(), {
    id: 'ModalDialog',
    modalClass: css.modal.modalClass,
    sizeClass: css.modal.sizeClass,
    closeButtonClass: "bg-white dark:bg-black cursor-pointer rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black",
})

const emit = defineEmits<ModalDialogEmits>()

const show = ref(false)

const transition1 = ref('')
const rule1 = {
    entering: { cls: 'ease-out duration-300', from: 'opacity-0', to: 'opacity-100' },
    leaving: { cls: 'ease-in duration-200', from: 'opacity-100', to: 'opacity-0' }
}
const transition2 = ref('')
const rule2 = {
    entering: { cls: 'ease-out duration-300', from: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', to: 'opacity-100 translate-y-0 sm:scale-100' },
    leaving: { cls: 'ease-in duration-200', from: 'opacity-100 translate-y-0 sm:scale-100', to: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95' }
}

watch(show, () => {
    transition(rule1, transition1, show.value)
    transition(rule2, transition2, show.value)
    if (!show.value) setTimeout(() => emit('done'), 200)
})
show.value = true
const close = () => show.value = false

/* ModalLookup */
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


const globalKeyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', globalKeyHandler))
onUnmounted(() => window.removeEventListener('keydown', globalKeyHandler))
</script>
