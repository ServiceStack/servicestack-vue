import type { FormatInfo, ApiFormat } from './types'
import { fromXsdDuration, indexOfAny, isDate, toDate, dateFmt, enc, lastRightPart, apiValue, timeFmt12, appendQueryString, omit } from "@servicestack/client"
import { useFiles } from './files'
import { toAppUrl, htmlTag, linkAttrs, isPrimitive, dateInputFormat } from './utils'

// Calc TZOffset: (defaultFormats.assumeUtc ? new Date().getTimezoneOffset() * 1000 * 60 : 0)
let nowMs = () => new Date().getTime()

let DateChars = ['/','T',':','-']

let defaultFormats:ApiFormat & { maxFieldLength?: number, maxNestedFields?: number, maxNestedFieldLength?: number } = {
    //locale: null,
    assumeUtc: true,
    //number: null,
    date: {
        method: "Intl.DateTimeFormat",
        options: "{dateStyle:'medium'}"
    },
    maxFieldLength: 150,
    maxNestedFields: 150,
    maxNestedFieldLength: 150,
}

let Formatters:{[k:string]:Function} = {}
if (!('iconOnError' in globalThis)) (globalThis as any).iconOnError = iconOnError

export function setDefaultFormats(newFormat:ApiFormat) {
    defaultFormats = Object.assign({}, defaultFormats, newFormat)
}
export function setFormatters(formatters:{[name:string]:Function}) {
    Object.keys(formatters || {}).forEach(name => {
        if (typeof formatters[name] == 'function') {
            Formatters[name] = formatters[name]
        }
    })
}

export function currency(val:number) {
    return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(val)
}
export function bytes(val:number) {
    let { formatBytes } = useFiles()
    return formatBytes(val)
}
export function link(href:string, opt?:{cls?:string,target?:string,rel?:string}) {
    return htmlTag('a', href, linkAttrs({ ...opt, href }))
}
export function linkTel(tel:string, opt?:{cls?:string,target?:string,rel?:string}) {
    return htmlTag('a', tel, linkAttrs({...opt, href:`tel:${tel}` }))
}
export function linkMailTo(email:string, opt?:{subject?:string,body?:string,cls?:string,target?:string,rel?:string}) {
    if (!opt) opt = {}
    let { subject, body } = opt
    let attrs = omit(opt, ['subject','body'])
    let args:{[k:string]:string} = {}
    if (subject) args.subject = subject
    if (body) args.body = body
    return htmlTag('a', email, linkAttrs({...attrs, href:`mailto:${appendQueryString(email,args)}` }))
}

export function icon(url:string) {
    return `<img class="w-6 h-6" title="${url}" src="${toAppUrl(url)}" onerror="iconOnError(this)">`
}
function iconRounded(url:string) {
    return `<img class="w-8 h-8 rounded-full" title="${url}" src="${toAppUrl(url)}" onerror="iconOnError(this)">`
}
export function attachment(url:string) {
    let { getFileName, getExt, canPreview } = useFiles()
    let fileName = getFileName(url)
    let ext = getExt(fileName)
    let imgSrc = ext == null || canPreview(url)
        ? toAppUrl(url)
        : iconFallbackSrc(url)
    return `<a class="flex" href="${toAppUrl(url)}" title="${url}" target="_blank"><img class="w-6 h-6" src="${imgSrc}" onerror="iconOnError(this,'att')"><span class="pl-1">${fileName}</span></a>`
}
export function hidden(o:any) { return '' }

export function iconOnError(img:HTMLImageElement,fallbackSrc?:string) {
    img.onerror = null
    img.src = iconFallbackSrc(img.src,fallbackSrc)
}
export function iconFallbackSrc(src:string, fallbackSrc?:string) {
    let { extSrc } = useFiles()
    return extSrc(lastRightPart(src,'.').toLowerCase())
        || (fallbackSrc
            ? extSrc(fallbackSrc) || fallbackSrc
            : null)
        || extSrc('doc')
}

export function time(o:any) {
    let date = typeof o == 'string'
        ? new Date(fromXsdDuration(o) * 1000)
        : isDate(o)
            ? toDate(o)
            : null
    return date ? timeFmt12(date) : o
}

setFormatters({
    currency,
    bytes,
    link,
    linkTel,
    linkMailTo,
    icon,
    iconRounded,
    attachment,
    hidden,
    time,
    relativeTime,
    relativeTimeFromMs,
})

function formatDate(d:Date) {
    let f = defaultFormats.date && d instanceof Date
        ? formatter(defaultFormats.date)
    : null
    return typeof f == 'function' ? f(d) : dateFmt(d)
}
function formatNumber(n:number) {
    if (typeof n != 'number') return n
    let f = defaultFormats.number
        ? formatter(defaultFormats.number)
        : null
    const ret = typeof f == 'function' ? f(n) : `${n}`
    if (ret === '') {
        console.warn(`formatNumber(${n}) => ${ret}`, f)
        return `${n}`
    }
    return ret
}

export function apiValueFmt(o:any, format?:FormatInfo|null) {
    let ret = apiValue(o)
    let fn = format ? formatter(format) : null
    if (typeof fn == 'function') return fn(o)
    let fmt = (ret != null
        ? isDate(ret)
            ? formatDate(ret)
            : typeof ret == 'number' 
                ? formatNumber(ret)
                : ret
        : null)
    return fmt == null ? '' : fmt
}

export function formatValue(value:any, format?:FormatInfo|null) {
    return isPrimitive(value) 
        ? apiValueFmt(value, format)
        : formatObject(value, format)
}

