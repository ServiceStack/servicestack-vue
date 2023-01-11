import type { Ref } from "vue"
import { ref, provide } from "vue"
import type { IReturn, ApiRequest, IReturnVoid } from "@servicestack/client"
import { ResponseError, ResponseStatus, JsonServiceClient, dateFmt } from "@servicestack/client"
import type { ClientContext, ErrorArgs, FieldErrorArgs } from "@/types"

export const dateInputFormat = (d:Date) => dateFmt(d).replace(/\//g,'-')
export const enumOptions = (name:string) => {
    return name == 'RoomType' 
        ? { Single:'Single', Double:'Double', Queen:'Queen', Twin:'Twin', Suite:'Suite' }
        : {}
}

//declare var API_URL:string //defined in vite.apply.ts
const API_URL = '/'

export const client = new JsonServiceClient(API_URL).apply(c => {
    c.basePath = "/api"
    c.headers = new Headers() //avoid pre-flight CORS requests
})

// Managed client maintaining loading and error states that provides this 'ApiContext' to child components
export function useClient() : ClientContext {
    const loading = ref<boolean>(false)
    const error = ref<ResponseStatus|undefined>()

    const setError = ({ message, errorCode, fieldName, errors } : ErrorArgs) => {
        errorCode ??= 'Exception'
        errors ??= []
        return error.value = fieldName
            ? new ResponseStatus({ errorCode, message,
                errors: [new ResponseError({ fieldName, errorCode, message })] })
            : new ResponseStatus({ errorCode, message, errors });
    }

    const addFieldError = ({ fieldName, message, errorCode } : FieldErrorArgs) => {
        errorCode ??= 'Exception'
        if (!error.value) {
            setError({ fieldName, message, errorCode })
        } else {
            let copy = new ResponseStatus(error.value)
            copy.errors = [...(copy.errors ?? []).filter(x => x.fieldName.toLowerCase() != fieldName.toLowerCase()),
                new ResponseError({ fieldName, message, errorCode })]
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

export enum RoomType
{
    Single = 'Single',
    Double = 'Double',
    Queen = 'Queen',
    Twin = 'Twin',
    Suite = 'Suite',
}

// @DataContract
export class AuditBase
{
    // @DataMember(Order=1)
    public createdDate?: string;

    // @DataMember(Order=2)
    // @Required()
    public createdBy?: string;

    // @DataMember(Order=3)
    public modifiedDate?: string;

    // @DataMember(Order=4)
    // @Required()
    public modifiedBy?: string;

    // @DataMember(Order=5)
    public deletedDate?: string;

    // @DataMember(Order=6)
    public deletedBy?: string;

    public constructor(init?: Partial<AuditBase>) { (Object as any).assign(this, init); }
}

// @DataContract
export class IdResponse
{
    // @DataMember(Order=1)
    public id?: string;

    // @DataMember(Order=2)
    public responseStatus?: ResponseStatus;

    public constructor(init?: Partial<IdResponse>) { (Object as any).assign(this, init); }
}

export class Booking extends AuditBase
{
    public id?: number;
    public name?: string;
    public roomType?: RoomType;
    public roomNumber?: number;
    public bookingStartDate?: string;
    public bookingEndDate?: string;
    public cost?: number;
    public notes?: string;
    public cancelled?: boolean;

    public constructor(init?: Partial<Booking>) { super(init); (Object as any).assign(this, init); }
}

export interface ICreateDb<Table>
{
}

// @ValidateRequest(Validator="HasRole(`Employee`)")
export class CreateBooking implements IReturn<IdResponse>, ICreateDb<Booking>
{
    public name?: string;
    public roomType?: RoomType;
    // @Validate(Validator="GreaterThan(0)")
    public roomNumber?: number;

    public bookingStartDate?: string;
    public bookingEndDate?: string;
    // @Validate(Validator="GreaterThan(0)")
    public cost?: number;

    public notes?: string;

    public constructor(init?: Partial<CreateBooking>) { (Object as any).assign(this, init); }
    public createResponse() { return new IdResponse(); }
    public getTypeName() { return 'CreateBooking'; }
    public getMethod() { return 'POST'; }
}
