import type { 
    ApiState, 
    AuthenticateResponse, 
    IResponseError, 
    IResponseStatus, 
    AppMetadata, 
    MetadataType, 
    MetadataPropertyType, 
    MetadataOperationType,
    InputInfo,
    UiConfig, 
    KeyValuePair,
} from "./types"
import type { ApiRequest, IReturn, IReturnVoid, JsonServiceClient } from "@servicestack/client"
import { lastRightPart, leftPart, map, chop } from "@servicestack/client"
import { ResponseError, ResponseStatus, toDate, dateFmt, timeFmt12, apiValue, isDate, toCamelCase, JSV, mapGet, resolve } from "@servicestack/client"
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

    let ctx:ApiState = { setError, addFieldError, loading, error, api, apiVoid, apiForm, apiFormVoid, unRefs }
    provide('ApiState', ctx)
    return ctx
}

class Sole {
    static config = ref<UiConfig>({
        redirectSignIn: '/signin',
        assetsPathResolver: src => src,
        fallbackPathResolver: src => src,
        formatDate: dateFmt,
        formatTime: timeFmt12
    })

    static user = ref<AuthenticateResponse|null>(null)
    static metadata = ref<AppMetadata|null>(null)
}

export type FormStyle = "slideOver" | "card"
export type TableStyle = "simple" | "fullWidth" | "stripedRows" | "whiteBackground" | "uppercaseHeadings" | "verticalLines"
export type TableStyleOptions = TableStyle|TableStyle[]|string

function hasTableStyle(style:TableStyleOptions, target:TableStyle) {
    return Array.isArray(style)
        ? style.indexOf(target) >= 0
        : style == target
}

export class Css {

    public static card = {
        panelClass: "shadow sm:overflow-hidden sm:rounded-md",
        formClass: "space-y-6 bg-white dark:bg-black py-6 px-4 sm:p-6",
        headingClass: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100",
        subHeadingClass: "mt-1 text-sm text-gray-500 dark:text-gray-400",
    }

    public static slideOver = {
        panelClass: "pointer-events-auto w-screen xl:max-w-3xl md:max-w-xl max-w-lg",
        formClass: "flex h-full flex-col divide-y divide-gray-200 dark:divide-gray-700 shadow-xl bg-white dark:bg-black",
        titlebarClass: "bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6",
        headingClass: "text-lg font-medium text-gray-900 dark:text-gray-100",
        subHeadingClass: "mt-1 text-sm text-gray-500 dark:text-gray-400",
        closeButtonClass: "rounded-md bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:ring-offset-black",
    }

