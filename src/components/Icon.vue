<script lang="ts">
import type { PropType } from 'vue'
import type { ImageInfo } from '@/types'
import { defineComponent, h } from 'vue'
import { leftPart } from '@servicestack/client'
import { assetsPathResolver } from '@/use/config'
import { iconOnError } from '@/use/files'
import { useMetadata } from '@/use/metadata'

export default defineComponent({
    inheritAttrs: false,
    props: {
        image: Object as PropType<ImageInfo>,
        svg: String,
        src: String,
        alt: String,
        type: String,
    },
    setup(props, { attrs }) {
        return () => {
            let image = props.image
            if (props.type) {
                const { typeOf } = useMetadata()
                const metaType = typeOf(props.type)
                if (!metaType) {
                    console.warn(`Type ${props.type} does not exist`)
                }
                if (!metaType?.icon) {
                    console.warn(`Type ${props.type} does not have a [Svg] icon`)
                } else {
                    image = metaType?.icon
                }
            }
            let svg:string = props.svg || image?.svg || ''
            const isSvg = svg.startsWith('<svg ')
            if (isSvg) {
                let svgTag = leftPart(svg, '>')
                let clsPos = svgTag.indexOf('class=')
                let cls = `${image?.cls||''} ${attrs.class||''}`
                if (clsPos == -1) {
                    svg = `<svg class="${cls}" ${svg.substring(4)}`
                } else {
                    const clsQuotePos = clsPos+'class='.length+1
                    svg = `${svg.substring(0,clsQuotePos) + cls} ${svg.substring(clsQuotePos)}`
                }
                return h('span', { 'innerHTML': svg })
            } else {
                return h('img', { 
                    'class': [image?.cls, attrs.class],
                    src: assetsPathResolver(props.src || image?.uri),
                    onError: (e:Event) => { 
                        return iconOnError(e.target as HTMLImageElement) 
                    }
                })
            }
        }
    }
})
</script>