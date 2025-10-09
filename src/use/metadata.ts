import { type AppMetadata, type MetadataType, type MetadataPropertyType, type MetadataOperationType, type InputInfo, type KeyValuePair, type MetadataTypes, type AutoQueryConvention, type Filter, type RefInfo, type InputProp, type AppInfo, type MetadataTypeName, type AutoQueryApis, MetadataApp } from "@/types"
import type { JsonServiceClient } from '@servicestack/client'
import { toDate, toCamelCase, chop, map, mapGet, toDateTime, leftPart } from '@servicestack/client'
import { computed, inject } from 'vue'
import { Sole } from './config'
import { dateInputFormat, scopedExpr } from './utils'

const metadataPath = "/metadata/app.json"

/** Mapping of C# Types to HTML Input types */
export const TypesMap:{[k:string]:string} = {
    Boolean: 'checkbox',
    DateTime: 'date',
    DateOnly: 'date',
    DateTimeOffset: 'date',
    TimeSpan: 'time',
    TimeOnly: 'time',
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
}
export const InputTypesMap:{[k:string]:string} = {
    number: 'Int32',
    checkbox: 'Boolean',
    date: 'DateTime',
    'datetime-local': 'DateTime',
    time: 'TimeSpan',
}

const NumTypesMap = {
    Byte: 'byte',
    Int16: 'short',
    Int32: 'int',
    Int64: 'long',
    UInt16: 'ushort',
    Unt32: 'uint',
    UInt64: 'ulong',
    Single: 'float',
    Double: 'double',
    Decimal: 'decimal',
}
const NumTypes = [ ...Object.keys(NumTypesMap), ...Object.values(NumTypesMap) ]
const Aliases:{[k:string]:string} = {
    String: 'string',
    Boolean: 'bool',
    ...NumTypesMap,
}
/** Return underlying Type if nullable */
function alias(type:string) {
    return Aliases[type] || type
}
/** @param {string} name
 * @param {string[]} genericArgs
 * @return {string}
 */
function typeName2(name:string, genericArgs?: string[]) {
    if (!name) return ''
    if (!genericArgs)
        genericArgs = []
    if (name === 'Nullable`1')
        return alias(genericArgs[0]!) + '?'
    if (name.endsWith('[]'))
        return `List<${alias(name.substring(0,name.length-2))}>`
            if (genericArgs.length === 0)
        return alias(name)
    return leftPart(alias(name), '`') + '<' + genericArgs.join(',') + '>'
}

function typeName(metaType?:MetadataTypeName) { 
    return metaType && typeName2(metaType.name, metaType.genericArgs) 
}


/** Capture AutoQuery APIs */
export class Apis implements AutoQueryApis
{
    Query?: MetadataOperationType;
    QueryInto?: MetadataOperationType;
    Create?: MetadataOperationType;
    Update?: MetadataOperationType;
    Patch?: MetadataOperationType;
    Delete?: MetadataOperationType;

    get AnyQuery() { return this.Query || this.QueryInto }
    get AnyUpdate() { return this.Patch || this.Update }
    get dataModel() { return this.AnyQuery?.dataModel }
    
    toArray() {
        let to = [this.Query, this.QueryInto, this.Create, this.Update, this.Patch, this.Delete]
        return to.filter(x => !!x).map(x => x!)
    }

    get empty() { 
        return !this.Query && !this.QueryInto && !this.Create && !this.Update && !this.Patch && !this.Delete
    }

    add(op:MetadataOperationType) {
        if (Crud.isQueryInto(op) && !this.QueryInto) {
            this.QueryInto = op
        } else if (Crud.isQuery(op) && !this.Query) {
            this.Query = op
        } else if (Crud.isCreate(op) && !this.Create) {
            this.Create = op
        } else if (Crud.isUpdate(op) && !this.Update) {
            this.Update = op
        } else if (Crud.isPatch(op) && !this.Patch) {
            this.Patch = op
        } else if (Crud.isDelete(op) && !this.Delete) {
            this.Delete = op
        }
    }

