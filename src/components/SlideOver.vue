<template>
<div :id="id" class="relative z-10" :aria-labelledby="id + '-title'" role="dialog" aria-modal="true">
  <div class="fixed inset-0"></div>
  <div class="fixed inset-0 overflow-hidden">
    <div @mousedown="close" class="absolute inset-0 overflow-hidden">
      <div @mousedown.stop="" class="pointer-events-none fixed inset-y-0 right-0 flex pl-10">
        <div :class="['panel pointer-events-auto w-screen xl:max-w-3xl md:max-w-xl max-w-lg',transition1]">
          <div class="flex h-full flex-col bg-white dark:bg-black shadow-xl">
            <div class="flex min-h-0 flex-1 flex-col overflow-auto">

              <div class="flex-1">
                  <!-- Header -->
                  <div class="relative bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6">
                    <div class="flex items-start justify-between space-x-3">
                      <div class="space-y-1">
                        <div v-if="$slots['title']"><slot name="title"></slot></div>
                        <h2 v-if="title" class="text-lg font-medium text-gray-900 dark:text-gray-50" :id="id + '-title'">{{title}}</h2>
                        <p v-if="$slots['subtitle']" class="text-sm text-gray-500">
                            <slot name="subtitle"></slot>
                        </p>
                      </div>
                      <div class="flex h-7 items-center">
                          <CloseButton button-class="bg-gray-50 dark:bg-gray-900" @close="close"/>
                      </div>
                    </div>
                  </div>              
                  
                  <div :class="contentClass">
                    <slot></slot>
                  </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div v-if="$slots['footer']" class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                <slot name="footer"></slot>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import type { SlideOverProps, SlideOverEmits } from '@/components/types'
import { onMounted, onUnmounted, ref, watch } from "vue"
import { transition } from '@/use/utils'

const props = withDefaults(defineProps<SlideOverProps>(), {
    id: 'SlideOver',
    contentClass: "relative mt-6 flex-1 px-4 sm:px-6"
})

const emit = defineEmits<SlideOverEmits>()

const show = ref(false)
const transition1 = ref('')
const rule1 = {
    entering: { cls: 'transform transition ease-in-out duration-500 sm:duration-700', from: 'translate-x-full', to: 'translate-x-0' },
    leaving:  { cls: 'transform transition ease-in-out duration-500 sm:duration-700', from: 'translate-x-0', to: 'translate-x-full' }
}
watch(show, () => {
    transition(rule1, transition1, show.value)
    if (!show.value) setTimeout(() => emit('done'), 700)
})
show.value = true
const close = () => show.value = false

const globalKeyHandler = (e:KeyboardEvent) => { if (e.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', globalKeyHandler))
onUnmounted(() => window.removeEventListener('keydown', globalKeyHandler))
</script>
