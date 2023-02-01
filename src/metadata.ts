import { computed } from 'vue'
import type { AppMetadata, MetadataType, MetadataPropertyType, MetadataOperationType,InputInfo, KeyValuePair } from "./types"
import { Sole } from '@/api'
import { sanitizeForUi } from '@/utils'
import { toDate, toCamelCase, chop, dateFmt, map, mapGet } from '@servicestack/client'

function propInputType(prop:MetadataPropertyType) {
    // if (prop.type.endsWith('[]') && !!TypesMap[unwrapType(leftPart(prop.type,'['))]) return 'tag'
    // if ((prop.type == 'List`1' || prop.type == 'HashSet`1') && !!TypesMap[unwrapType(prop.genericArgs?.[0] || '')]) return 'tag'
    return prop.input?.type || inputType(propType(prop))
}

const TypesMap:{[k:string]:string} = {
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
export function isNumericType(type?:string|null) {
    return type && inputType(type) == 'number'
}

function isArrayType(type:string) { return type == 'List`1' || type.startsWith('List<') || type.endsWith('[]') }

function supportsProp(prop?:MetadataPropertyType) {
    if (!prop?.type) return false
    const type = propType(prop)
    if ((prop.isValueType && type.indexOf('`') == -1) || prop.isEnum) return true
    if (prop.input?.type == 'file') return true
    if (prop.input?.type == 'tag') return true
 
    return inputType(prop.type) != null
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

export function toFormValues(dto:any, metaType?:MetadataType|null) {
    return sanitizeForUi(dto)
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

const isBrowser = typeof window != 'undefined'

export function useAppMetadata() {
    const metadataPath = "/metadata/app.json"

    const isValid = (metadata:AppMetadata|null|undefined) =>
        metadata?.api?.operations && metadata.api.operations.length > 0

    function setMetadata(metadata:AppMetadata|null|undefined) {
        if (metadata && isValid(metadata)) {
            Sole.metadata.value = metadata
            if (typeof localStorage != 'undefined') localStorage.setItem(metadataPath, JSON.stringify(metadata))
            return true
        }
        return false
    }

    function tryLoad() {
        if (Sole.metadata.value != null) return true
        let metadata:AppMetadata|null = (globalThis as any).Server
        if (!isValid(metadata)) {
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
        if (typeof localStorage != 'undefined') localStorage.removeItem(metadataPath)
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
    
    function typeProperties(type?:MetadataType|null) {
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

    const hasInterface = (op:MetadataOperationType,cls:string) => op.request.implements?.some(i => i.name === cls)

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
            ? type.inherits?.genericArgs[0]
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
            supportsProp, Crud, getPrimaryKey, getId, createDto, toFormValues, formValues }
}
