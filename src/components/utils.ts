import type { Ref } from "vue"
import type { TransitionRules } from "../types"
import { enc } from "@servicestack/client"

export function transition(rule:TransitionRules, transition:Ref<string>, show:boolean) {
    if (show) {
        transition.value = rule.entering.cls + ' ' + rule.entering.from
        setTimeout(() => transition.value = rule.entering.cls + ' ' + rule.entering.to, 0)
    } else {
        transition.value = rule.leaving.cls + ' ' + rule.leaving.from
        setTimeout(() => transition.value = rule.leaving.cls + ' ' + rule.leaving.to, 0)
    }
}

interface ParsedHtml {
    tag: string
    outerHTML: string
    innerHTML: string
    attrs: {[k:string]:any}
}

const CACHE:{[k:string]:ParsedHtml} = {}

export function parseHtml(html:string, attrs?:any) {
    let existing = CACHE[html]
    if (existing) return existing
    const elAttrs: {[k:string]:string} = Object.assign({},attrs)
    const outer = document.createElement('div')
    outer.innerHTML = html
    const el = outer.firstElementChild
    el!.getAttributeNames().forEach(name => {
        const val = el!.getAttribute(name)
        if (val) elAttrs[name] = val
    })
    return CACHE[html] = {
        tag: el!.tagName,
        outerHTML: el!.outerHTML,
        innerHTML: el!.innerHTML,
        attrs: elAttrs,
    }
}
