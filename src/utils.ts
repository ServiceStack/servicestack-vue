import type { Ref } from "vue"
import { isRef, nextTick, unref } from "vue"
import type { ParsedHtml, TransitionRules } from "./types"
import { dateFmt, enc, omit, toDate, leftPart, toTime } from "@servicestack/client"
import { useConfig } from "./config"

export const dateInputFormat = (d:Date) => dateFmt(d).replace(/\//g,'-')

export const timeInputFormat = (s?:string|number|Date|null) => s == null ? '' : toTime(s)

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

/** Returns a dto with all Refs unwrapped */
export function unRefs(o:any) {
    Object.keys(o).forEach(k => {
        const val = o[k]
        o[k] = isRef(val) ? unref(val) : val
    })
    return o
}

export function transition(rule:TransitionRules, transition:Ref<string>, show:boolean) {
    if (show) {
        transition.value = rule.entering.cls + ' ' + rule.entering.from
        setTimeout(() => transition.value = rule.entering.cls + ' ' + rule.entering.to, 0)
    } else {
        transition.value = rule.leaving.cls + ' ' + rule.leaving.from
        setTimeout(() => transition.value = rule.leaving.cls + ' ' + rule.leaving.to, 0)
    }
}

const CACHE:{[k:string]:ParsedHtml} = {}

export function parseHtml(html:string) {
    let existing = CACHE[html]
    if (existing) return existing
    const elAttrs: {[k:string]:string|null} = {}
    const outer = document.createElement('div')
    outer.innerHTML = html
    const el = outer.firstElementChild
    el!.getAttributeNames().forEach(name => {
        const val = el!.getAttribute(name)
        elAttrs[name] = val
    })
    return CACHE[html] = {
        tagName: el!.tagName,
        innerHTML: el!.innerHTML,
        attrs: elAttrs,
    }
}

export function focusNextElement() {
    let elActive = document.activeElement as HTMLInputElement
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

export function getTypeName(dto:any) {
    if (!dto) throw new Error('DTO Required')
    if (typeof dto['getTypeName'] != 'function') throw new Error(`${dto} is not a Request DTO`)
    const ret = dto.getTypeName()
    if (!ret) throw new Error('DTO Required')
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

export function htmlAttrs(attrs:any) {
    return Object.keys(attrs).reduce((acc,k) => `${acc} ${k}="${enc(attrs[k])}"`, '')
}

export function linkAttrs(attrs:{href:string,cls?:string,target?:string,rel?:string}) {
    return Object.assign({target:'_blank',rel:'noopener','class':'text-blue-600'},attrs)
}

export function toAppUrl(url:string) {
    let { assetsPathResolver } = useConfig()
    return assetsPathResolver(url)
}

let scalarTypes = ['string','number','boolean','null','undefined']
export function isPrimitive(value:any) { return scalarTypes.indexOf(typeof value) >= 0 || value instanceof Date }
export function isComplexType(value:any) { return !isPrimitive(value) }

export function setRef($ref:Ref<any>, value:any) {
  $ref.value = null
  nextTick(() => $ref.value = value)
}

export function useUtils() {
    return {
        dateInputFormat,
        timeInputFormat,
        sanitizeForUi,
        setRef,
        unRefs,
        transition,
        parseHtml,
        focusNextElement,
        getTypeName,
        htmlTag,
        htmlAttrs,
        linkAttrs,
        toAppUrl,
        isPrimitive,
        isComplexType,
    }
}