<template>
<a :class="cls"><slot></slot></a>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { a } from './css'

const attrs = useAttrs()
const props = withDefaults(defineProps<{
    color?: "blue" | "purple" | "red" | "green" | "sky" | "cyan" | "indigo"
}>(), {
  color: 'blue'
})

const cls = computed(() => (a[props.color] || a.blue) + (!attrs.href ? ' cursor-pointer' : ''))
</script>