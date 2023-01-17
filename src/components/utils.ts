import type { Ref } from "vue"
import type { TransitionRules } from "../types"

export function transition(rule:TransitionRules, transition:Ref<string>, show:boolean) {
    if (show) {
        transition.value = rule.entering.cls + ' ' + rule.entering.from
        setTimeout(() => transition.value = rule.entering.cls + ' ' + rule.entering.to, 0)
    } else {
        transition.value = rule.leaving.cls + ' ' + rule.leaving.from
        setTimeout(() => transition.value = rule.leaving.cls + ' ' + rule.leaving.to, 0)
    }
}