    static from(ops:MetadataOperationType[]) {
        const apis = new Apis()
        ops.forEach(op => {
            apis.add(op)
        })
        return apis
    }

    static forType(type?:string|null, metaTypes?:MetadataTypes|null) {
        let apis = new Apis()
        if (Sole.config.apisResolver && type) {
            const aqApis = Sole.config.apisResolver(type,metaTypes)
            if (aqApis) {
                apis.Query = aqApis.Query
                apis.QueryInto = aqApis.QueryInto
                apis.Create = aqApis.Create
                apis.Update = aqApis.Update
                apis.Patch = aqApis.Patch
                apis.Delete = aqApis.Delete
            }
        }
        if (type) {
            metaTypes ??= Sole.metadata.value?.api
            metaTypes?.operations.forEach(op => {
                if (op.dataModel?.name == type) {
                    apis.add(op)
                }
            })
        }
        return apis
    }
}

/** Query metadata information about AutoQuery CRUD Types */
export const Crud = {
    Create:'ICreateDb`1',
    Update:'IUpdateDb`1',
    Patch:'IPatchDb`1',
    Delete:'IDeleteDb`1',
    AnyRead: ['QueryDb`1','QueryDb`2'],
    AnyWrite: ['ICreateDb`1','IUpdateDb`1','IPatchDb`1','IDeleteDb`1'],
    isAnyQuery: (op:MetadataOperationType) => map(op.request.inherits, x => Crud.AnyRead.indexOf(x.name) >= 0),
    isQuery: (op:MetadataOperationType) => map(op.request.inherits, x => x.name === 'QueryDb`1'),
    isQueryInto: (op:MetadataOperationType) => map(op.request.inherits, x => x.name === 'QueryDb`2'),
    isCrud: (op:MetadataOperationType) => op.request.implements?.some(x => Crud.AnyWrite.indexOf(x.name) >= 0),
    isCreate: (op:MetadataOperationType) => hasInterface(op, Crud.Create),
    isUpdate: (op:MetadataOperationType) => hasInterface(op, Crud.Update),
    isPatch: (op:MetadataOperationType) => hasInterface(op, Crud.Patch),
    isDelete: (op:MetadataOperationType) => hasInterface(op, Crud.Delete),
    model: (type?:MetadataType|null) => !type ? null : map(type.inherits, x => Crud.AnyRead.indexOf(x.name) >= 0) 
        ? type.inherits?.genericArgs[0]
        : type.implements?.find(iFace => Crud.AnyWrite.indexOf(iFace.name) >= 0)?.genericArgs[0],    
}


/** Resolve HTML Input type to use for {MetadataPropertyType}  */
export function propInputType(prop:MetadataPropertyType) {
    return prop.input?.type || inputType(propType(prop)!)
}

export function unwrapType(type:string) {
    return type.endsWith('?')
        ? chop(type,1)
        : type
}

/** Resolve HTML Input type to use for C# Type name */
export function inputType(type:string) {
    return TypesMap[unwrapType(type)]
}
export function typeForInput(inputType:string) {
    return inputType && InputTypesMap[inputType] || 'String'
}

function propType(prop:MetadataPropertyType) {
    return prop.type === 'Nullable`1' ? prop.genericArgs![0] : prop.type
}
/** Check if C# Type name is numeric */
export function isNumericType(type?:string|null) {
    return type && inputType(type) == 'number' || false
}

export function isString(type?:string|null) {
    return type && type.toLowerCase() == 'string' || false
}

/** Check if C# Type is an Array or List */
export function isArrayType(type:string) { return type == 'List`1' || type.startsWith('List<') || type.endsWith('[]') }

export function isComplexProp(prop?:MetadataPropertyType) {
    if (!prop?.type) return false
    const type = propType(prop)!
    if ((prop.isValueType && type.indexOf('`') == -1) || prop.isEnum) return false
    return inputType(prop.type) == null
}

