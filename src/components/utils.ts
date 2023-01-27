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
