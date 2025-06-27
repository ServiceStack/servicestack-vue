<template>
<li>
    <div class="flex items-center">
        <!-- Heroicon name: mini/chevron-right -->
        <svg class="h-6 w-6 flex-shrink-0 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
        </svg>
        <a v-if="href" :href="href" class="ml-4 text-lg font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" :title="title"><slot></slot></a>
        <span v-else class="ml-4 text-lg font-medium text-gray-700 dark:text-gray-300" :title="title"><slot></slot></span>
    </div>
</li>
</template>
<script setup lang="ts">
import type { BreadcrumbProps } from '@/components/types'
defineProps<BreadcrumbProps>()
</script>