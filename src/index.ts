import * as components from './components'
/* stub impl for vue-router RouterLink */
import RouterLink from './components/RouterLink.vue'
import type { App } from 'vue'

import { useUtils } from './use/utils'
import { useConfig } from './use/config'
import { useClient } from './use/client'
import { useAuth } from './use/auth'
import { useFiles } from './use/files'
import { useMetadata } from './use/metadata'
import { useFormatters } from './use/formatters'

const optionalComponents:{[k:string]:any} = { RouterLink }
export { useUtils, useConfig, useClient, useAuth, useMetadata, useFiles, useFormatters }

const componentsList:any = components?.default
export default {
    install(app:App) {
        Object.keys(componentsList).forEach(name => {
            app.component(name, componentsList[name])
        })
    },
    component(name:string) {
        if (!name) return null
        return componentsList[name] || optionalComponents[name] || null
    }
}
