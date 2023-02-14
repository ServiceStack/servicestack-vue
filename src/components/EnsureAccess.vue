<template>
<div v-if="invalidAccess">
    <Alert v-html="invalidAccess" />
    <div class="md:p-4">
        <SecondaryButton v-if="!isAuthenticated" @click="signIn">Sign In</SecondaryButton>
        <SecondaryButton v-else @click="signOut">Sign Out</SecondaryButton>
    </div>
</div>
</template>
<script setup lang="ts">
import { useAuth } from '@/use/auth'
import { useConfig } from '@/use/config'
import { appendQueryString } from "@servicestack/client"

defineProps<{
    invalidAccess?: string
}>()
defineEmits<{
    (e:'done'): void
}>()

const { isAuthenticated } = useAuth()
const { config } = useConfig()

const signIn = () => {
    let redirect = location.href.substring(location.origin.length) || '/'
    const loginUrl = appendQueryString(config.value.redirectSignIn!, { redirect })
    location.href = loginUrl
}
const signOut = () => {
    let ReturnUrl = location.href.substring(location.origin.length) || '/'
    const logoutUrl = appendQueryString(config.value.redirectSignOut!, { ReturnUrl })
    location.href = logoutUrl
}
</script>