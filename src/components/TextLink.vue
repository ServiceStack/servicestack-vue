<template>
<a :class="cls"><slot></slot></a>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Css } from './css';

const attrs = useAttrs()
const props = withDefaults(defineProps<{
    color?: "blue" | "purple" | "red" | "green" | "sky" | "cyan" | "indigo"
}>(), {
  color: 'blue'
})

const cls = computed(() => (Css.a[props.color] || Css.a.blue) + (!attrs.href ? ' cursor-pointer' : ''))
</script>