    public static form = {
        panelClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.panelClass : Css.slideOver.panelClass },
        formClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.formClass : Css.slideOver.formClass },
        headingClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.headingClass : Css.slideOver.headingClass },
        subHeadingClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.subHeadingClass : Css.slideOver.subHeadingClass },
        buttonsClass: "mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 sm:px-6 flex flex-wrap justify-between",
        legendClass: "text-base font-medium text-gray-900 dark:text-gray-100 text-center mb-4",
    }

    public static grid = {
        getGridClass(style:TableStyleOptions="stripedRows") { return Css.grid.gridClass },
        getGrid2Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth")
            ? "overflow-x-auto" 
            : Css.grid.grid2Class },
        getGrid3Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth")
            ? "inline-block min-w-full py-2 align-middle"
            : Css.grid.grid3Class },
        getGrid4Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"whiteBackground")
            ? ""
            : hasTableStyle(style,"fullWidth")
                ? "overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5"
                : Css.grid.grid4Class },
        getTableClass(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth") || hasTableStyle(style,"verticalLines")
            ? "min-w-full divide-y divide-gray-300"
            : Css.grid.tableClass },
        getTableHeadClass(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"whiteBackground")
            ? ""
            : Css.grid.tableHeadClass },
        getTableHeaderRowClass(style:TableStyleOptions="stripedRows") { 
            return Css.grid.tableHeaderRowClass + (hasTableStyle(style,"verticalLines") ? " divide-x divide-gray-200 dark:divide-gray-700" : "") },
        getTableHeaderCellClass(style:TableStyleOptions="stripedRows") { 
            return Css.grid.tableHeaderCellClass + (hasTableStyle(style,"uppercaseHeadings") ? " uppercase" : "") },
        getTableBodyClass(style:TableStyleOptions="stripedRows") {
            return (hasTableStyle(style,"whiteBackground") || hasTableStyle(style,"verticalLines")
                ? "divide-y divide-gray-200 dark:divide-gray-800"
                : Css.grid.tableClass)
            + (hasTableStyle(style,"verticalLines") ? " bg-white" : "") },
        getTableRowClass(style:TableStyleOptions="stripedRows", i:number, selected:boolean, allowSelection:boolean) {
            return (allowSelection ? "cursor-pointer " : "") + 
                (selected ? "bg-indigo-100 dark:bg-blue-800" : (allowSelection ? "hover:bg-yellow-50 dark:hover:bg-blue-900 " : "") + (hasTableStyle(style,"stripedRows")
                    ? (i % 2 == 0 ? "bg-white dark:bg-black" : "bg-gray-50 dark:bg-gray-800")
                    : "bg-white dark:bg-black")) + 
                 (hasTableStyle(style,"verticalLines") ? " divide-x divide-gray-200 dark:divide-gray-700" : "")
        },

        gridClass: "mt-4 flex flex-col",
        grid2Class: "-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8",
        grid3Class: "inline-block min-w-full py-2 align-middle md:px-6 lg:px-8",
        grid4Class: "overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg",
        tableClass: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
        tableHeadClass: "bg-gray-50 dark:bg-gray-900",
        tableCellClass: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
        tableHeaderRowClass: "select-none",
        tableHeaderCellClass: "px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap",
    }
}

const TypesMap:{[k:string]:string} = {
    Boolean: 'checkbox',
    DateTime: 'date',
    DateTimeOffset: 'date',
    TimeSpan: 'time',
    Byte: 'number',
    Short: 'number',
    Int64: 'number',
    Int32: 'number',
    UInt16: 'number',
    UInt32: 'number',
    UInt64: 'number',
    Single: 'number',
    Double: 'number',
    Decimal: 'number',
    String: 'text',
    Guid: 'text',
    Uri: 'text',
    DateOnly: 'date',
    TimeOnly: 'date',
}

function unwrapType(type:string) {
    return type.endsWith('?')
        ? chop(type,1)
        : type
}
function inputType(type:string) {
    return TypesMap[unwrapType(type)]
}
function propType(prop:MetadataPropertyType) {
    return prop.type === 'Nullable`1' ? prop.genericArgs![0] : prop.type
}
function propInputType(prop:MetadataPropertyType) {
    // if (prop.type.endsWith('[]') && !!TypesMap[unwrapType(leftPart(prop.type,'['))]) return 'tag'
    // if ((prop.type == 'List`1' || prop.type == 'HashSet`1') && !!TypesMap[unwrapType(prop.genericArgs?.[0] || '')]) return 'tag'
    return prop.input?.type || inputType(propType(prop))
}
export function isNumericType(type?:string|null) {
    return type && inputType(type) == 'number'
}

let scalarTypes = ['string','number','boolean','null','undefined']
function isScalar(value:any) { return scalarTypes.indexOf(typeof value) >= 0 }
export function isComplexType(value:any) { return !isScalar(value) }
function isArrayType(type:string) { return type == 'List`1' || type.startsWith('List<') || type.endsWith('[]') }

export function formatValue(value:any) {
    if (isScalar(value)) {
        value = apiValue(value)
        if (isDate(value)) {
            return Sole.config.value.formatDate!(value as Date)
        } else {
            return `${value}`
        }
    } else {
        return JSV.stringify(value)
    }
}

export function truncate(str:string, maxLength:number) {
    return !str ? '' 
        : str.length > maxLength 
            ? str.substring(0, maxLength) + '...'
            : str
}