export function truncate(str:string, maxLength:number) {
    return !str ? '' 
        : str.length > maxLength 
            ? str.substring(0, maxLength) + '...'
            : str
}

export function toRelativeNumber(val:string|Date|number) {
    if (val == null) return NaN
    if (typeof val == 'number')
        return val
    if (isDate(val))
        return (val as Date).getTime() - nowMs()
    if (typeof val === 'string') {
        let num = Number(val)
        if (!isNaN(num))
            return num
        if (val[0] === 'P' || val.startsWith('-P'))
            return fromXsdDuration(val) * 1000 * -1
        if (indexOfAny(val, DateChars) >= 0)
            return toDate(val).getTime() - nowMs()
    }
    return NaN
}

let defaultRtf = new Intl.RelativeTimeFormat(defaultFormats.locale, {})
let year =  24 * 60 * 60 * 1000 * 365
let units:{[k:string|Intl.RelativeTimeFormatUnit]:number} = {
    year,
    month : year/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}
export function relativeTimeFromMs(elapsedMs:number,rtf?:Intl.RelativeTimeFormat) {
    for (let u in units) {
        if (Math.abs(elapsedMs) > units[u] || u === 'second')
            return (rtf || defaultRtf).format(Math.round(elapsedMs/units[u]), u as Intl.RelativeTimeFormatUnit)
    }
}
export function relativeTime(val:string|Date|number,rtf?:Intl.RelativeTimeFormat) {
    let num = toRelativeNumber(val)
    if (!isNaN(num))
        return relativeTimeFromMs(num,rtf)
    console.error(`Cannot convert ${val}:${typeof val} to relativeTime`)
    return ''
}
let relativeTimeFromDate = (d:Date,from:Date) => 
    relativeTimeFromMs(d.getTime()-(from ? from.getTime() : nowMs()))

export function formatter(format:FormatInfo) {
    if (!format) return null
    let { method, options } = format
    let key = `${method}(${options})`
    let f = Formatters[key]
    if (typeof f == 'function') return f
    let loc = format.locale || defaultFormats.locale
    if (method.startsWith('Intl.')) {
        let locStr = loc ? `'${loc}'` : 'undefined'
        let intlExpr = `return new ${method}(${locStr},${options||'undefined'})`
        try {
            let intlFn = Function(intlExpr)()
            f = method === 'Intl.DateTimeFormat'
                ? (val:string|Date) => intlFn.format(toDate(val))
                : method === 'Intl.NumberFormat'
                    ? (val:string|number) => intlFn.format(Number(val))
                    : method === 'Intl.RelativeTimeFormat'
                        ? (val:string|Date|number) => relativeTime(val,intlFn)
                        : (val:any) => intlFn.format(val)
            return Formatters[key] = f
        } catch(e) {
            console.error(`Invalid format: ${intlExpr}`,e)
        }
    } else {
        let fmt = (globalThis as any)[method]
        if (typeof fmt == 'function') {
            let opt = options != null
                ? Function("return " + options)()
                : undefined
            f = (val:string) => fmt(val,opt,loc)
            return Formatters[key] = f
        }
        console.error(`No '${method}' function exists`)
    }
    return null
}

function trunc(s:string, len:number) { return s.length > len ? s.substring(0,len) + '...' : s }

function scrubStr(s:string) {
    return s.substring(0, 6) === '/Date('
        ? formatDate(toDate(s))
        : s
}
function displayObj(val:any) {
    return indentJson(scrub(val)).replace(/"/g,'')
}

export function indentJson(o:any) {
    if (o == null) return ''
    if (typeof o == 'string') o
    if (typeof o == 'object' && '__type' in o) delete o['__type']
    if (o.ResponseStatus) delete o.ResponseStatus['__type']
    if (o.responseStatus) delete o.responseStatus['__type']
    return JSON.stringify(o, undefined, 4) 
}

function scrub(o:any):any {
    if (o == null) return null
    if (typeof o == 'string') return scrubStr(o)
    if (isPrimitive(o)) return o
    if (o instanceof Date) return formatDate(o)
    if (Array.isArray(o)) return o.map(scrub)
    if (typeof o == 'object') {
        let to:{[k:string]:any} = {}
        Object.keys(o).forEach(k => {
            to[k] = scrub(o[k])
        })
        return to
    }
    return o
}

export function formatObject(val:any, format?:FormatInfo|null) {
    let obj = val
    if (Array.isArray(val)) {
        if (isPrimitive(val[0])) {
            return obj.join(',')
        }
        if (val[0] != null) obj = val[0]
    }
    if (obj == null) return ''
    if (obj instanceof Date) return formatDate(obj)
    
    let keys = Object.keys(obj)
    let sb = []
    for (let i=0; i<Math.min(defaultFormats.maxNestedFields!,keys.length); i++) {
        let k = keys[i]
        let val = `${scrub(obj[k])}`
        sb.push(`<b class="font-medium">${k}</b>: ${enc(trunc(scrubStr(val),defaultFormats.maxNestedFieldLength!))}`)
    }
    if (keys.length > 2) sb.push('...')
    return '<span title="' + enc(displayObj(val)) + '">{ ' + sb.join(', ') + ' }</span>'
}

export function useFormatters() {
    return {
        Formatters,
        setDefaultFormats,
        setFormatters,
        formatValue,
        formatter,
        dateInputFormat,
        currency,
        bytes,
        link,
        linkTel,
        linkMailTo,
        icon,
        iconRounded,
        attachment,
        hidden,
        time,
        relativeTime,
        relativeTimeFromMs,
        formatDate,
        formatNumber,
    }
}
