<template>
  <div class="absolute top-0 right-0 pt-4 pr-4">
    <button type="button" @click="$emit('close')" :title="title"
            :class="[buttonClass,'cursor-pointer rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black']">
      <span class="sr-only">Close</span>
      <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
           aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CloseButtonProps, CloseButtonEmits } from '@/components/types'
const props = withDefaults(defineProps<CloseButtonProps>(), {
  buttonClass: 'bg-white dark:bg-black',
  title:'Close',
})
const emit = defineEmits<CloseButtonEmits>()
</script>
