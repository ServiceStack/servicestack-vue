import type { ApiRequest, IReturn, IReturnVoid, JsonServiceClient } from "@servicestack/client"
import type { ApiState, AuthenticateResponse, IResponseError, IResponseStatus, AppMetadata, MetadataPropertyType } from "./types"
import { ResponseError, ResponseStatus, toDate } from "@servicestack/client"
import { computed, inject, isRef, provide, ref, unref } from "vue"

export function unRefs(o:any) {
    Object.keys(o).forEach(k => {
        const val = o[k]
        o[k] = isRef(val) ? unref(val) : val
    })
    return o
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
            : new ResponseStatus({ errorCode, message, errors })
    }

    function addFieldError({ fieldName, message, errorCode }: IResponseError) {
        if (!errorCode) errorCode = 'Exception'
        if (!error.value) {
            setError({ fieldName, message, errorCode })
        } else {
            let copy = new ResponseStatus(error.value)
            copy.errors = [...(copy.errors || []).filter(x => x.fieldName.toLowerCase() !== fieldName?.toLowerCase()),
                new ResponseError({ fieldName, message, errorCode })]
            error.value = copy
        }
    }

    function api<TResponse>(request:IReturn<TResponse> | ApiRequest, args?:any, method?:string) {
        loading.value = true
        return client.api<TResponse>(unRefs(request), args, method)
            .then(api => {
                loading.value = false
                response.value = api.response
                error.value = api.error
                return api
            })
    }

    async function apiVoid(request:IReturnVoid | ApiRequest, args?:any, method?:string) {
        loading.value = true
        return client.apiVoid(unRefs(request), args, method)
            .then(api => {
                loading.value = false
                response.value = api.response
                error.value = api.error
                return api
            })
    }

    async function apiForm<TResponse>(request: IReturn<TResponse> | ApiRequest, body: FormData, args?: any, method?: string) {
        loading.value = true
        return client.apiForm<TResponse>(unRefs(request), body, args, method)
            .then(api => {
                loading.value = false
                response.value = api.response
                error.value = api.error
                return api
            })
    }

    async function apiFormVoid(request: IReturnVoid | ApiRequest, body: FormData, args?: any, method?: string) {
        loading.value = true
        return client.apiFormVoid(unRefs(request), body, args, method)
            .then(api => {
                loading.value = false
                response.value = api.response
                error.value = api.error
                return api
            })
    }

    let ctx:ApiState = { setError, addFieldError, loading, error, api, apiVoid, apiForm, apiFormVoid, unRefs }
    provide('ApiState', ctx)
    return ctx
}

class Single {
    static user = ref<AuthenticateResponse|null>(null)    
    static metadata = ref<AppMetadata|null>(null)
}
export function useAuth() {
    const user = computed(() => Single.user.value)
    const isAuthenticated = computed(() => Single.user.value != null)
    const hasRole = (role:string) => (Single.user.value?.roles || []).indexOf(role) >= 0
    const hasPermission = (permission:string) => (Single.user.value?.permissions || []).indexOf(permission) >= 0
    const isAdmin = computed(() => hasRole('Admin'))
    const signIn = (user:AuthenticateResponse) => { Single.user.value = user }
    const signOut = () => { Single.user.value = null }
    return { user, isAuthenticated, isAdmin, hasRole, hasPermission, signIn, signOut }
}

export function useAppMetadata() {
    const metadataPath = "/metadata/app.json"

    const isValid = (metadata:AppMetadata|null|undefined) =>
        metadata?.api?.operations && metadata.api.operations.length > 0

    function setMetadata(metadata:AppMetadata|null|undefined) {
        if (metadata && isValid(metadata)) {
            Single.metadata.value = metadata
            localStorage.setItem(metadataPath, JSON.stringify(metadata))
            return true
        }
        return false
    }

    function tryLoad() {
        if (Single.metadata.value != null) return true
        let metadata:AppMetadata|null = (globalThis as any).Server
        if (!isValid(metadata)) {
            const json = localStorage.getItem(metadataPath)
            if (json) {
                try {
                    setMetadata(JSON.parse(json) as AppMetadata)
                } catch(e) {
                    console.log(`Could not JSON.parse ${metadataPath} from localStorage`)
                }
            }
        }
        return Single.metadata.value != null
    }
    tryLoad()

    const metadataApi = computed(() => Single.metadata.value?.api)

    async function load(metadata?:AppMetadata, opts?:{ resolve?:() => Promise<Response> }) {
        if (metadata) {
            setMetadata(metadata)
        }
        if (!tryLoad()) {
            let r = opts?.resolve
                ? await opts.resolve()
                : await fetch(metadataPath)
            if (r.ok) {
                let json = await r.text()
                setMetadata(JSON.parse(json) as AppMetadata)
            } else {
                console.error(`Could not fetch ${metadataPath}: ${r.statusText}`)
            }
        }
        return Single.metadata.value as any // avoid type explosion in api.d.ts until needed
    }

    function clear(opts?:{ olderThan?:number }) {
        if (opts?.olderThan && tryLoad()) {
            let date = toDate(Single.metadata.value?.date)
            if (date && (new Date().getTime() - date.getTime()) < opts.olderThan)
                return
        }
        Single.metadata.value = null
        localStorage.removeItem(metadataPath)
    }

    function typeOf(name:string) {
        let api = Single.metadata.value?.api
        if (!api) return null
        let type = api.types.find(x => x.name.toLowerCase() === name.toLowerCase())
        if (type) return type
        let requestOp = api.operations.find(x => x.request.name.toLowerCase() === name.toLowerCase())
        if (requestOp) return requestOp.request
        let responseOp = api.operations.find(x => x.response && (x.response.name.toLowerCase() === name.toLowerCase()))
        if (responseOp) return responseOp.response
        return null
    }

    function property(typeName:string, name:string) {
        let type = typeOf(typeName)
        let prop = type && type.properties && type.properties.find(x => x.name.toLowerCase() === name.toLowerCase())
        return prop
    }

    function enumOptions(name:string) {
        let to:{[name:string]:string} = {}
        let type = typeOf(name)
        if (type && type.isEnum && type.enumNames != null) {
            for (let i=0; i<type.enumNames.length; i++) {
                const name = (type.enumDescriptions ? type.enumDescriptions[i] : null) || type.enumNames[i]
                const key = (type.enumValues != null ? type.enumValues[i] : null) || type.enumNames[i]
                to[key] = name
            }
        }
        return to
    }

    function propertyOptions(prop:MetadataPropertyType) {
        let to:{[name:string]:string} = {}
        if (!prop) return to
        let allowableEntries = prop.input && prop.input.allowableEntries
        if (allowableEntries) {
            for (let i=0; i<allowableEntries.length; i++) {
                let x = allowableEntries[i]
                to[x.key] = x.value
            }
            return to
        }
        let allowableValues = prop.allowableValues || (prop.input ? prop.input.allowableValues : null)
        if (allowableValues) {
            for (let i=0; i<allowableValues.length; i++) {
                let value = allowableValues[i]
                to[value] = value
            }
        }
        return to
    }

    return { clear, load, metadataApi, typeOf, property, enumOptions, propertyOptions }
}
