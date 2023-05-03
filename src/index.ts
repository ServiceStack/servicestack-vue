import * as components from './components'
/* stub impl for vue-router RouterLink */
import type { App, Component } from 'vue'

import { useUtils } from './use/utils'
import { Sole, useConfig } from './use/config'
import { useClient } from './use/client'
import { useAuth } from './use/auth'
import { useFiles } from './use/files'
import { useMetadata } from './use/metadata'
import { useFormatters } from './use/formatters'
import * as css from './components/css'

export { useUtils, useConfig, useClient, useAuth, useMetadata, useFiles, useFormatters, css }

const componentsList:any = components?.default
export default {
    install(app:App) {
        Object.keys(componentsList).forEach(name => {
            app.component(name, componentsList[name])
        })

        function href(s:any) {
            const qsArgs = Object.keys(s).filter(k => s[k])
                .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(s[k])}`)
            const qs = qsArgs.join('&')
            return !qs ? './' : '?' + qs
        }
        app.directive('href', function (el, binding) {
            el.href = href(binding.value)
            el.onclick = (e:Event) => {
                e.preventDefault()
                history.pushState(binding.value, '', href(binding.value))
            }
        })
    },
    component(name:string, component?:Component) {
        if (!name) return null
        if (!component) {
            return Sole.components[name] || componentsList[name] || null
        }
        return Sole.components[name] = component
    }
}
