import type { AppMetadata, AuthenticateResponse, AutoQueryGridDefaults, UiConfig } from "@/types"
import { ref, computed } from "vue"
import { LocalStore } from "./utils"

export class Sole {
    static config:UiConfig = {
        redirectSignIn: '/signin',
        redirectSignOut: '/auth/logout',
        assetsPathResolver: src => src,
        fallbackPathResolver: src => src,
        storage: new LocalStore(),
    }

    static autoQueryGridDefaults:AutoQueryGridDefaults = {
        allowSelection: true,
        allowFiltering: true,
        allowQueryFilters: true,
        showToolbar: true,
        showPreferences: true,
        showPagingNav: true,
        showPagingInfo: true,
        showDownloadCsv: true,
        showRefresh: true,
        showCopyApiUrl: true,
        showResetPreferences: true,
        showFiltersView: true,
        showNewItem: true,
        toolbarButtonClass: undefined,
        tableStyle: "stripedRows",
        take: 25,
        maxFieldLength: 150,
    }

    static user = ref<AuthenticateResponse|null>(null)
    static metadata = ref<AppMetadata|null>(null)
}

/** Set global configuration */
export function setConfig(config:UiConfig) {
    Sole.config = Object.assign(Sole.config, config)
}

export function setAutoQueryGridDefaults(config:AutoQueryGridDefaults) {
    Sole.autoQueryGridDefaults = Object.assign(Sole.autoQueryGridDefaults, config)
}

/** Resolve Absolute URL to use for relative paths */
export function assetsPathResolver(src?:string) {
    return src && Sole.config.assetsPathResolver
        ? Sole.config.assetsPathResolver(src)
        : src
}

/** Resolve fallback URL to use if primary URL fails */
export function fallbackPathResolver(src?:string) {
    return src && Sole.config.fallbackPathResolver
        ? Sole.config.fallbackPathResolver(src)
        : src
}

/** Manage Global Configuration for Component Library */
export function useConfig() {
    /** Resolve configuration in a reactive Ref<UiConfig> */
    const config = computed(() => Sole.config)
    const autoQueryGridDefaults = computed(() => Sole.autoQueryGridDefaults)

    return { 
        config, setConfig, 
        autoQueryGridDefaults, setAutoQueryGridDefaults, 
        assetsPathResolver, fallbackPathResolver,
    }
}
