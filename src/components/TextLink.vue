<template>
<a :class="cls"><slot></slot></a>
</template>

<script setup lang="ts">
import type { TextLinkProps } from '@/components/types'
import { computed, useAttrs } from 'vue'
import { a } from './css'

const attrs = useAttrs()
const props = withDefaults(defineProps<TextLinkProps>(), {
  color: 'blue'
})

const cls = computed(() => (a[props.color] || a.blue) + (!attrs.href ? ' cursor-pointer' : ''))
</script>