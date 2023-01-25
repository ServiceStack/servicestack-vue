import * as components from './components'
/* stub impl for vue-router RouterLink */
import RouterLink from './components/RouterLink.vue'
import type { App } from 'vue'

import { useClient, unRefs, useAuth } from './api'

export { useClient, useAuth, unRefs, RouterLink }

const componentsList:any = components?.default
export default {
    install(app:App) {
        Object.keys(componentsList).forEach(name => {
            app.component(name, componentsList[name])
        })
    }
}
