import type { ApiRequest, IReturn, IReturnVoid, ApiState, IResponseError, IResponseStatus } from "@/types"
import type { JsonServiceClient } from "@servicestack/client"
import { inject, provide, ref } from "vue"
import { ResponseError, ResponseStatus, ApiResult, appendQueryString, nameOf } from "@servicestack/client"
import { unRefs, setRef, swrApi } from "./utils"
import { Sole } from "./config"

export function useClient() {
    /** Maintain loading state whilst API Request is in transit */
    const loading = ref(false)
    /** Maintain API Error in reactive Ref<ResponseStatus> */
    const error = ref()
    const response = ref()
    const client = inject<JsonServiceClient>('client')!

    /** Set error state with summary or field validation error */
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

    /** Add field error to API error state */
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

    /** Send a typed API request and return results in an ApiResult<TResponse> */
    async function api<TResponse>(request:IReturn<TResponse> | ApiRequest, args?:any, method?:string) {
        loading.value = true
        let api = await client.api<TResponse>(unRefs(request), args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
    }

    /** Send a typed API request and return empty response in a void ApiResult */
    async function apiVoid(request:IReturnVoid | ApiRequest, args?:any, method?:string) {
        loading.value = true
        let api = await client.apiVoid(unRefs(request), args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
    }

    /** Send a FormData API request and return results in an ApiResult<TResponse> */
    async function apiForm<TResponse>(request: IReturn<TResponse> | ApiRequest, body: FormData, args?: any, method?: string) {
        loading.value = true
        let api = await client.apiForm<TResponse>(unRefs(request), body, args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
    }

    /** Send a FormData API request and return empty response in a void ApiResult */
    async function apiFormVoid(request: IReturnVoid | ApiRequest, body: FormData, args?: any, method?: string) {
        loading.value = true
        let api = await client.apiFormVoid(unRefs(request), body, args, method)
        loading.value = false
        response.value = api.response
        error.value = api.error
        return api
    }

    async function swr<TResponse>(request:IReturn<TResponse> | ApiRequest, fn:(r:ApiResult<TResponse>) => void, args?: any, method?: string) {
        return swrApi(client, request, fn, args, method)
    }

    let ctx:ApiState = { setError, addFieldError, loading, error, api, apiVoid, apiForm, apiFormVoid, swr, unRefs, setRef }
    provide('ApiState', ctx)
    return ctx
}
