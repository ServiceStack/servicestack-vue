import type { Ref } from "vue"
import { isRef, nextTick, unref } from "vue"
import type { ParsedHtml, TransitionRules } from "@/types"
import { dateFmt, enc, omit, toDate, toTime } from "@servicestack/client"
import { assetsPathResolver, useConfig } from "./config"

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
export function focusNextElement() {
    if (typeof document == 'undefined') return
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

/** Resolve Request DTO name from a Request DTO instance */
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

export function useUtils() {
    return {
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
    }
}