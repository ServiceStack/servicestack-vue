import { ref, provide } from "vue"
import type { IReturn, ApiRequest, IReturnVoid, ResponseStatus } from "../types"
import { JsonApiClient, dateFmt } from "@servicestack/client"

//declare var API_URL:string //defined in vite.apply.ts
const API_URL = '/'

export const client = JsonApiClient.create()

// Managed client maintaining loading and error states that provides this 'ApiContext' to child components
export function useClient() {
    const loading = ref<boolean>(false)
    const error = ref<ResponseStatus & { fieldName?: string }|undefined>()

    const setError = ({ message, errorCode, fieldName, errors } : ResponseStatus & { fieldName: string } ) => {
        errorCode ??= 'Exception'
        errors ??= []
        return error.value = fieldName
            ? { errorCode, message,
                errors: [{ fieldName, errorCode, message }] }
            : { errorCode, message, errors };
    }

    const addFieldError = ({ fieldName, message, errorCode }) => {
        errorCode ??= 'Exception'
        if (!error.value) {
            setError({ fieldName, message, errorCode })
        } else {
            let copy = Object.assign({}, error.value)
            copy.errors = [...(copy.errors ?? []).filter(x => x.fieldName?.toLowerCase() != fieldName.toLowerCase()),
            { fieldName, message, errorCode }]
            error.value = copy
        }
    }

    async function api<TResponse>(request: IReturn<TResponse> | ApiRequest, args?: any, method?: string) {
        loading.value = true
        const apiResult = await client.api(request)
        loading.value = false
        error.value = apiResult.error
        return apiResult
    }

    async function apiVoid(request: IReturnVoid | ApiRequest, args?: any, method?: string) {
        loading.value = true
        const apiResult = await client.apiVoid(request)
        loading.value = false
        error.value = apiResult.error
        return apiResult
    }

    let ctx = { setError, addFieldError, loading, error, api, apiVoid }
    provide('ApiState', ctx)
    return ctx
}
