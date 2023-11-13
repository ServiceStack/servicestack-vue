import type { AuthenticateResponse, MetadataOperationType } from "@/types"
import { computed } from "vue"
import { Sole } from "./config"
import { sanitize } from "@servicestack/client"

function toAuth(auth?:AuthenticateResponse) {
    return auth && (auth as any).SessionId
        ? sanitize(auth)
        : auth
}

/** Sign In the currently Authenticated User */
function signIn(user:AuthenticateResponse) {
    Sole.user.value = toAuth(user)!
    Sole.events.publish('signIn', user)
}

/** Sign Out currently Authenticated User */
function signOut() {
    Sole.user.value = null
    Sole.events.publish('signOut', null)
}

/** @returns {string[]} */
const getRoles = (user:any) => user?.roles || []
/** @returns {string[]} */
const getPermissions = (user:any) => user?.permissions || []

/** Check if the Authenticated User has a specific role */
function hasRole(role:string) {
    return getRoles(Sole.user.value).indexOf(role) >= 0
}

/** Check if the Authenticated User has a specific permission */
function hasPermission(permission:string) {
    return getPermissions(Sole.user.value).indexOf(permission) >= 0
}

/** Check if the Authenticated User has the Admin role */
function isAdmin() {
    return hasRole('Admin')
}

/** Check if Auth Session has access to API */
export function canAccess(op?:MetadataOperationType|null) {
    if (!op) return false
    if (!op.requiresAuth)
        return true
    const auth = Sole.user.value
    if (!auth)
        return false
    if (isAdmin())
        return true
    let [roles, permissions] = [getRoles(auth), getPermissions(auth)]
    let [requiredRoles, requiredPermissions, requiresAnyRole, requiresAnyPermission] = [
        op.requiredRoles || [], op.requiredPermissions || [], op.requiresAnyRole || [], op.requiresAnyPermission || []]
    if (!requiredRoles.every(role => roles.indexOf(role) >= 0))
        return false
    if (requiresAnyRole.length > 0 && !requiresAnyRole.some(role => roles.indexOf(role) >= 0))
        return false
    if (!requiredPermissions.every(perm => permissions.indexOf(perm) >= 0))
        return false
    if (requiresAnyPermission.length > 0 && !requiresAnyPermission.every(perm => permissions.indexOf(perm) >= 0))
        return false
    return true
}

/** Return error message if Authenticated User cannot access API */
export function invalidAccessMessage(op:MetadataOperationType) {
    if (!op || !op.requiresAuth) return null
    const auth = Sole.user.value
    if (!auth) {
        return `<b>${op.request.name}</b> requires Authentication`
    }
    if (isAdmin())
        return null;
        let [roles, permissions] = [getRoles(auth), getPermissions(auth)]
        let [requiredRoles, requiredPermissions, requiresAnyRole, requiresAnyPermission] = [
        op.requiredRoles || [], op.requiredPermissions || [], op.requiresAnyRole || [], op.requiresAnyPermission || []]
    let missingRoles = requiredRoles.filter(x => roles.indexOf(x) < 0)
    if (missingRoles.length > 0)
        return `Requires ${missingRoles.map(x => '<b>' + x + '</b>').join(', ')} Role` + (missingRoles.length > 1 ? 's' : '')
    let missingPerms = requiredPermissions.filter(x => permissions.indexOf(x) < 0)
    if (missingPerms.length > 0)
        return `Requires ${missingPerms.map(x => '<b>' + x + '</b>').join(', ')} Permission` + (missingPerms.length > 1 ? 's' : '')
    if (requiresAnyRole.length > 0 && !requiresAnyRole.some(role => roles.indexOf(role) >= 0))
        return `Requires any ${requiresAnyRole.filter(x => roles.indexOf(x) < 0)
            .map(x => '<b>' + x + '</b>').join(', ')} Role` + (missingRoles.length > 1 ? 's' : '')
   if (requiresAnyPermission.length > 0 && !requiresAnyPermission.every(perm => permissions.indexOf(perm) >= 0))
        return `Requires any ${requiresAnyPermission.filter(x => permissions.indexOf(x) < 0)
            .map(x => '<b>' + x + '</b>').join(', ')} Permission` + (missingPerms.length > 1 ? 's' : '')
    return null
}

export function useAuth() {
    /** Access the currently Authenticated User info in a reactive Ref<AuthenticateResponse> */
    const user = computed(() => Sole.user.value || null)
    
    /** Check if the current user is Authenticated in a reactive Ref<boolean> */
    const isAuthenticated = computed(() => Sole.user.value != null)

    return { signIn, signOut, user, toAuth, isAuthenticated, hasRole, hasPermission, isAdmin, canAccess, invalidAccessMessage }
}
