<template>
<a @click.prevent="navigate" :title="to" href="javascript:void(0)" v-bind="$attrs"><slot></slot></a>
</template>
  
<script setup lang="ts">
import { useConfig } from '@/use/config'

const props = defineProps<{ to?: string }>()

const { config } = useConfig()
const navigate = () => config.value.navigate!(props.to ?? '/')
</script>
