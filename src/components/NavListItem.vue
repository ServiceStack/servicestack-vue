<template>
<li class="relative flex items-start space-x-4 py-6">
    <div class="flex-shrink-0">
        <span class="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900">
            <Icon class="w-6 h-6 text-indigo-700 dark:text-indigo-300" :image="icon" :src="iconSrc" :svg="iconSvg" :alt="iconAlt" />
        </span>
    </div>
    <div class="min-w-0 flex-1">
        <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">
            <span class="rounded-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
                <a :href="href" class="focus:outline-none">
                    <span class="absolute inset-0" aria-hidden="true"></span>
                    {{title}}
                </a>
            </span>
        </h3>
        <p class="text-base text-gray-500">
            <slot></slot>
        </p>
    </div>
    <div class="flex-shrink-0 self-center">
        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
        </svg>
    </div>
</li>
</template>

<script setup lang="ts">
import type { NavListItemProps } from '@/components/types'
defineProps<NavListItemProps>()
</script>