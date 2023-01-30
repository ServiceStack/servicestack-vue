<template>
    <svg v-if="isSvg" :class="image?.cls" v-html="svgEl?.innerHTML" v-bind="svgEl?.attrs"></svg>
    <img v-else="imgSrc" :class="image?.cls" :src="assetsPathResolver(imgSrc)" @error="iconOnError($event.target as HTMLImageElement)">
</template>

<script setup lang="ts">
import type { ImageInfo } from '@/types'
import { computed } from 'vue'
import { map } from '@servicestack/client'
import { useConfig } from '@/api'
import { useFiles } from '@/files'
import { parseHtml } from '@/utils'

const props = defineProps<{
    image?: ImageInfo
    svg?: string
    src?: string
    alt?: string
}>()

const { assetsPathResolver } = useConfig()
const { iconOnError } = useFiles()

const isSvg = computed(() => map(props.svg || props.image?.svg, x => x.startsWith('<svg ')))

const svgEl = computed(() => isSvg.value ? parseHtml(props.svg || props.image?.svg || '') : null)

const imgSrc = computed(() => props.src || props.image?.uri)

</script>