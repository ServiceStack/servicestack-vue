<template>
<SlideOver v-if="!isAuthenticated" :title="title" @done="$emit('done')" content-class="relative flex-1">
    <template v-if="subtitle" #subtitle>{{ subtitle }}</template>
    <Alert><slot></slot></Alert>
    <div class="md:p-4">
        <SecondaryButton @click="signIn">Sign In</SecondaryButton>
    </div>
</SlideOver>
</template>
<script setup lang="ts">
import { useAuth } from '@/use/auth'
import { useConfig } from '@/use/config'
import { appendQueryString } from "@servicestack/client"

defineProps<{
    title?: string
    subtitle?: string    
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
</script>