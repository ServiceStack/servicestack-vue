import type { AuthenticateResponse } from "./types"
import { computed } from "vue"
import { Sole } from "./config"

/** Sign In the currently Authenticated User */
function signIn(user:AuthenticateResponse) {
    Sole.user.value = user
}

/** Sign Out currently Authenticated User */
function signOut() {
    Sole.user.value = null
}

/** Check if the Authenticated User has a specific role */
function hasRole(role:string) {
    return (Sole.user.value?.roles || []).indexOf(role) >= 0
}

/** Check if the Authenticated User has a specific permission */
function hasPermission(permission:string) {
    return (Sole.user.value?.permissions || []).indexOf(permission) >= 0
}

/** Check if the Authenticated User has the Admin role */
function isAdmin() {
    return hasRole('Admin')
}

export function useAuth() {
    /** Access the currently Authenticated User info in a reactive Ref<AuthenticateResponse> */
    const user = computed(() => Sole.user.value || null)
    
    /** Check if the current user is Authenticated in a reactive Ref<boolean> */
    const isAuthenticated = computed(() => Sole.user.value != null)

    return { signIn, signOut, user, isAuthenticated, hasRole, hasPermission, isAdmin }
}
