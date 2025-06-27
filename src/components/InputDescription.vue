<template>
  <div v-if="description" key="description" class="mt-2 text-sm text-gray-500"
       :id="`${id}-description`"
       :aria-describedby="`${id}-description`">
    <div>{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import type { InputDescriptionProps } from '@/components/types'
defineProps<InputDescriptionProps>()
</script>
