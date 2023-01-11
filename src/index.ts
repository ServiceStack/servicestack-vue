import { def } from '@vue/shared'
import * as components from './components'

const componentsList:any = components?.default
const VueTw = {
    install(Vue:any) {
        Object.keys(componentsList).forEach(name => {
            Vue.component(name, componentsList[name])
        })
    }
}
export default VueTw