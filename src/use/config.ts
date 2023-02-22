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
        tableIcon: { svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><g fill='none' stroke='currentColor' stroke-width='1.5'><path d='M5 12v6s0 3 7 3s7-3 7-3v-6'/><path d='M5 6v6s0 3 7 3s7-3 7-3V6'/><path d='M12 3c7 0 7 3 7 3s0 3-7 3s-7-3-7-3s0-3 7-3Z'/></g></svg>` },
    }

    static autoQueryGridDefaults:AutoQueryGridDefaults = {
        deny: [],
        hide: [],
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
