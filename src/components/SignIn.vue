<template>
<div v-if="!plugin">No Auth Plugin</div>
<div v-else class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-50">
            {{ title }}
        </h2>
        <p v-if="Object.keys(authProviderFormTabs).length > 1" class="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            <span class="relative z-0 inline-flex shadow-sm rounded-md">
                <a v-for="(tab,name) in authProviderFormTabs" v-href="{ provider:tab }" @click="selectedProvider = tab"
                    :class="[tab === '' || tab === (lastFormLayout as any).name ? 'rounded-l-md' : tab === (lastFormLayout as any).name ? 'rounded-r-md -ml-px' : '-ml-px', 
                            selectedProvider === tab ? 'z-10 outline-none ring-1 ring-indigo-500 border-indigo-500' : '', 'cursor-pointer relative inline-flex items-center px-4 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900']">
                {{name}}
                </a>
            </span>
        </p>
    </div>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ErrorSummary v-if="errorSummary" class="mb-3" :errorSummary="errorSummary" />
        <div class="bg-white dark:bg-black py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form v-if="formLayout.length" @submit.prevent="submit">
                <AutoFormFields :modelValue="modelValue" :formLayout="formLayout" :api="api" :hideSummary="true"
                                divide-class="" space-class="space-y-6" />
                <div class="mt-8">
                    <PrimaryButton class="w-full">Sign In</PrimaryButton>
                </div>
            </form>

            <div v-if="oauthProviders.length" class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500 dark:text-gray-400">
                            Or continue with
                        </span>
                    </div>
                </div>
                <div class="mt-6 grid grid-cols-3 gap-3">
                    <div v-for="provider in oauthProviders">
                        <a :href="baseUrl + provider.navItem.href + '?continue=' + baseUri" :title="getLabel(provider)" 
                            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-black text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900">
                            <Icon v-if="provider.icon" :image="provider.icon" class="h-5 w-5 text-gray-700 dark:text-gray-200" />
                            <svg v-else class="h-5 w-5 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path d="M16 8a5 5 0 1 0 5 5a5 5 0 0 0-5-5z" fill="currentColor"/>
                                <path d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2zm7.992 22.926A5.002 5.002 0 0 0 19 20h-6a5.002 5.002 0 0 0-4.992 4.926a12 12 0 1 1 15.985 0z" fill="currentColor"/>
                            </svg>
                        </a>
                    </div>                    
                </div>
            </div>
            
        </div>
    </div>
</div> 
</template>

<script setup lang="ts">
import type { JsonServiceClient } from '@servicestack/client'
import type { AppMetadata, AuthenticateResponse, InputInfo, MetaAuthProvider } from '@/types'
import type { SignInProps, SignInEmits } from '@/components/types'
import { computed, inject, onMounted, ref } from 'vue'
import { ApiResult, each, toPascalCase } from '@servicestack/client'
import { useAuth } from '@/use/auth'
import { useClient } from '@/use/client'
import { useMetadata } from '@/use/metadata'

const props = withDefaults(defineProps<SignInProps>(), {
    title: "Sign In",
    tabs: true,
    oauth: true,
})

const emit = defineEmits<SignInEmits>()

const { getMetadata, createDto } = useMetadata()
const client = useClient()
const serviceClient = inject<JsonServiceClient>('client')!
const { signIn } = useAuth()

const server = getMetadata({assert:true}) as AppMetadata

const plugin = server.plugins.auth

const baseUri = document.baseURI
const baseUrl = server.app.baseUrl

const modelValue = ref(createDto("Authenticate"))
const api = ref(new ApiResult())
const selectedProvider = ref(props.provider)

onMounted(() => {
    plugin?.authProviders.map(x => x.formLayout).filter(x => x)
        .forEach(formLayout => formLayout.forEach(input => 
            modelValue.value[input.id] = input.type === 'checkbox' 
                ? false 
                : ''
        ))
})

const formLayouts = computed(() => plugin?.authProviders.filter(x => x.formLayout) || [])
const firstFormLayout = computed(() => formLayouts.value[0] || {})
const lastFormLayout = computed(() => formLayouts.value[Math.max(formLayouts.value.length - 1,0)] || {})
const authProvider = computed(() => (selectedProvider.value
    ? plugin?.authProviders.find(x => x.name === selectedProvider.value)
    : null) ?? firstFormLayout.value)

const isFalse = (v?:boolean|"false") => v === false || v === "false" 
function getLabel(provider:MetaAuthProvider) {
    return provider.label || (provider.navItem && provider.navItem.label)
}
const formLayout = computed(() => ((authProvider.value as any)?.formLayout || []).map((input:InputInfo) =>
    Object.assign({}, input, {
        type:input.type?.toLowerCase(),
        autocomplete:input.autocomplete || (input.type?.toLowerCase() === 'password' ? 'current-password' : undefined)
            || (input.id.toLowerCase() === 'username' ? 'username' : undefined),
        css:Object.assign({ field:'col-span-12' }, input.css) })))

const oauthProviders = computed(() => isFalse(props.oauth) ? [] : plugin?.authProviders.filter(x => x.type === 'oauth') || [])
const authProviderFormTabs = computed(() => {
    let ret = each(plugin?.authProviders.filter(x => x.formLayout && x.formLayout.length > 0),
        (acc,x) => {
            let label = getLabel(x) || toPascalCase(x.name)
            acc[label] = x.name === (firstFormLayout.value as any).name ? '' : x.name
        })
    const auth = authProvider.value as any
    if (auth && isFalse(props.tabs)) {
        ret = { [getLabel(auth) || toPascalCase(auth.name)]: auth }
    }
    return ret
})

const errorSummary = computed(() => {
    let except = formLayout.value.map((input:InputInfo) => input.id).filter((x:string) => x)
    return api.value.summaryMessage(except)
})

async function submit() {
    modelValue.value.provider = (authProvider.value as any).name
    if ((authProvider.value as any).name === 'authsecret') {
        serviceClient.headers.set("authsecret", modelValue.value.authsecret)
        modelValue.value = createDto("Authenticate")
    } else if ((authProvider.value as any).name === 'basic') {
        serviceClient.setCredentials(modelValue.value.UserName, modelValue.value.Password)
        modelValue.value = createDto("Authenticate")
        modelValue.value.UserName = null
        modelValue.value.Password = null
    } else if ((authProvider.value as any).type === 'Bearer' || (authProvider.value as any).name === 'jwt') {
        serviceClient.bearerToken = modelValue.value.BearerToken
        modelValue.value = createDto("Authenticate")
    }
    api.value = await client.api(modelValue.value)
    if (api.value.succeeded) {
        const response = api.value.response as AuthenticateResponse
        signIn(response)
        emit('login', response)
        api.value = new ApiResult()
        modelValue.value = createDto("Authenticate")
    }
}
</script>
