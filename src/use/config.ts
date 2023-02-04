import type { AppMetadata, AuthenticateResponse, UiConfig } from "@/types"
import { ref, computed } from "vue"

export class Sole {
    static config:UiConfig = {
        redirectSignIn: '/signin',
        assetsPathResolver: src => src,
        fallbackPathResolver: src => src,
    }

    static user = ref<AuthenticateResponse|null>(null)
    static metadata = ref<AppMetadata|null>(null)
}

/** Set global configuration */
export function setConfig(config:UiConfig) {
    Sole.config = Object.assign(Sole.config, config)
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

    return { config, setConfig, assetsPathResolver, fallbackPathResolver }
}
