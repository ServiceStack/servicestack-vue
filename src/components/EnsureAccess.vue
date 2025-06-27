<template>
<div v-if="invalidAccess">
    <Alert :class="alertClass" v-html="invalidAccess" />
    <div class="md:p-4">
        <SecondaryButton v-if="!isAuthenticated" @click="signIn">Sign In</SecondaryButton>
        <SecondaryButton v-else @click="signOut">Sign Out</SecondaryButton>
    </div>
</div>
</template>
<script setup lang="ts">
import type { EnsureAccessProps, EnsureAccessEmits } from '@/components/types'
import { useAuth } from '@/use/auth'
import { useConfig } from '@/use/config'
import { appendQueryString } from "@servicestack/client"

defineProps<EnsureAccessProps>()
defineEmits<EnsureAccessEmits>()

const { isAuthenticated } = useAuth()
const { config } = useConfig()

const signIn = () => {
    let redirect = location.href.substring(location.origin.length) || '/'
    const loginUrl = appendQueryString(config.value.redirectSignIn!, { redirect })
    config.value.navigate!(loginUrl)
}
const signOut = () => {
    let ReturnUrl = location.href.substring(location.origin.length) || '/'
    const logoutUrl = appendQueryString(config.value.redirectSignOut!, { ReturnUrl })
    config.value.navigate!(logoutUrl)
}
</script>