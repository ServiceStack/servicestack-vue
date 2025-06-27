<template>
<SlideOver v-if="invalidAccess" :title="title" @done="$emit('done')" content-class="relative flex-1">
    <template v-if="subtitle" #subtitle>{{ subtitle }}</template>
    <EnsureAccess :alertClass="alertClass" :invalidAccess="invalidAccess" />
</SlideOver>
</template>
<script setup lang="ts">
import type { EnsureAccessDialogProps, EnsureAccessDialogEmits } from '@/components/types'
defineProps<EnsureAccessDialogProps>()
defineEmits<EnsureAccessDialogEmits>()
</script>