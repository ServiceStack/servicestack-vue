import type { ApiRequest, ApiResult, EmptyResponse, IReturn, IReturnVoid, ResponseError, ResponseStatus } from '@servicestack/client'
import type { Ref } from "vue"

export type ApiState = {
    loading: Ref<boolean>,
    error: Ref<ResponseStatus|undefined>
}

export type ErrorArgs = {
    message:string
    errorCode?:string
    fieldName?:string
    errors?:ResponseError[]
}
export type FieldErrorArgs = {
    fieldName:string
    message:string
    errorCode?:string
}
export type ClientContext = ApiState & {
    setError(args:ErrorArgs): void
    addFieldError(args:FieldErrorArgs): void
    api<TResponse>(request: IReturn<TResponse> | ApiRequest, args?: any, method?: string): Promise<ApiResult<TResponse>>
    apiVoid(request: IReturnVoid | ApiRequest, args?: any, method?: string): Promise<ApiResult<EmptyResponse>>
}
