<template>
  <div v-if="errorSummary" :class="`bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 ${$props.class}`">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"/>
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700 dark:text-red-200">{{ errorSummary }}</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ApiState } from "@/types"
import type { ErrorSummaryProps } from '@/components/types'
import { errorResponseExcept } from "@servicestack/client"
import { computed, inject } from "vue"

const props = defineProps<ErrorSummaryProps>()

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorSummary = computed(() => props.status || ctx?.error.value 
    ? errorResponseExcept.call({ responseStatus: props.status ?? ctx?.error.value }, props.except ?? [])
    : null)
</script>
