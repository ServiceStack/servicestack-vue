import type { Ref } from "vue"
import { isRef, nextTick, unref } from "vue"
import type { ApiRequest, IReturn, TransitionRules } from "@/types"
import { ApiResult, appendQueryString, dateFmt, enc, JsonServiceClient, nameOf, omit, setQueryString, toTime } from "@servicestack/client"
import { assetsPathResolver } from "./config"
import { Sole } from "./config"

/** Format Date into required input[type=date] format */
export function dateInputFormat(d:Date) { return dateFmt(d).replace(/\//g,'-') }

/** Format TimeSpan or Date into required input[type=time] format */
export function timeInputFormat(s?:string|number|Date|null) { return s == null ? '' : toTime(s) }

/** Double set reactive Ref<T> to force triggering updates */
export function setRef($ref:Ref<any>, value:any) {
    $ref.value = null
    nextTick(() => $ref.value = value)
}
  
/** Returns a dto with all Refs unwrapped */
export function unRefs(o:any) {
    Object.keys(o).forEach(k => {
        const val = o[k]
        o[k] = isRef(val) ? unref(val) : val
    })
    return o
}

/** Update reactive `transition` class based on Tailwind animation transition rule-set */
export function transition(rule:TransitionRules, transition:Ref<string>, show:boolean) {
    if (show) {
        transition.value = rule.entering.cls + ' ' + rule.entering.from
        setTimeout(() => transition.value = rule.entering.cls + ' ' + rule.entering.to, 0)
    } else {
        transition.value = rule.leaving.cls + ' ' + rule.leaving.from
        setTimeout(() => transition.value = rule.leaving.cls + ' ' + rule.leaving.to, 0)
    }
}

/** Set focus to the next element inside a HTML Form */
export function focusNextElement(opt?:{ after?:HTMLInputElement }) {
    if (typeof document == 'undefined') return
    let elActive = opt?.after || document.activeElement as HTMLInputElement
    let form = elActive && elActive.form
    if (form) {
        let sel = ':not([disabled]):not([tabindex="-1"])'
        let els = form.querySelectorAll(`a:not([disabled]), button${sel}, input[type=text]${sel}, [tabindex]${sel}`)
        let focusable = Array.prototype.filter.call(els,
            el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === elActive);
        let index = focusable.indexOf(elActive);
        if (index > -1) {
            let elNext = focusable[index + 1] || focusable[0];
            elNext.focus();
        }
    }
}

/** Resolve Request DTO name from a Request DTO instance */
export function getTypeName(type?:string|InstanceType<any>|Function) {
    if (!type) return null
    if (typeof type == 'string')
        return type
    const dto = typeof type == 'function' 
        ? new type() 
        : typeof type == 'object' 
            ? type
            : null
    if (!dto) 
        throw new Error(`Invalid DTO Type '${typeof type}'`)
    if (typeof dto['getTypeName'] != 'function') 
        throw new Error(`${JSON.stringify(dto)} is not a Request DTO`)
    const ret = dto.getTypeName() as string
    if (!ret) 
        throw new Error('DTO Required')
    return ret
}

/** HTML Tag builder */
export function htmlTag(tag:string,child?:string,attrs?:any) {
    if (!attrs) attrs = {}
    let cls = attrs.cls || attrs.className || attrs['class']
    if (cls) {
        attrs = omit(attrs,['cls','class','className'])
        attrs['class'] = cls
    }
    return child == null
        ? `<${tag}` + htmlAttrs(attrs) + `/>`
        : `<${tag}` + htmlAttrs(attrs) + `>${child||''}</${tag}>`
}

/** Convert object dictionary into encoded HTML attributes */
export function htmlAttrs(attrs:any) {
    return Object.keys(attrs).reduce((acc,k) => `${acc} ${k}="${enc(attrs[k])}"`, '')
}

/** Convert HTML Anchor attributes into encoded HTML attributes */
export function linkAttrs(attrs:{href:string,cls?:string,target?:string,rel?:string}) {
    return Object.assign({target:'_blank',rel:'noopener','class':'text-blue-600'},attrs)
}

/** Resolve Absolute URL from relative path */
export function toAppUrl(url:string) {
    return assetsPathResolver(url)
}

let scalarTypes = ['string','number','boolean','null','undefined']

/** Check if value is a scalar type */
export function isPrimitive(value:any) { return scalarTypes.indexOf(typeof value) >= 0 || value instanceof Date }

/** Check if value is a non-scalar type */
export function isComplexType(value:any) { return !isPrimitive(value) }

/** SSR safe wrapper around localStorage */
export class LocalStore implements Storage {
    get length() { return typeof localStorage == "undefined" ? 0 : localStorage.length }
    getItem(key:string) {
        if (typeof localStorage == "undefined") return null
        return localStorage.getItem(key)
    }
    setItem(key:string, value:string) {
        if (typeof localStorage == "undefined") return
        localStorage.setItem(key, value)
    }
    removeItem(key:string) {
        if (typeof localStorage == "undefined") return
        localStorage.removeItem(key)
    }
    clear() {
        if (typeof localStorage == "undefined") return
        localStorage.clear()
    }
    key(index: number) {
        if (typeof localStorage == "undefined") return null
        return localStorage.key(index)
    }
}
export function parseJson(json?:string|null) {
    return typeof json == 'string' ? JSON.parse(json) : null
}

export function pushState(args:Record<string,any>) {
    if (typeof history != 'undefined') {
        const url = setQueryString(location.href, args)
        history.pushState({}, '', url)
    }
}

export function scopedExpr(src:string, ctx:Record<string,any>) {
    const invalidTokens = ['function','Function','eval','=>',';']
    if (invalidTokens.some(x => src.includes(x))) {
        throw new Error(`Unsafe script: '${src}'`)
    }

    const scope = Object.assign(Object.keys(globalThis).reduce((acc,k) => { 
        acc[k] = undefined; return acc 
        }, {} as Record<string,any>)
        , ctx)
    return (new Function( "with(this) { return (" + src + ") }")).call(scope)
}

export function copyText(text:string) {
    if (typeof navigator != 'undefined') navigator.clipboard.writeText(text)
}

export function fromCache(key:string) {
    const json = Sole.config.storage!.getItem(key)
    const ret = json
        ? JSON.parse(json)
        : null
    return ret
}
export function swrCacheKey<TResponse>(request:IReturn<TResponse> | ApiRequest, args?: any) {
    const key = appendQueryString(`swr.${nameOf(request)}`, !args ? request : Object.assign({}, request, args))
    return key
}
export function swrClear<TResponse>(options:{ request:IReturn<TResponse> | ApiRequest, args?: any }) {
    if (options.request) {
        const key = swrCacheKey(options.request, options.args)
        Sole.config.storage!.removeItem(key)
    }
}
export async function swrApi<TResponse>(client:JsonServiceClient, request:IReturn<TResponse> | ApiRequest, fn:(r:ApiResult<TResponse>) => void, args?: any, method?: string) {
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

export function asStrings(o?:string|string[]|null) { return typeof o == 'string' ? o.split(',') : o || [] }
export function asOptions(all:string[],exclude?:null|string|string[]) {
    const exc = asStrings(exclude)
    return all.reduce((acc:{[k:string]:boolean},x:string) => { acc[x]=!exc.includes(x); return acc }, {})
}

export function useUtils() {
    return {
        LocalStore,
        dateInputFormat,
        timeInputFormat,
        setRef,
        unRefs,
        transition,
        focusNextElement,
        getTypeName,
        htmlTag,
        htmlAttrs,
        linkAttrs,
        toAppUrl,
        isPrimitive,
        isComplexType,
        pushState,
        scopedExpr,
        copyText,
        fromCache,
        swrCacheKey,
        swrClear,
        swrApi,
        asStrings,
        asOptions,
    }
}