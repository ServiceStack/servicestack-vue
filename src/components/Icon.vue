<script lang="ts">
import type { ImageInfo } from '@/types'
import type { PropType } from 'vue'

import { defineComponent, h } from 'vue'
import { leftPart } from '@servicestack/client'
import { assetsPathResolver } from '@/use/config'
import { iconOnError } from '@/use/files'

export default defineComponent({
    inheritAttrs: false,
    props: {
        image: Object as PropType<ImageInfo>,
        svg: String,
        src: String,
        alt: String,
    },
    setup(props, { attrs }) {
        return () => {
            let svg:string = props.svg || props.image?.svg || ''
            const isSvg = svg.startsWith('<svg ')
            if (isSvg) {
                let svgTag = leftPart(svg, '>')
                let clsPos = svgTag.indexOf('class=')
                let cls = `${props.image?.cls||''} ${attrs.class||''}`
                if (clsPos == -1) {
                    svg = `<svg class="${cls}" ${svg.substring(4)}`
                } else {
                    const clsQuotePos = clsPos+'class='.length+1
                    svg = `${svg.substring(0,clsQuotePos) + cls} ${svg.substring(clsQuotePos)}`
                }
                return h('span', { 'innerHTML': svg })
            } else {
                return h('img', { 
                    'class': [props.image?.cls, attrs.class],
                    src: assetsPathResolver(props.src || props.image?.uri),
                    onError: (e:Event) => { 
                        return iconOnError(e.target as HTMLImageElement) 
                    }
                })
            }
        }
    }
})
</script>