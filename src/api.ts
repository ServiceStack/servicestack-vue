import type { ApiRequest, IReturn, IReturnVoid, ApiState, AuthenticateResponse, IResponseError, IResponseStatus, AppMetadata, UiConfig } from "./types"
import type { JsonServiceClient } from "@servicestack/client"
import { computed, inject, provide, ref } from "vue"
import { ResponseError, ResponseStatus, dateFmt, timeFmt12 } from "@servicestack/client"
import { unRefs, setRef } from "./utils"

export class Sole {
    static config = ref<UiConfig>({
        redirectSignIn: '/signin',
        assetsPathResolver: src => src,
        fallbackPathResolver: src => src,
        formatDate: dateFmt,
        formatTime: timeFmt12,
    })

    static user = ref<AuthenticateResponse|null>(null)
    static metadata = ref<AppMetadata|null>(null)
}

export function useClient() {
    const loading = ref(false)
    const error = ref()
    const response = ref()
    const client:JsonServiceClient = inject('client')!

    function setError({ message, errorCode, fieldName, errors }: IResponseStatus) {
        if (!errorCode) errorCode = 'Exception'
        if (!errors) errors = []
        return error.value = fieldName
            ? new ResponseStatus({
                errorCode, message,
                errors: [new ResponseError({ fieldName, errorCode, message })]
            })
            : new ResponseStatus({ errorCode, message, errors } as any)
    }

    function addFieldError({ fieldName, message, errorCode }: IResponseError) {
        if (!errorCode) errorCode = 'Exception'
        if (!error.value) {
            setError({ fieldName, message, errorCode })
        } else {
            let copy = new ResponseStatus(error.value)
            copy.errors = [...(copy.errors || []).filter(x => x.fieldName?.toLowerCase() !== fieldName?.toLowerCase()),
                new ResponseError({ fieldName, message, errorCode })]
            error.value = copy
        }
    }

    async function api<TResponse>(request:IReturn<TResponse> | ApiRequest, args?:any, method?:string) {
        loading.value = true
        let api = await client.api<TResponse>(unRefs(request), args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
    }

    async function apiVoid(request:IReturnVoid | ApiRequest, args?:any, method?:string) {
        loading.value = true
        let api = await client.apiVoid(unRefs(request), args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
}

    async function apiForm<TResponse>(request: IReturn<TResponse> | ApiRequest, body: FormData, args?: any, method?: string) {
        loading.value = true
        let api = await client.apiForm<TResponse>(unRefs(request), body, args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
    }

    async function apiFormVoid(request: IReturnVoid | ApiRequest, body: FormData, args?: any, method?: string) {
        loading.value = true
        let api = await client.apiFormVoid(unRefs(request), body, args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
    }

    let ctx:ApiState = { setError, addFieldError, loading, error, api, apiVoid, apiForm, apiFormVoid, unRefs, setRef }
    provide('ApiState', ctx)
    return ctx
}

export function useConfig() {
    const config = computed(() => Sole.config.value)
    const setConfig = (config:UiConfig) => {
        Sole.config.value = Object.assign(Sole.config.value, config)
    }
    function assetsPathResolver(src?:string) {
        return src && Sole.config.value.assetsPathResolver
            ? Sole.config.value.assetsPathResolver(src)
            : src
    }
    function fallbackPathResolver(src?:string) {
        return src && Sole.config.value.fallbackPathResolver
            ? Sole.config.value.fallbackPathResolver(src)
            : src
    }

    function formatDate(d:Date) {
        return config.value.formatDate && config.value.formatDate(d) || dateFmt(d)
    }
    
    function formatTime(d:Date) {
        return config.value.formatTime && config.value.formatTime(d) || timeFmt12(d)
    }
    
    return { config, setConfig, assetsPathResolver, fallbackPathResolver, formatDate, formatTime }
}

export function useAuth() {
    const user = computed(() => Sole.user.value)
    const isAuthenticated = computed(() => Sole.user.value != null)
    const hasRole = (role:string) => (Sole.user.value?.roles || []).indexOf(role) >= 0
    const hasPermission = (permission:string) => (Sole.user.value?.permissions || []).indexOf(permission) >= 0
    const isAdmin = computed(() => hasRole('Admin'))
    const signIn = (user:AuthenticateResponse) => { Sole.user.value = user }
    const signOut = () => { Sole.user.value = null }
    return { user, isAuthenticated, isAdmin, hasRole, hasPermission, signIn, signOut }
}
