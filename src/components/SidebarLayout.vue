<template>
<div>
    <!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
    <div v-if="toggleState" class="relative z-10 lg:hidden" role="dialog" aria-modal="true">
      <div :class="['fixed inset-0 bg-gray-900/80', transition1]"></div>

      <div class="fixed inset-0 flex">
        <div :class="['relative mr-16 flex w-full max-w-xs flex-1', transition2]">
          <div :class="['absolute left-full top-0 flex w-16 justify-center pt-5', transition3]">
            <button type="button" @click="hide" class="-m-2.5 p-2.5">
              <span class="sr-only">Close sidebar</span>
              <svg class="h-6 w-6 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-black px-6 pb-2">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-72 lg:flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-6">
        <slot></slot>
      </div>
    </div>

    <!-- sticky titlebar for mobile -->
    <div :class="['sticky top-0 flex items-center gap-x-6 bg-white dark:bg-black px-4 py-4 shadow-sm sm:px-6 lg:hidden']">
        <button type="button" @click="show" class="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden">
            <span class="sr-only">Open sidebar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>
        <slot name="mobiletitlebar"></slot>
    </div>
    
</div>
</template>

<script setup lang="ts">
import type { SidebarLayoutExpose } from '@/components/types'
import { useUtils } from '@/use/utils'
import { ref } from 'vue'

const { transition } = useUtils()

const toggleState = ref(true)
const transition1 = ref('')
const rule1 = {
    entering: { cls:'transition-opacity ease-linear duration-300', from:'opacity-0',   to:'opacity-100'},
    leaving:  { cls:'transition-opacity ease-linear duration-300', from:'opacity-100', to:'opacity-0'}
}

const transition2 = ref('')
const rule2 = {
    entering: { cls:'transition ease-in-out duration-300 transform', from:'-translate-x-full', to:'translate-x-0'},
    leaving:  { cls:'transition ease-in-out duration-300 transform', from:'translate-x-0',     to:'-translate-x-full'}
}

const transition3 = ref('')
const rule3 = {
    entering: { cls:'ease-in-out duration-300', from:'opacity-0',   to:'opacity-100'},
    leaving:  { cls:'ease-in-out duration-300', from:'opacity-100', to:'opacity-0'}
}

function toggle(show:boolean) {
    transition(rule1, transition1, show)
    transition(rule2, transition2, show)
    transition(rule3, transition3, show)
    setTimeout(() => toggleState.value = show, 300)
}
function show() { toggle(true) }
function hide() { toggle(false) }

defineExpose<SidebarLayoutExpose>({ show, hide, toggle })
</script>