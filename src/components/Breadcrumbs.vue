<template>
<nav class="flex" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-4">
        <li>
            <div>
                <a :href="homeHref" class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400" :title="homeLabel">
                    <!-- Heroicon name: mini/home -->
                    <svg class="h-6 w-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
                    </svg>
                    <span class="sr-only">{{homeLabel}}</span>
                </a>
            </div>
        </li>
        <slot></slot>
    </ol>
</nav>    
</template>

<script setup lang="ts">
import type { BreadcrumbsProps } from '@/components/types'
withDefaults(defineProps<BreadcrumbsProps>(), {
    homeHref: "/",
    homeLabel: "Home"
})
</script>
