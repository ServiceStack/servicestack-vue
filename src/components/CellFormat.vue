<script lang="ts">
import type { MetadataType, MetadataPropertyType, FormatInfo } from '@/types'
import { typeProperties, useMetadata } from '@/use/metadata'
import { mapGet } from '@servicestack/client'
import { defineComponent, h, type PropType } from 'vue'
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
        return () => {
            const formatInfo:FormatInfo|null = props.propType?.format 
                || (props.propType?.type == 'TimeSpan' || props.propType?.type == 'TimeOnly')
                    ? { method:'time' }
                    : null
            const value = mapGet(props.modelValue, props.propType!.name!)

            const hFormatValue = h('span', { innerHTML: formatValue(value, formatInfo, attrs) })
            const hValue = isComplexType(value) && Array.isArray(value)
                ? h('span', {}, [
                    h('span', { 'class':'mr-2' }, `${value.length}`),
                    hFormatValue
                ])
                : hFormatValue

            const ref = props.propType?.ref
            if (!ref)
                return hValue

            const refType = typeOf(ref.model)
            const image = refType?.icon
            if (!image)
                return hValue

            const modelProps = typeProperties(props.type)
            const complexRefProp = modelProps.find(x => x.type === ref.model)
            if (!complexRefProp)
                return hValue

            const complexRefValue = mapGet(props.modelValue, complexRefProp.name)
            const labelValue:any = complexRefValue && mapGet(complexRefValue, ref.refLabel)
            if (!labelValue)
                return hValue

            return h('span', { 'class': 'flex', title:`${ref.model} ${value}`}, [
                h(Icon as any, { image, 'class':'w-5 h-5 mr-1' }), 
                labelValue
            ])
        }
    }
})
</script>