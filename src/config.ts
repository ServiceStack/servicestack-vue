import type { AppMetadata, AuthenticateResponse, UiConfig } from "./types"
import { dateFmt, timeFmt12 } from "@servicestack/client"
import { ref, computed } from "vue"

export class Sole {
    static config:UiConfig = {
        redirectSignIn: '/signin',
        assetsPathResolver: src => src,
        fallbackPathResolver: src => src,
        formatDate: dateFmt,
        formatTime: timeFmt12,
    }

    static user = ref<AuthenticateResponse|null>(null)
    static metadata = ref<AppMetadata|null>(null)
}

export function setConfig(config:UiConfig) {
    Sole.config = Object.assign(Sole.config, config)
}
export function assetsPathResolver(src?:string) {
    return src && Sole.config.assetsPathResolver
        ? Sole.config.assetsPathResolver(src)
        : src
}

export function fallbackPathResolver(src?:string) {
    return src && Sole.config.fallbackPathResolver
        ? Sole.config.fallbackPathResolver(src)
        : src
}

export function formatDate(d:Date) {
    return Sole.config.formatDate && Sole.config.formatDate(d) || dateFmt(d)
}

export function formatTime(d:Date) {
    return Sole.config.formatTime && Sole.config.formatTime(d) || timeFmt12(d)
}

export function useConfig() {
    const config = computed(() => Sole.config)
    return { config, setConfig, assetsPathResolver, fallbackPathResolver, formatDate, formatTime }
}
