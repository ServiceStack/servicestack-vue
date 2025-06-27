import type { AppMetadata, AuthenticateResponse, AutoQueryGridDefaults, UiConfig } from "@/types"
import { ref, computed, type Component } from "vue"
import { getFormatters } from "./formatters"
import { enumFlagsConverter } from "./metadata"
import { createBus, toKebabCase } from "@servicestack/client"
import RouterLink from '../components/RouterLink.vue'

export class Interceptors {
    callbacks:{ [key:string]: (key:string, value:any) => void} = {}    

    public register(key:string, callback:(key:string, value:any) => void) {
        this.callbacks[key] = callback
    }

    public has(key:string) { return !!this.callbacks[key] }

    public invoke(key:string, value:any) { 
        const cb = this.callbacks[key]
        if (typeof cb == 'function') {
            cb(key, value)
        }
    }
}

/** SSR safe wrapper around localStorage */
export class LocalStore implements Storage {
    get length() { return typeof localStorage == "undefined" ? 0 : localStorage.length }
    getItem(key:string) {
        if (typeof localStorage == "undefined") return null
        return localStorage.getItem(key)
    }
    setItem(key:string, value:string) {
        if (typeof localStorage == "undefined") return
        localStorage.setItem(key, value)
    }
    removeItem(key:string) {
        if (typeof localStorage == "undefined") return
        localStorage.removeItem(key)
    }
    clear() {
        if (typeof localStorage == "undefined") return
        localStorage.clear()
    }
    key(index: number) {
        if (typeof localStorage == "undefined") return null
        return localStorage.key(index)
    }
}

export class Sole {
    static config:UiConfig = {
        redirectSignIn: '/signin',
        redirectSignOut: '/auth/logout',
        navigate: url => location.href = url,
        assetsPathResolver: src => src,
        fallbackPathResolver: src => src,
        storage: new LocalStore(),
        tableIcon: { svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><g fill='none' stroke='currentColor' stroke-width='1.5'><path d='M5 12v6s0 3 7 3s7-3 7-3v-6'/><path d='M5 6v6s0 3 7 3s7-3 7-3V6'/><path d='M12 3c7 0 7 3 7 3s0 3-7 3s-7-3-7-3s0-3 7-3Z'/></g></svg>` },
        scopeWhitelist: {
            enumFlagsConverter,
            ...getFormatters()
        }
    }

    static autoQueryGridDefaults:AutoQueryGridDefaults = {
        deny: [],
        hide: [],
        toolbarButtonClass: undefined,
        tableStyle: "stripedRows",
        take: 25,
        maxFieldLength: 150,
    }

    static events = createBus()
    static user = ref<AuthenticateResponse|null>(null)
    static metadata = ref<AppMetadata|null>(null)
    static components:{[k:string]:Component} = {
        RouterLink,
    }
    static component(name:string) {
        const component = Sole.components[name]
        if (component) return component
        const kebabName = toKebabCase(name)
        const match = Object.keys(Sole.components).find(x => toKebabCase(x) === kebabName)
        return match && Sole.components[match] || null
    }
    static interceptors:Interceptors = new Interceptors()
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

export function registerInterceptor(key:string, callback:(key:string, value:any) => void) {
    Sole.interceptors.register(key, callback)
}

/** Manage Global Configuration for Component Library */
export function useConfig() {
    /** Resolve configuration in a reactive Ref<UiConfig> */
    const config = computed(() => Sole.config)
    const autoQueryGridDefaults = computed(() => Sole.autoQueryGridDefaults)
    const events = Sole.events

    return { 
        config, setConfig, events,
        autoQueryGridDefaults, setAutoQueryGridDefaults, 
        assetsPathResolver, fallbackPathResolver,
        registerInterceptor,
    }
}
