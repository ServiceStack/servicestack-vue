<template>
<a :class="cls"><slot></slot></a>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()
const props = withDefaults(defineProps<{
    color?: "blue" | "purple" | "red" | "green" | "sky" | "cyan" | "indigo"
}>(), {
  color: 'blue'
})

const colors = {
  blue:   'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200',
  purple: 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200',
  red:    'text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200',
  green:  'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200',
  sky:    'text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200',
  cyan:   'text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200',
  indigo: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200',
}

const cls = computed(() => (colors[props.color] || colors.blue) + (!attrs.href ? ' cursor-pointer' : ''))
</script>