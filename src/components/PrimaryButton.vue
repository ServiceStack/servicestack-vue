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
import { computed } from 'vue'

const props = withDefaults(defineProps<{ 
  type?: "submit" | "button" | "reset"
  href?: string
  color?: "blue" | "purple" | "red" | "green" | "sky" | "cyan" | "indigo"
}>(), {
  type: 'submit',
  color: 'indigo'
})

const colors = {
  blue:   'text-white bg-blue-600 hover:bg-blue-700 focus:ring-indigo-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
  purple: 'text-white bg-purple-600 hover:bg-purple-700 focus:ring-indigo-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
  red:    'focus:ring-red-500 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500',
  green:  'focus:ring-green-300 text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-500',
  sky:    'focus:ring-sky-300 text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-500',
  cyan:   'focus:ring-cyan-300 text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-500',
  indigo: 'focus:ring-2 focus:ring-offset-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
}

const cls = computed(() => "inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-black " 
  + (colors[props.color] || colors.indigo))
</script>