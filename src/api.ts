import type { Ref } from "vue"
import type { ApiRequest, IReturn, IReturnVoid, JsonServiceClient } from "@servicestack/client"
import type { ApiState, AuthenticateResponse, IResponseError, IResponseStatus } from "./types"
import { ResponseError, ResponseStatus } from "@servicestack/client"
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

class Auth {
    static user:Ref<AuthenticateResponse|null> = ref(null) 
}
export function useAuth()
{
    const user = computed(() => Auth.user.value)
    const isAuthenticated = computed(() => Auth.user.value != null)
    const hasRole = (role:string) => (Auth.user.value?.roles || []).indexOf(role) >= 0
    const hasPermission = (permission:string) => (Auth.user.value?.permissions || []).indexOf(permission) >= 0
    const isAdmin = computed(() => hasRole('Admin'))
    const signIn = (user:AuthenticateResponse) => { Auth.user.value = user }
    const signOut = () => { Auth.user.value = null }
    return { user, isAuthenticated, isAdmin, hasRole, hasPermission, signIn, signOut }
}
