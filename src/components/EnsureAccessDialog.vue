<template>
<SlideOver v-if="invalidAccess" :title="title" @done="$emit('done')" content-class="relative flex-1">
    <template v-if="subtitle" #subtitle>{{ subtitle }}</template>
    <EnsureAccess :invalidAccess="invalidAccess" />
</SlideOver>
</template>
<script setup lang="ts">
defineProps<{
    title?: string
    subtitle?: string
    invalidAccess?: string
}>()
defineEmits<{
    (e:'done'): void
}>()
</script>