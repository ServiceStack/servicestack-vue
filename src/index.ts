import * as components from './components'
/* stub impl for vue-router RouterLink */
import RouterLink from './components/RouterLink.vue'
import type { App } from 'vue'

import { useUtils } from './use/utils'
import { useConfig } from './use/config'
import { useClient } from './use/client'
import { useAuth } from './use/auth'
import { useFiles } from './use/files'
import { useAppMetadata } from './use/metadata'
import { useFormatters } from './use/formatters'

export { useUtils, useConfig, useClient, useAuth, useAppMetadata, useFiles, useFormatters }

const componentsList:any = components?.default
export default {
    install(app:App, options?:{ include?:string[] }) {
        Object.keys(componentsList).forEach(name => {
            app.component(name, componentsList[name])
        })
        if (options?.include) {
            if (options?.include.includes('RouterLink')) {
                app.component('RouterLink', RouterLink)
            }
        }
    },
    component(name:string) {
        if (name === 'RouterLink') return RouterLink
        return componentsList && componentsList[name] || null
    }
}