/** Check if a supported HTML Input exists for {MetadataPropertyType} */
export function supportsProp(prop?:MetadataPropertyType) {
    if (!prop?.type) return false
    const type = propType(prop)!
    if ((prop.isValueType && type.indexOf('`') == -1) || prop.isEnum) return true
    const propInputType = prop.input?.type
    if (propInputType) {
        if (propInputType == 'hidden') return true
        if (propInputType == 'file') return true
        if (propInputType == 'tag') return true
        if (propInputType == 'combobox') return true
        if (Sole.components?.[propInputType]) return true
    }
 
    return inputType(prop.type) != null
}

/** Create a Request DTO instance for Request DTO name or MetadataOperationType */
export function createDto(requestDto:string|MetadataOperationType, obj?:any) {
    let op = typeof requestDto == 'string' ? apiOf(requestDto) : requestDto
    if (!op) {
        console.warn(`Metadata not found for: ${requestDto}`)
        op = { request: { name:requestDto } } as MetadataOperationType
    }
    let AnonResponse:any = /** @class */ (function () { 
        return function (this:any, init?:any) { Object.assign(this, init) } 
    }())
    let dtoCtor:any = /** @class */ (function () {
        function AnonRequest(this:any, init?:any) { Object.assign(this, init) }
        AnonRequest.prototype.createResponse = function () { return op!.returnsVoid ? undefined : new AnonResponse() }
        AnonRequest.prototype.getTypeName = function () { return op!.request.name }
        AnonRequest.prototype.getMethod = function () { return op!.method || 'POST' }
        return AnonRequest
    }())
    return new dtoCtor(obj)
}

/** Create a Request DTO instance for Request DTO name */
export function makeDto(requestDto:string, obj?:any, ctx:{ createResponse?:() => any, method?:string } = {}) {
    let AnonResponse:any = /** @class */ (function () { 
        return function (this:any, init?:any) { Object.assign(this, init) } 
    }())
    let dtoCtor:any = /** @class */ (function () {
        function AnonRequest(this:any, init?:any) { Object.assign(this, init) }
        AnonRequest.prototype.createResponse = function () { return typeof ctx.createResponse == 'function' ? ctx.createResponse() : new AnonResponse() }
        AnonRequest.prototype.getTypeName = function () { return requestDto }
        AnonRequest.prototype.getMethod = function () { return ctx.method || 'POST' }
        return AnonRequest
    }())
    return new dtoCtor(obj)
}

/** Mutates Request DTO values to supported HTML Input values */
export function toFormValues(dto:any, metaType?:MetadataType|null) {
    if (!dto) return {}
    Object.keys(dto).forEach((key:string) => {
        let value = dto[key]
        if (typeof value == 'string') {
            if (value.startsWith('/Date'))
                dto[key] = dateInputFormat(toDate(value))
        } else if (value != null && typeof value == 'object') {
            // shallow clone
            if (Array.isArray(value)) {
                dto[key] = Array.from(value)
            } else {
                dto[key] = Object.assign({}, value)
            }
        }
    })
    return dto
}

/** Convert HTML Input values to supported DTO values */
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

/** Check if AppMetadata is valid */
export function isValid(metadata:AppMetadata|null|undefined) {
    return metadata?.api?.operations && metadata.api.operations.length > 0
}

/** Get get AppMetadata instance */
export function getMetadata(opt?:{assert?:boolean}):any { // use 'any' to avoid type explosion    
    if (!tryLoad() && opt?.assert && !Sole.metadata.value)
        throw new Error('useMetadata() not configured, see: https://docs.servicestack.net/vue/use-metadata')
        
    return Sole.metadata.value
}

