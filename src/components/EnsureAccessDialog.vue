<template>
<SlideOver v-if="!isAuthenticated" :title="title" SubHeading=@SubHeading Done="Done" content-class="relative flex-1">
    <Alert><slot></slot></Alert>
    <div class="md:p-4">
        <button type="button" @click="signIn"
            class="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Sign In
        </button>
    </div>
</SlideOver>
</template>
<script setup lang="ts">
import { useAuth, useConfig } from '@/api'
import { appendQueryString } from "@servicestack/client"

defineProps<{
    title?: string
    subHeading?: string    
}>()

const { isAuthenticated } = useAuth()
const { config } = useConfig()

const signIn = () => {
    let redirect = location.href.substring(location.origin.length) || '/'
    const loginUrl = appendQueryString(config.value.redirectSignIn, { redirect })
    location.href = loginUrl
}
</script>