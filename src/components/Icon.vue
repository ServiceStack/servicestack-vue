<template>
    <span v-if="isSvg" v-html="svgHtml()"></span>
    <img v-else="imgSrc" :class="image?.cls" :src="assetsPathResolver(imgSrc)" @error="iconOnError($event.target as HTMLImageElement)">
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { ImageInfo } from '@/types'
import { classNames, htmlAttrs, map } from '@servicestack/client'
import { useConfig, useFiles } from '@/api'

const props = defineProps<{
    image?: ImageInfo
    svg?: string
    src?: string
    alt?: string
}>()

const { assetsPathResolver } = useConfig()
const { iconOnError } = useFiles()

const isSvg = computed(() => map(props.svg || props.image?.svg, x => x.startsWith('<svg ')))
const $attrs = useAttrs()

function svgHtml() {
    const svg = props.svg || props.image?.svg
    if (svg && svg.startsWith('<svg ')) {
        const cls = classNames(props.image?.cls, $attrs.class)
        const svgAttrs = Object.assign({}, { class:cls, role:'img', 'aria-hidden':'true' }, $attrs)        
        return `<svg ${htmlAttrs(svgAttrs)} ` + svg.substring(4)
    }
    return null
}

const imgSrc = computed(() => props.src || props.image?.uri)

</script>