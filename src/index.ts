import * as components from './components'
import type { App } from 'vue'
import { useClient } from './api'

export { useClient }

const componentsList:any = components?.default
export default {
    install(app:App) {
        Object.keys(componentsList).forEach(name => {
            app.component(name, componentsList[name])
        })
    }
}
