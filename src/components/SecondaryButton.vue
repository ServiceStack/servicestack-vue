<template>
  <router-link v-if="href" :to="href" v-slot="{ navigate }">
    <button :type="type ?? 'button'" :class="cls" :href="href" @click="navigate">
      <slot></slot>
    </button>
  </router-link>
  <button v-else :type="type ?? 'button'" :class="cls" v-bind="$attrs">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import type { SecondaryButtonProps } from '@/components/types'
defineProps<SecondaryButtonProps>()

const cls = "inline-flex justify-center rounded-md border border-gray-300 py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-black"
</script>