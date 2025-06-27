<template>
<div :class="[backgroundColor, borderColor, 'border-l-4 p-4']">
    <div class="flex items-center">
        <div v-if="!hideIcon" class="flex-shrink-0 mr-3">
            <svg v-if="type=='warn'" class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="type=='error'" class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="type=='info'" class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0zM8.25 9.75A.75.75 0 019 9h.253a1.75 1.75 0 011.709 2.13l-.46 2.066a.25.25 0 00.245.304H11a.75.75 0 010 1.5h-.253a1.75 1.75 0 01-1.709-2.13l.46-2.066a.25.25 0 00-.245-.304H9a.75.75 0 01-.75-.75zM10 7a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="type=='success'" class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
            </svg>
        </div>
        <div>
            <p :class="[textColor, 'text-sm']">
                <slot></slot>
            </p>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AlertProps } from '@/components/types'

const props = withDefaults(defineProps<AlertProps>(), {
    type: "warn"
})

const backgroundColor = computed(() => props.type == "info"
    ? "bg-blue-50 dark:bg-blue-200"
    : props.type == "error"
    ? "bg-red-50 dark:bg-red-200"
    : props.type == "success"
    ? "bg-green-50 dark:bg-green-200"
    : "bg-yellow-50 dark:bg-yellow-200")

const borderColor = computed(() => props.type == "info"
    ? "border-blue-400"
    : props.type == "error"
    ? "border-red-400"
    : props.type == "success"
    ? "border-green-400"
    : "border-yellow-400")

const textColor = computed(() => props.type == "info"
    ? "text-blue-700"
    : props.type == "error"
    ? "text-red-700"
    : props.type == "success"
    ? "text-green-700"
    : "text-yellow-700")
</script>