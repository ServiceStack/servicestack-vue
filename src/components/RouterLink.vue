<template>
<a :href="to" v-bind="$attrs"><slot></slot></a>
</template>
  
<script setup lang="ts">
const props = defineProps<{ to?: string }>()
const navigate = (url:string) => location.href = url
</script>
