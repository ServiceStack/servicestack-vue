import type { ApiRequest, IReturn, IReturnVoid, ApiState, IResponseError, IResponseStatus } from "@/types"
import type { JsonServiceClient } from "@servicestack/client"
import { inject, provide, ref } from "vue"
import { ResponseError, ResponseStatus, ApiResult, appendQueryString, nameOf } from "@servicestack/client"
import { unRefs, setRef } from "./utils"
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

    function swrCacheKey<TResponse>(request:IReturn<TResponse> | ApiRequest, args?: any) {
        const key = appendQueryString(`swr.${nameOf(request)}`, !args ? request : Object.assign({}, request, args))
        return key
    }
    function fromCache(key:string) {
        const json = Sole.config.storage!.getItem(key)
        const ret = json
            ? JSON.parse(json)
            : null
        return ret
    }
    function swrClear<TResponse>(options:{ request:IReturn<TResponse> | ApiRequest, args?: any }) {
        if (options.request) {
            const key = swrCacheKey(options.request, options.args)
            Sole.config.storage!.removeItem(key)
        }
    }

    async function swr<TResponse>(request:IReturn<TResponse> | ApiRequest, fn:(r:ApiResult<TResponse>) => void, args?: any, method?: string) {
        const key = swrCacheKey(request, args)

        fn(new ApiResult({ response: fromCache(key) }))
        const api = await client.api(request, args, method)
        if (api.succeeded && api.response) {
            api.response._date = new Date().valueOf()
            const json = JSON.stringify(api.response)
            Sole.config.storage!.setItem(key, json)
            fn(api)
        }
        return api
    }

    let ctx:ApiState = { setError, addFieldError, loading, error, api, apiVoid, apiForm, apiFormVoid, swr, unRefs, setRef, swrCacheKey, swrClear }
    provide('ApiState', ctx)
    return ctx
}
