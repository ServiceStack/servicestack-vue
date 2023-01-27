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
    tagName: string
    attrs: {[k:string]:string|null}
    innerHTML: string
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
