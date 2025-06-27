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

// Export component types
export * from './components/types'
export * from './types'

export { useUtils, useConfig, useClient, useAuth, useMetadata, useFiles, useFormatters, css }

// Import components (this will be excluded from type generation)

// Export all components as named exports
export {
    Alert,
    AlertSuccess,
    ErrorSummary,
    InputDescription,
    Icon,
    Loading,

    OutlineButton,
    PrimaryButton,
    SecondaryButton,
    TextLink,

    Breadcrumbs,
    Breadcrumb,
    NavList,
    NavListItem,

    AutoQueryGrid,
    SettingsIcons,
    FilterViews,
    FilterColumn,
    QueryPrefs,
    EnsureAccess,
    EnsureAccessDialog,

    TextInput,
    TextareaInput,
    SelectInput,
    CheckboxInput,
    TagInput,
    FileInput,
    Autocomplete,
    Combobox,
    DynamicInput,
    LookupInput,

    AutoFormFields,
    AutoForm,
    AutoCreateForm,
    AutoEditForm,
    AutoViewForm,
    ConfirmDelete,
    FormLoading,

    DataGrid,
    CellFormat,
    PreviewFormat,
    HtmlFormat,
    MarkupFormat,
    MarkupModel,

    CloseButton,
    SlideOver,
    ModalDialog,
    ModalLookup,
    Tabs,

    DarkModeToggle,
    SignIn,
    MarkdownInput,
    SidebarLayout,
} from './components'
import { Components } from './components'
export { Components }

const componentsList: any = Components || {}
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
    },
}
