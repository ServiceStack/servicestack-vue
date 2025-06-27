<template>
  <router-link v-if="href" :to="href" v-slot="{ navigate }">
    <button :class="cls" :href="href" @click="navigate">
      <slot></slot>
    </button>
  </router-link>
  <button v-else :type="type" :class="cls" v-bind="$attrs">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import type { OutlineButtonProps } from '@/components/types'
withDefaults(defineProps<OutlineButtonProps>(), {
  type: 'submit'
})

const cls = "inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 disabled:text-gray-400 bg-white dark:bg-black hover:bg-gray-50 hover:dark:bg-gray-900 disabled:hover:bg-white dark:disabled:hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black"
</script>