export function createDto(name:string, obj?:any) {
    const { apiOf } = useAppMetadata()
    const op = apiOf(name)
    let AnonResponse:any = /** @class */ (function () { 
        return function (this:any, init?:any) { Object.assign(this, init) } 
    }())
    let dtoCtor:any = /** @class */ (function () {
        function AnonRequest(this:any, init?:any) { Object.assign(this, init) }
        AnonRequest.prototype.createResponse = function () { return op && op.returnsVoid ? undefined : new AnonResponse() }
        AnonRequest.prototype.getTypeName = function () { return name }
        AnonRequest.prototype.getMethod = function () { return op?.method || 'POST' }
        return AnonRequest
    }())
    return new dtoCtor(obj)
}

export function formValues(form:HTMLFormElement, props?:MetadataPropertyType[]) {
    let obj:{[k:string]:any} = {}
    Array.from(form.elements).forEach((o:Element) => {
        let el = o as HTMLInputElement
        if (!el.id || el.value == null || el.value === '') return
        const idLower = el.id.toLowerCase()
        const prop = props && props.find(x => x.name.toLowerCase() == idLower)
        let dataType = prop?.type
        let dataArg = prop?.genericArgs?.[0]
        let value:any = el.type === 'checkbox'
            ? el.checked
            : el.value
        if (isNumericType(dataType)) {
            value = Number(value)
        } else if (dataType === 'List`1' && typeof value == 'string') {
            value = value.split(',').map(x => isNumericType(dataArg)
                ? Number(x)
                : x)
        }
        obj[el.id] = value
    })
    return obj
}


