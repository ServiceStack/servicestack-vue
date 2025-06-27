<template>
    <a v-if="type=='link'" :href="value" class="text-indigo-600">{{value}}</a>
    <a v-else-if="type=='image'" :href="value" :title="value" class="inline-block">
        <Icon :src="value" :class="imageClass" />
    </a>
    <HtmlFormat v-else :value="value" />
</template>
<script setup lang="ts">
import type { MarkupFormatProps } from '@/components/types'
import { useFiles } from '@/use/files'

const props = withDefaults(defineProps<MarkupFormatProps>(), {
    imageClass: 'w-8 h-8',
})

const { getMimeType } = useFiles()
const v = props.value

let type:string = typeof props.value
const mimeType = type === 'string' && v.length ? getMimeType(v) : null

if (type === 'string' && v.length) {
    const url = v.startsWith('https://') || v.startsWith('http://')
    const path = url || v[0] === '/'
    
    if (path && mimeType?.startsWith('image/')) {
        type = 'image'
    } else if (url) {
        type = 'link'
    }
}
</script>
