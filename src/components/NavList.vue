<template>
<div>
    <h2 v-if="title" class="text-base font-semibold text-gray-500 dark:text-gray-400">
        {{title}}
    </h2>
    <ul role="list" class="mt-4 divide-y divide-gray-200 dark:divide-gray-800 border-t border-b border-gray-200 dark:border-gray-800">
        <slot></slot>
    </ul>
</div>
</template>

<script setup lang="ts">
import type { NavListProps } from '@/components/types'
defineProps<NavListProps>()
</script>