/** Explicitly set AppMetadata and save to localStorage */
export function setMetadata(metadata:AppMetadata|null|undefined) {
    if (metadata && isValid(metadata)) {
        metadata.date = toDateTime(new Date())
        Sole.metadata.value = metadata
        if (typeof localStorage != 'undefined') localStorage.setItem(metadataPath, JSON.stringify(metadata))
        return true
    }
    return false
}

/** Delete AppMetadata and remove from localStorage */
export function clearMetadata() {
    Sole.metadata.value = null
    if (typeof localStorage != 'undefined') localStorage.removeItem(metadataPath)
}

export function tryLoad() {
    if (Sole.metadata.value != null) return true
    let metadata:AppMetadata|null = (globalThis as any).Server
    if (isValid(metadata)) {
        setMetadata(metadata)
    } else {
        const json = typeof localStorage != 'undefined' ? localStorage.getItem(metadataPath) : null
        if (json) {
            try {
                setMetadata(JSON.parse(json) as AppMetadata)
            } catch(e) {
                console.error(`Could not JSON.parse ${metadataPath} from localStorage`)
            }
        }
    }
    return Sole.metadata.value != null
}

export async function downloadMetadata(metadataPath:string, resolve?:() => Promise<Response>) {
    let r = resolve
        ? await resolve()
        : await fetch(metadataPath)
    if (r.ok) {
        let json = await r.text()
        setMetadata(JSON.parse(json) as AppMetadata)
    } else {
        console.error(`Could not download ${resolve ? 'AppMetadata' : metadataPath}: ${r.statusText}`)
    }
    if (!isValid(Sole.metadata.value)) {
        console.warn('AppMetadata is not available')
    }
}

/** Load {AppMetadata} if needed 
 * @param olderThan   - Reload metadata if age exceeds ms
 * @param resolvePath - Override `/metadata/app.json` path use to fetch metadata
 * @param resolve     - Use a custom fetch to resolve AppMetadata
*/
async function loadMetadata(args:{ 
    olderThan?:number, 
    resolvePath?: string,
    resolve?:() => Promise<Response> 
}) {
    const { olderThan, resolvePath, resolve } = args || {}
    let hasMetadata = tryLoad() && olderThan !== 0
    if (hasMetadata && olderThan) {
        let date = toDate(Sole.metadata.value?.date)
        if (!date || (new Date().getTime() - date.getTime()) > olderThan) {
            hasMetadata = false
        }
    }
    if (!hasMetadata) {
        // If provided user-defined paths
        if (resolvePath || resolve) {
            await downloadMetadata(resolvePath || metadataPath, resolve)
            if (Sole.metadata.value != null) return
        }

        // If has registered API client
        const client = inject<JsonServiceClient>('client')
        if (client != null) {
            const api = await client.api(new MetadataApp())
            if (api.succeeded) {
                setMetadata(api.response)
            }
        }
        if (Sole.metadata.value != null) return

        // Default to /metadata/app.json
        await downloadMetadata(metadataPath)
    }
    return Sole.metadata.value as any // avoid type explosion in api.d.ts until needed
}

/**
 * Resolve {MetadataType} for DTO name
 * @param name        - Find MetadataType by name
 * @param [namespace] - Find MetadataType by name and namespace 
 */