export const dateInputFormat = (d:Date) => dateFmt(d).replace(/\//g,'-')

export function sanitizeForUi(dto:any) {
    if (!dto) return {}
    Object.keys(dto).forEach((key:string) => {
        let value = dto[key]
        if (typeof value == 'string') {
            if (value.startsWith('/Date'))
                dto[key] = dateInputFormat(toDate(value))
        }
    })
    return dto
}

export function useConfig() {
    const config = computed(() => Sole.config.value)
    const setConfig = (config:UiConfig) => {
        Sole.config.value = Object.assign(Sole.config.value, config)
    }
    function assetsPathResolver(src?:string) {
        //console.log('assetsPathResolver', src, Sole.config.value.assetsPathResolver, Sole.config.value.assetsPathResolver(src))
        return src && Sole.config.value.assetsPathResolver
            ? Sole.config.value.assetsPathResolver(src)
            : src
    }
    function fallbackPathResolver(src?:string) {
        return src && Sole.config.value.fallbackPathResolver
            ? Sole.config.value.fallbackPathResolver(src)
            : src
    }
    function supportsProp(prop?:MetadataPropertyType) {
        if (!prop?.type) return false
        if (prop.isValueType || prop.isEnum) return true
        if (prop.input?.type == 'file') return true
        if (prop.input?.type == 'tag') return true
     
        return inputType(prop.type) != null
    }

    function formatDate(d:Date) {
        return config.value.formatDate && config.value.formatDate(d) || dateFmt(d)
    }
    
    function formatTime(d:Date) {
        return config.value.formatTime && config.value.formatTime(d) || timeFmt12(d)
    }
    
    return { config, setConfig, supportsProp, assetsPathResolver, fallbackPathResolver, formatDate, formatTime }
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

export function useAppMetadata() {
    const metadataPath = "/metadata/app.json"

    const isValid = (metadata:AppMetadata|null|undefined) =>
        metadata?.api?.operations && metadata.api.operations.length > 0

    function setMetadata(metadata:AppMetadata|null|undefined) {
        if (metadata && isValid(metadata)) {
            Sole.metadata.value = metadata
            localStorage.setItem(metadataPath, JSON.stringify(metadata))
            return true
        }
        return false
    }

    function tryLoad() {
        if (Sole.metadata.value != null) return true
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
        return Sole.metadata.value != null
    }
    tryLoad()

    const metadataApi = computed(() => Sole.metadata.value?.api)

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
        return Sole.metadata.value as any // avoid type explosion in api.d.ts until needed
    }

    function clear(opts?:{ olderThan?:number }) {
        if (opts?.olderThan && tryLoad()) {
            let date = toDate(Sole.metadata.value?.date)
            if (date && (new Date().getTime() - date.getTime()) < opts.olderThan)
                return
        }
        Sole.metadata.value = null
        localStorage.removeItem(metadataPath)
    }

    function typeOf(name?:string|null, namespace?:string|null) {
        let api = Sole.metadata.value?.api
        if (!api || !name) return null
        let type = api.types.find(x => x.name.toLowerCase() === name.toLowerCase() && (!namespace || x.namespace == namespace))
        if (type) return type
        let requestOp = apiOf(name)
        if (requestOp) return requestOp.request
        let responseOp = api.operations.find(x => x.response && (x.response.name.toLowerCase() === name.toLowerCase() && (!namespace || x.response.namespace == namespace)))
        if (responseOp) return responseOp.response
        return null
    }

    function apiOf(name:string) {
        let api = Sole.metadata.value?.api
        if (!api) return null
        let requestOp = api.operations.find(x => x.request.name.toLowerCase() === name.toLowerCase())
        return requestOp
    }

    const typeOfRef = (ref?:{ name:string, namespace?:string }) => ref ? typeOf(ref.name, ref.namespace) : null

    function property(typeName:string, name:string) {
        let type = typeOf(typeName)
        let prop = type && type.properties && type.properties.find(x => x.name.toLowerCase() === name.toLowerCase())
        return prop
    }

    function enumOptions(name:string) {
        return enumOptionsByType(typeOf(name))
    }
    function enumOptionsByType(type?:MetadataType|null) {
        if (type && type.isEnum && type.enumNames != null) {
            let to:{[name:string]:string} = {}
            for (let i=0; i<type.enumNames.length; i++) {
                const name = (type.enumDescriptions ? type.enumDescriptions[i] : null) || type.enumNames[i]
                const key = (type.enumValues != null ? type.enumValues[i] : null) || type.enumNames[i]
                to[key] = name
            }
            return to
        }
        return null
    }

    function propertyOptions(prop:MetadataPropertyType) {
        if (!prop) return null
        let to:{[name:string]:string} = {}
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
            return to
        }
        if (prop.isEnum) {
            const enumTypeName = prop.genericArgs && prop.genericArgs.length == 1 ? prop.genericArgs[0] : prop.type
            const enumType = typeOf(enumTypeName)
            if (enumType) 
                return enumOptionsByType(enumType)
        }
        return null
    }

    function asKvps(options?:{[k:string]:string}|null) {
        if (!options) return undefined
        const to:KeyValuePair<string, string>[] = []
        Object.keys(options).forEach(key => to.push({ key, value:options[key] }))
        return to
    }

    function createInput(prop:MetadataPropertyType, input?:InputInfo) {
        const create = (name:string, type?:string) => {
            const ret:InputInfo = Object.assign({
                id:name,
                name,
                type
            }, input)
            return ret
        }
        const ret = create(prop.name, input?.type || propInputType(prop) || 'text')
        if (prop.isEnum) {
            ret.type = 'select'
            ret.allowableEntries = asKvps(propertyOptions(prop))
        }
        return ret
    }

    function createFormLayout(metaType?:MetadataType|null) {
        let formLayout:InputInfo[] = []
        if (metaType) {
            const typeProps = typeProperties(metaType)
            const op = apiOf(metaType.name)
            const dataModel = typeOfRef(op?.dataModel)
            typeProps.forEach(prop => {
                if (prop.isPrimaryKey) return //?
                const input = createInput(prop, prop.input)
                input.id = toCamelCase(input.id)
                if (input.type == 'file' && prop.uploadTo && !input.accept) {
                    const uploadLocation = Sole.metadata.value?.plugins.filesUpload?.locations.find(x => x.name == prop.uploadTo)
                    if (uploadLocation && !input.accept && uploadLocation.allowExtensions) {
                        input.accept = uploadLocation.allowExtensions.map(x => x.startsWith('.') ? x : `.${x}`).join(',')
                    }
                }
                if (dataModel) {
                    const dataModelProp = dataModel.properties?.find(x => x.name == prop.name)
                    if (!prop.ref) prop.ref = dataModelProp?.ref
                }
                formLayout.push(input)
            })
        }
        return formLayout
    }
    
    function typeProperties(type:MetadataType|null) {
        if (!type) return []
        let props:MetadataPropertyType[] = []
        let existing:{[k:string]:number} = {}
        function addProps(xs:MetadataPropertyType[]) {
            xs.forEach(p => {
                if (existing[p.name]) return
                existing[p.name] = 1
                props.push(p)
            })
        }

        while (type) {
            if (type.properties) addProps(type.properties)
            type = type.inherits ? typeOfRef(type.inherits) : null
        }
        return props.map(prop => prop.type.endsWith('[]')
            ? {...prop, type:'List`1', genericArgs:[prop.type.substring(0,prop.type.length-2)] }
            : prop)
    }

    const hasInterface = (op:MetadataOperationType,cls:string) => op.request.implements.some(i => i.name === cls)

    const Crud = {
        Create:'ICreateDb`1',
        Update:'IUpdateDb`1',
        Patch:'IPatchDb`1',
        Delete:'IDeleteDb`1',
        AnyRead: ['QueryDb`1','QueryDb`2'],
        AnyWrite: ['ICreateDb`1','IUpdateDb`1','IPatchDb`1','IDeleteDb`1'],
        isQuery: (op:MetadataOperationType) => map(op.request.inherits, x => Crud.AnyRead.indexOf(x.name) >= 0),
        isCrud: (op:MetadataOperationType) => op.request.implements?.some(x => Crud.AnyWrite.indexOf(x.name) >= 0),
        isCreate: (op:MetadataOperationType) => hasInterface(op, Crud.Create),
        isUpdate: (op:MetadataOperationType) => hasInterface(op, Crud.Update),
        isPatch: (op:MetadataOperationType) => hasInterface(op, Crud.Patch),
        isDelete: (op:MetadataOperationType) => hasInterface(op, Crud.Delete),
        model: (type?:MetadataType|null) => !type ? null : map(type.inherits, x => Crud.AnyRead.indexOf(x.name) >= 0) 
            ? type.inherits.genericArgs[0]
            : type.implements?.find(iFace => Crud.AnyWrite.indexOf(iFace.name) >= 0)?.genericArgs[0]
    }

    function getPrimaryKey(type?:MetadataType|null) {
        if (!type) return null
        return getPrimaryKeyByProps(type, typeProperties(type)) 
    }

    function getPrimaryKeyByProps(type:MetadataType, props:MetadataPropertyType[]):MetadataPropertyType|null {
        let id = props.find(x => x.name.toLowerCase() === 'id')
        if (id && id.isPrimaryKey) return id
        let pk = props.find(x => x.isPrimaryKey)
        let ret = pk || id
        if (!ret) {
            let crudType = Crud.model(type)
            if (crudType) {
                return map(typeOf(crudType), x => getPrimaryKey(x))
            }
            console.error(`Primary Key not found in ${type.name}`)
        }
        return ret || null
    }

    const getId = (type:MetadataType,row:any) => map(getPrimaryKey(type), pk => mapGet(row, pk.name))

    return { clear, load, metadataApi, typeOf, typeOfRef, apiOf, property, enumOptions, propertyOptions, createFormLayout, typeProperties, 
             Crud, getPrimaryKey, getId }
}

