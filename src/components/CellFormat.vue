<script lang="ts">
import type { PropType } from 'vue'
import type { MetadataType, MetadataPropertyType, FormatInfo, RefInfo } from '@/types'
import { typeProperties, useMetadata } from '@/use/metadata'
import { mapGet } from '@servicestack/client'
import { defineComponent, h } from 'vue'
import { isComplexType } from '@/use/utils'
import { formatValue } from '@/use/formatters'
import Icon from './Icon.vue'

export default defineComponent({
    props: {
        type: Object as PropType<MetadataType>,
        propType: Object as PropType<MetadataPropertyType>,
        modelValue: Object
    },
    setup(props, { attrs }) {
        const { typeOf } = useMetadata()

        function propFormat(prop:MetadataPropertyType) {
            if (prop?.format)
                return prop.format
            if (prop?.type == 'TimeSpan' || prop?.type == 'TimeOnly')
                return { method:'time' }
            return null
        }

        return () => {
            const formatInfo:FormatInfo|null = propFormat(props.propType as MetadataPropertyType)
            const value = mapGet(props.modelValue, props.propType!.name!)
            const useAttrs = Object.assign({}, props, attrs)

            const hFormatValue = h('span', { innerHTML: formatValue(value, formatInfo, useAttrs) })
            const hValue = isComplexType(value) && Array.isArray(value)
                ? h('span', {}, [
                    h('span', { 'class':'mr-2' }, `${value.length}`),
                    hFormatValue
                ])
                : hFormatValue

            const ref = props.propType?.ref as RefInfo
            if (!ref)
                return hValue

            const modelProps = typeProperties(props.type)
            const complexRefProp = modelProps.find(x => x.type === ref.model)
            if (!complexRefProp)
                return hValue

            const complexRefValue = mapGet(props.modelValue, complexRefProp.name)
            const labelValue:any = complexRefValue && ref.refLabel && mapGet(complexRefValue, ref.refLabel)
            if (!labelValue)
                return hValue

            const refType = typeOf(ref.model)
            const image = refType?.icon
            const hImage = image 
                ? h(Icon as any, { image, 'class':'w-5 h-5 mr-1' })
                : null

            return h('span', { 'class': 'flex', title:`${ref.model} ${value}`}, [
                hImage, 
                labelValue
            ])
        }
    }
})
</script>