export function typeOf(name?:string|null, namespace?:string|null) {
    if (Sole.config.typeResolver) {
        let type = Sole.config.typeResolver(name!,namespace)
        if (type) return type
    }
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

/** Resolve Request DTO {MetadataOperationType} by name */
export function apiOf(name:string) {
    if (Sole.config.apiResolver) {
        const op = Sole.config.apiResolver(name)
        if (op) return op
    }
    let api = Sole.metadata.value?.api
    if (!api) return null
    let requestOp = api.operations.find(x => x.request.name.toLowerCase() === name.toLowerCase())
    return requestOp
}

/** Filter Apis by different filtering conditions */
export function findApis({ dataModel }: { dataModel?:string|MetadataType }) {
    const api = Sole.metadata.value?.api
    if (!api) return []
    let apis = api.operations
    if (dataModel) {
        const dataModelType = typeof dataModel == 'string' ? typeOf(dataModel) : dataModel
        apis = apis.filter(x => typeEquals(x.dataModel, dataModelType))
    }
    return apis
}

/** Resolve {MetadataType} by {MetadataTypeName} */
export function typeOfRef(ref?:{ name:string, namespace?:string }) {
    return ref ? typeOf(ref.name, ref.namespace) : null
}

/** Metadata Types refer to same type */
export function typeEquals(a?:MetadataType|MetadataTypeName|null,b?:MetadataType|MetadataTypeName|null) {
    return (a && b) && a.name === b.name && ((!a.namespace || !b.namespace) || a.namespace === b.namespace)
}

/** Resolve {MetadataPropertyType} by Type and Property name */
export function property(typeName:string, name:string) {
    let type = typeOf(typeName)
    let prop = type && type.properties && type.properties.find(x => x.name.toLowerCase() === name.toLowerCase())
    return prop
}

/** Resolve Enum entries for Enum Type by name */
export function enumOptions(name:string) {
    return enumOptionsByType(typeOf(name))
}

/** Resolve Enum entries for Enum Type by MetadataType */
export function enumOptionsByType(type?:MetadataType|null) {
    if (type && type.isEnum && type.enumNames != null) {
        let to:{[name:string]:string} = {}
        for (let i=0; i<type.enumNames.length; i++) {
            const name = (type.enumDescriptions ? type.enumDescriptions[i] : null) || type.enumNames[i]
            const key = (type.enumValues != null ? type.enumValues[i] : null) || type.enumNames[i]!
            to[key] = name!
        }
        return to
    }
    return null
}

/** Resolve allowable entries for property by {MetadataPropertyType} */
export function propertyOptions(prop:MetadataPropertyType) {
    if (!prop) return null
    let to:{[name:string]:string} = {}
    let allowableEntries = prop.input && prop.input.allowableEntries
    if (allowableEntries) {
        for (let i=0; i<allowableEntries.length; i++) {
            let x = allowableEntries[i]!
            to[x.key] = x.value
        }
        return to
    }
    let allowableValues = prop.allowableValues || (prop.input ? prop.input.allowableValues : null)
    if (allowableValues) {
        for (let i=0; i<allowableValues.length; i++) {
            let value = allowableValues[i]!
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

/** Convert string dictionary to [{ key:string, value:string }] */
export function asKvps(options?:{[k:string]:string}|null) {
    if (!options) return undefined
    const to:KeyValuePair<string, string>[] = []
    Object.keys(options).forEach(key => to.push({ key, value:options[key]! }))
    return to
}

/** Create InputInfo from MetadataPropertyType and custom InputInfo */
export function createInput(prop:MetadataPropertyType, input?:InputInfo) {
    const create = (name:string, type?:string) => {
        const ret:InputInfo = Object.assign({
            id:name,
            name,
            type,
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

/** Create Form Layout's {InputProp[]} from {MetadataType} */
export function createFormLayout(metaType?:MetadataType|null) {
    let formLayout:InputProp[] = []
    if (metaType) {
        const typeProps = typeProperties(metaType)
        const op = apiOf(metaType.name)
        const dataModel = typeOfRef(op?.dataModel)
        typeProps.forEach(prop => {
            if (!supportsProp(prop)) return
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
            
            if (input.options) {
                try {
                    const scope = {
                        input,
                        $typeFields: typeProps.map(x => x.name),
                        $dataModelFields: dataModel ? typeProperties(dataModel).map(x => x.name) : [],
                        ...Sole.config.scopeWhitelist,
                    }
                    const options = scopedExpr(input.options, scope)
                    Object.keys(options).forEach(k => {
                        (input as any)[k] = options[k]
                    })
                } catch(e) {
                    console.error(`failed to evaluate '${input.options}'`)
                }
            }
            formLayout.push(input)
        })
    }
    return formLayout
}

export function expandEnumFlags(value:number, options:any) {
    if (!options.type) {
        console.error(`enumDescriptions missing {type:'EnumType'} options`)
        return [`${value}`]
    }
    const enumType = typeOf(options.type)
    if (!enumType?.enumValues) {
        console.error(`Could not find metadata for ${options.type}`)
        return [`${value}`]
    }
    
    const to = []
    for (let i=0; i<enumType.enumValues.length; i++) {
        const enumValue = parseInt(enumType.enumValues[i]!)
        if (enumValue > 0 && (enumValue & value) === enumValue) {
            to.push(enumType.enumDescriptions?.[i] || enumType.enumNames?.[i] || `${value}`)
        }
    }
    return to
}

export function enumFlagsConverter(type:string) {
    return (x:number|any) => typeof x == 'number' 
        ? expandEnumFlags(x,{type})
        : x
}

/** Return all properties (inc. inherited) for {MetadataType} */
export function typeProperties(type?:MetadataType|null) {
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

/** Check if MetadataOperationType implements interface by name */
export function hasInterface(op:MetadataOperationType,cls:string) {
    return op.request.implements?.some(i => i.name === cls) || false
}

/** Resolve PrimaryKey {MetadataPropertyType} for {MetadataType} */
export function getPrimaryKey(type?:MetadataType|null) {
    if (!type) return null
    return getPrimaryKeyByProps(type, typeProperties(type)) 
}

export function getPrimaryKeyByProps(type:MetadataType, props:MetadataPropertyType[]):MetadataPropertyType|null {
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

/** Resolve Primary Key value from {MetadataType} and row instance  */
export function getId(type:MetadataType,row:any) {
    return map(getPrimaryKey(type), pk => mapGet(row, pk.name))
}

export function filterRuleValue(rule:AutoQueryConvention, type:string, filter:Filter) {
    return rule && rule.valueType === 'none'
        ? ''
        : filter.key === '%In' || filter.key === '%Between'
            ? `(${filter.value})`
            : formatFilterValue(type, filter.value)
}
export function formatFilterValue(type:string, value:string) {
    if (!type) return value
    type = unwrapType(type)
    return isNumericType(type) || type === 'Boolean'
        ? value
        : isArrayType(type)
            ? `[${value}]`
            : `'${value}'`
}

function nv(name:string,value:string) { return { name, value } }

const defaultViewerConventions:AutoQueryConvention[] = [
    nv("=","%"),
    nv("!=","%!"),
    nv(">=",">%"),
    nv(">","%>"),
    nv("<=","%<"),
    nv("<","<%"),
    nv("In","%In"),
    nv("Between","%Between"),
    { name: "Starts With", value: "%StartsWith", types: "string" },
    { name: "Contains", value: "%Contains", types: "string" },
    { name: "Ends With", value: "%EndsWith", types: "string" },
    { name: "Exists", value: "%IsNotNull", valueType: "none" },
    { name: "Not Exists", value: "%IsNull", valueType: "none" },
]

export function useMetadata() {

    /** Reactive accessor to Ref<MetadataTypes> */
    const metadataApp = computed<AppInfo|null>(() => Sole.metadata.value?.app || null)
    const metadataApi = computed<MetadataTypes|null>(() => Sole.metadata.value?.api || null)
    const filterDefinitions = computed<AutoQueryConvention[]>(() => Sole.metadata.value?.plugins?.autoQuery?.viewerConventions || defaultViewerConventions)

    tryLoad()

    return { 
        loadMetadata,
        getMetadata,
        setMetadata, 
        clearMetadata, 
        metadataApp,
        metadataApi,
        filterDefinitions,
        typeOf, 
        typeOfRef, 
        typeEquals,
        apiOf, 
        findApis,
        typeName,
        typeName2,
        property, 
        enumOptions, 
        propertyOptions, 
        createFormLayout, 
        typeProperties, 
        supportsProp,
        Crud,
        Apis,
        getPrimaryKey, 
        getPrimaryKeyByProps,
        getId, 
        createDto, 
        makeDto,
        toFormValues, 
        formValues,
        isComplexProp,
        asKvps,
        expandEnumFlags,
        enumFlagsConverter,
    }
}


export class LookupValues {

    static Lookup:{[k:string]:{[k:string]:{[k:string]:string}}} = {}

    static async getOrFetchValue(client:JsonServiceClient, metadataApi:MetadataTypes, model:string, id:string, label:string, isComputed:boolean, idValue:string) {
        const value = LookupValues.getValue(model, idValue, label)
        if (value != null)
            return value

        await LookupValues.fetchLookupIds(client, metadataApi, model, id, label, isComputed, [idValue]);
        return LookupValues.getValue(model, idValue, label)
    }

    static getValue(model:string, id:string, label:string) {
        const modelLookup = LookupValues.Lookup[model]
        if (modelLookup) {
            const idLookup = modelLookup[id]
            if (idLookup) {
                label = label.toLowerCase()
                const value = idLookup[label]
                return value
            }
        }
    }

    static setValue(model:string, id:string, label:string, value:string) {
        const modelLookup = LookupValues.Lookup[model]
            ?? (LookupValues.Lookup[model] = {})
        const idLookup = modelLookup[id]
            ?? (modelLookup[id] = {})
            label = label.toLowerCase()
            idLookup[label] = value
        //console.debug(`LookupValues.setValue(${model},${id},${label}) = ${value}`)
    }

    static setRefValue(refInfo:RefInfo, refModel:any) {
        const id = mapGet(refModel, refInfo.refId)
        if (id == null || refInfo.refLabel == null)
            return null
        const value = mapGet(refModel, refInfo.refLabel)
        LookupValues.setValue(refInfo.model, id, refInfo.refLabel, value)
        return value
    }

    static async fetchLookupIds(client:JsonServiceClient, metadataApi:MetadataTypes, refModel:string, refId:string, refLabel:string, isComputed:boolean, lookupIds:string[]) {
        const lookupOp = metadataApi.operations.find(op => Crud.isAnyQuery(op) && op.dataModel?.name == refModel)
        if (lookupOp) {
            const modelLookup = LookupValues.Lookup[refModel]
                ?? (LookupValues.Lookup[refModel] = {})
            const existingIds:string[] = []
            Object.keys(modelLookup).forEach(key => {
                const value = modelLookup[key]
                if (mapGet(value, refLabel)) {
                    existingIds.push(key)
                }
            })

            const newIds = lookupIds.filter(x => !existingIds.includes(x))
            if (newIds.length == 0)
                return
            
            const fields = !isComputed
                ? `${refId},${refLabel}`
                : null
            const queryArgs = {
                [refId + 'In']: newIds.join(','),
            }
            if (fields)
                queryArgs.fields = fields
            
            const requestDto = createDto(lookupOp, queryArgs)
        
            const api = await client.api(requestDto, { jsconfig: 'edv,eccn' })
            if (api.succeeded) {
                const lookupResults:any[] = mapGet(api.response as any,'results') || []

                lookupResults.forEach(result => {
                    if (!mapGet(result, refId)) {
                        console.error(`result[${refId}] == null`, result)
                        return
                    }
                    const id = `${mapGet(result, refId)}`
                    const val = mapGet(result, refLabel)
                    refLabel = refLabel.toLowerCase()
                    
                    const modelLookupLabels = modelLookup[id]
                        ?? (modelLookup[id] = {})
                    modelLookupLabels[refLabel] = `${val}`

                    //console.debug(`setFetch(${refModel},${id},${refLabel}) = ${modelLookupLabels[refLabel]}`)
                })
            } else {
                console.error(`Failed to call ${lookupOp.request.name}`)
                return
            }
        }
    }

}