const web = 'png,jpg,jpeg,jfif,gif,svg,webp'.split(',')
const Ext:{[name:string]:string[]} = {
    img: 'png,jpg,jpeg,gif,svg,webp,png,jpg,jpeg,gif,bmp,tif,tiff,webp,ai,psd,ps'.split(','),
    vid: 'avi,m4v,mov,mp4,mpg,mpeg,wmv,webm'.split(','),
    aud: 'mp3,mpa,ogg,wav,wma,mid,webm'.split(','),
    ppt: 'key,odp,pps,ppt,pptx'.split(','),
    xls: 'xls,xlsm,xlsx,ods,csv,tsv'.split(','),
    doc: 'doc,docx,pdf,rtf,tex,txt,md,rst,xls,xlsm,xlsx,ods,key,odp,pps,ppt,pptx'.split(','),
    zip: 'zip,tar,gz,7z,rar,gzip,deflate,br,iso,dmg,z,lz,lz4,lzh,s7z,apl,arg,jar,war'.split(','),
    exe: 'exe,bat,sh,cmd,com,app,msi,run,vb,vbs,js,ws,wsh'.split(','),
    att: 'bin,oct,dat'.split(','), //attachment
}
const ExtKeys = Object.keys(Ext)
const S = (viewBox:string, body:string) => `<svg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' role='img' preserveAspectRatio='xMidYMid meet' viewBox='${viewBox}'>${body}</svg>`
const Icons:{[name:string]:string} = {
    img: S("4 4 16 16", "<path fill='currentColor' d='M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2zm-2 0H6v6.38l2.19-2.19l5.23 5.23l1-1a1.59 1.59 0 0 1 2.11.11L18 16V6zm-5 3.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0z'/>"),
    vid: S("0 0 24 24", "<path fill='currentColor' d='m14 2l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8m4 18V9h-5V4H6v16h12m-2-2l-2.5-1.7V18H8v-5h5.5v1.7L16 13v5Z'/>"),
    aud: S("0 0 24 24", "<path fill='currentColor' d='M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-9h-4v3.88a2.247 2.247 0 0 0-3.5 1.87c0 1.24 1.01 2.25 2.25 2.25S13 17.99 13 16.75V13h3v-2z'/>"),
    ppt: S("0 0 48 48", "<g fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='4'><path d='M4 8h40'/><path d='M8 8h32v26H8V8Z' clip-rule='evenodd'/><path d='m22 16l5 5l-5 5m-6 16l8-8l8 8'/></g>"),
    xls: S("0 0 256 256", "<path fill='currentColor' d='M200 26H72a14 14 0 0 0-14 14v26H40a14 14 0 0 0-14 14v96a14 14 0 0 0 14 14h18v26a14 14 0 0 0 14 14h128a14 14 0 0 0 14-14V40a14 14 0 0 0-14-14Zm-42 76h44v52h-44Zm44-62v50h-44V80a14 14 0 0 0-14-14h-2V38h58a2 2 0 0 1 2 2ZM70 40a2 2 0 0 1 2-2h58v28H70ZM38 176V80a2 2 0 0 1 2-2h104a2 2 0 0 1 2 2v96a2 2 0 0 1-2 2H40a2 2 0 0 1-2-2Zm32 40v-26h60v28H72a2 2 0 0 1-2-2Zm130 2h-58v-28h2a14 14 0 0 0 14-14v-10h44v50a2 2 0 0 1-2 2ZM69.2 148.4L84.5 128l-15.3-20.4a6 6 0 1 1 9.6-7.2L92 118l13.2-17.6a6 6 0 0 1 9.6 7.2L99.5 128l15.3 20.4a6 6 0 0 1-9.6 7.2L92 138l-13.2 17.6a6 6 0 1 1-9.6-7.2Z'/>"),
    doc: S("0 0 32 32", "<path fill='currentColor' d='M26 30H11a2.002 2.002 0 0 1-2-2v-6h2v6h15V6h-9V4h9a2.002 2.002 0 0 1 2 2v22a2.002 2.002 0 0 1-2 2Z'/><path fill='currentColor' d='M17 10h7v2h-7zm-1 5h8v2h-8zm-1 5h9v2h-9zm-6-1a5.005 5.005 0 0 1-5-5V3h2v11a3 3 0 0 0 6 0V5a1 1 0 0 0-2 0v10H8V5a3 3 0 0 1 6 0v9a5.005 5.005 0 0 1-5 5z'/>"),
    zip: S("0 0 16 16", "<g fill='currentColor'><path d='M6.5 7.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v.938l.4 1.599a1 1 0 0 1-.416 1.074l-.93.62a1 1 0 0 1-1.109 0l-.93-.62a1 1 0 0 1-.415-1.074l.4-1.599V7.5zm2 0h-1v.938a1 1 0 0 1-.03.243l-.4 1.598l.93.62l.93-.62l-.4-1.598a1 1 0 0 1-.03-.243V7.5z'/><path d='M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm5.5-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9v1H8v1h1v1H8v1h1v1H7.5V5h-1V4h1V3h-1V2h1V1z'/></g>"),
    exe: S("0 0 16 16", "<path fill='currentColor' fill-rule='evenodd' d='M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM2.575 15.202H.785v-1.073H2.47v-.606H.785v-1.025h1.79v-.648H0v3.999h2.575v-.647ZM6.31 11.85h-.893l-.823 1.439h-.036l-.832-1.439h-.931l1.227 1.983l-1.239 2.016h.861l.853-1.415h.035l.85 1.415h.908l-1.254-1.992L6.31 11.85Zm1.025 3.352h1.79v.647H6.548V11.85h2.576v.648h-1.79v1.025h1.684v.606H7.334v1.073Z'/>"),
    att: S("0 0 24 24", "<path fill='currentColor' d='M14 0a5 5 0 0 1 5 5v12a7 7 0 1 1-14 0V9h2v8a5 5 0 0 0 10 0V5a3 3 0 1 0-6 0v12a1 1 0 1 0 2 0V6h2v11a3 3 0 1 1-6 0V5a5 5 0 0 1 5-5Z'/>"),
}
const symbols = /[\r\n%#()<>?[\\\]^`{|}]/g
const k = 1024
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
const Exts = (() => {
    const A = 'application/', 
          O = A + 'vnd.openxmlformats-officedocument.', 
          I = 'image/', 
          T = 'text/', 
          D = 'audio/',
          V = 'video/'
    const Exts:{[ext:string]: string} = {
        jpg:  I + 'jpeg',
        tif:  I + 'tiff',
        svg:  I + 'svg+xml',
        ico:  I + 'x-icon',
        ts:   T + 'typescript',
        py:   T + 'x-python',
        sh:   T + 'x-sh',
        mp3:  D + 'mpeg3',
        mpg:  V + 'mpeg',
        ogv:  V + 'ogg',
        xlsx: O + 'spreadsheetml.sheet',
        xltx: O + 'spreadsheetml.template',
        docx: O + 'wordprocessingml.document',
        dotx: O + 'wordprocessingml.template',
        pptx: O + 'presentationml.presentation',
        potx: O + 'presentationml.template',
        ppsx: O + 'presentationml.slideshow',
        mdb:  A + 'vnd.ms-access',
    }
    function add(exts:string, type:string) {
        exts.split(',').forEach(ext => Exts[ext] = type)
    }
    function adf(exts:string, f:(a:string) => string) {
        exts.split(',').forEach(ext => Exts[ext] = f(ext))
    }
    adf('jpeg,gif,png,tiff,bmp,webp', x => I + x)
    adf('jsx,csv,css', x => T + x)
    adf('aac,ac3,aiff,m4a,m4b,m4p,mid,midi,wav', x => D + x)
    adf('3gpp,avi,dv,divx,ogg,mp4,webm', x => V + x)
    adf('rtf,pdf', x => A + x)
    add('htm,html,shtm', T + 'html')
    add('js,mjs,cjs', T + 'javascript')
    add('yml,yaml', A + 'yaml')
    add('bat,cmd', A + 'bat')
    add('xml,csproj,fsproj,vbproj', T + 'xml')
    add('txt,ps1', T + 'plain')
    add('qt,mov', V + 'quicktime')
    add('doc,dot', A + 'msword')
    add('xls,xlt,xla', A + 'excel')
    add('ppt,oit,pps,ppa', A + 'vnd.ms-powerpoint')
    add('cer,crt,der', A + 'x-x509-ca-cert')
    add('gz,tgz,zip,rar,lzh,z', A + 'x-compressed')
    add('aaf,aca,asd,bin,cab,chm,class,cur,db,dat,deploy,dll,dsp,exe,fla,ics,inf,mix,msi,mso,obj,ocx,prm,prx,psd,psp,qxd,sea,snp,so,sqlite,toc,ttf,u32,xmp,xsn,xtp', A + 'octet-stream')
    return Exts
})()
let Track:string[] = []

export function useFiles() {

    function encodeSvg(s:string) {
        s = s.replace(/"/g, `'`)
        s = s.replace(/>\s+</g, `><`)
        s = s.replace(/\s{2,}/g, ` `)
        return s.replace(symbols, encodeURIComponent)
    }
    function svgToDataUri(svg:string) {
        return "data:image/svg+xml;utf8," + encodeSvg(svg)
    }
    function objectUrl(file:Blob | MediaSource) {
        let ret = URL.createObjectURL(file)
        Track.push(ret)
        return ret
    }
    function flush() {
        Track.forEach(x => {
            try {
                URL.revokeObjectURL(x)
            } catch (e) {
                console.error('URL.revokeObjectURL', e)
            }
        })
        Track = []
    }
    function getFileName(path:string) {
        if (!path) return null
        let noQs = leftPart(path, '?')
        return lastRightPart(noQs, '/')
    }
    function getExt(path:string) {
        let fileName = getFileName(path)
        if (fileName == null || fileName.indexOf('.') === -1)
            return null
        return lastRightPart(fileName, '.').toLowerCase()
    }
    function fileImageUri(file:any|{name:string}) {
        let ext = getExt(file.name)
        if (ext && web.indexOf(ext) >= 0)
            return objectUrl(file)
        return filePathUri(file.name)
    }
    function canPreview(path:string) {
        if (!path) return false
        if (path.startsWith('blob:') || path.startsWith('data:'))
            return true
        let ext = getExt(path)
        return ext && web.indexOf(ext) >= 0;
    }
    function toAppUrl(url:string) { return url }
    function filePathUri(path?:string) {
        if (!path) return null
        let ext = getExt(path)
        if (ext == null || canPreview(path))
            return toAppUrl(path)
        return extSrc(ext) || svgToDataUri(Icons.doc)
    }
    function extSrc(ext:string) {
        return map(extSvg(ext), svg => svgToDataUri(svg))
    }
    function extSvg(ext:string) {
        if (Icons[ext])
            return Icons[ext]
        for (let i = 0; i < ExtKeys.length; i++) {
            let k = ExtKeys[i]
            if (Ext[k].indexOf(ext) >= 0)
                return Icons[k]
        }
        return null
    }
    function formatBytes(bytes:number, d = 2) {
        if (bytes === 0) return '0 Bytes'
        const dm = d < 0 ? 0 : d
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }
    function inputFiles(input:HTMLInputElement) {
        return input.files && Array.from(input.files)
            .map(f => ({ fileName: f.name, contentLength: f.size, filePath: fileImageUri(f) }))
    }
    function iconOnError(img:HTMLImageElement, fallbackSrc?:string) {
        img.onerror = null
        img.src = iconFallbackSrc(img.src, fallbackSrc)
    }
    function iconFallbackSrc(src:string, fallbackSrc?:string) {
        return extSrc(lastRightPart(src, '.').toLowerCase())
            || (fallbackSrc
                ? extSrc(fallbackSrc) || fallbackSrc
                : null)
            || extSrc('doc')
    }
    function getMimeType(fileNameOrExt:string) {
        if (!fileNameOrExt)
            throw new Error("fileNameOrExt required")
        const ext = lastRightPart(fileNameOrExt,'.').toLowerCase()
        return Exts[ext] || "application/" + ext
    }
 
    return {
        extSvg,
        extSrc,
        getExt,
        encodeSvg,
        canPreview,
        getFileName,
        formatBytes,
        filePathUri,
        svgToDataUri,
        fileImageUri,
        flush,
        inputFiles,
        iconOnError,
        iconFallbackSrc,
        getMimeType,
    }
}
