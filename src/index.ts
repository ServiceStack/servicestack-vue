import * as components from './components'
/* stub impl for vue-router RouterLink */
import RouterLink from './components/RouterLink.vue'
import type { App } from 'vue'

import { useUtils } from './utils'
import { useConfig } from './config'
import { useClient } from './client'
import { useAuth } from './auth'
import { useFiles } from './files'
import { useAppMetadata } from './metadata'
import { useFormatters } from './formatters'

export { RouterLink, useUtils, useConfig, useClient, useAuth, useAppMetadata, useFiles, useFormatters }

const componentsList:any = components?.default
export default {
    install(app:App) {
        Object.keys(componentsList).forEach(name => {
            app.component(name, componentsList[name])
        })
    }
}
