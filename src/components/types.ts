import type { ResponseStatus } from "@servicestack/client"
import type { Ref } from "vue"

export type ApiState = {
    loading: Ref<boolean>,
    error: Ref<ResponseStatus|undefined>
}
