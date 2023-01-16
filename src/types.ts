import type { ApiRequest, ApiResult, EmptyResponse, IReturn, IReturnVoid, ResponseError, ResponseStatus } from "@servicestack/client"
import type { Ref } from "vue"

export interface IResponseError {
    errorCode?: string;
    fieldName?: string;
    message?: string;
}

export interface IResponseStatus extends IResponseError {
    errors?: ResponseError[];
}

export type ApiState = {
    unRefs: (o:any) => any;
    setError: ({ message, errorCode, fieldName, errors }: IResponseStatus) => ResponseStatus;
    addFieldError: ({ fieldName, message, errorCode }: IResponseError) => void;
    loading: Ref<boolean>;
    error: Ref<any>;
    api: <TResponse>(request: IReturn<TResponse> | ApiRequest, args?: any, method?: string) => Promise<ApiResult<TResponse>>;
    apiVoid: (request: IReturnVoid | ApiRequest, args?: any, method?: string) => Promise<ApiResult<EmptyResponse>>;
    apiForm: <TResponse>(request: ApiRequest | IReturn<TResponse>, body: FormData, args?: any, method?: string) => Promise<ApiResult<TResponse>>;
    apiFormVoid: (request: IReturnVoid | ApiRequest, body: FormData, args?: any, method?: string) => Promise<ApiResult<EmptyResponse>>;
}
