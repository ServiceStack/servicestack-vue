<template>
  <ModalDialog size-class="w-96" @done="$emit('done')">
    <div class="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div class="mt-3 text-center sm:mt-0 sm:mx-4 sm:text-left">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">{{ title ?? 'API Key' }}</h3>
        
        <div class="pb-4">
          <form @submit.prevent="submit">
            <div class="space-y-6 pt-6 pb-5">
              <TextInput id="apikey" type="password" autocomplete="new-password" v-model="apikey" label="" />
            </div>
            <div>
              <PrimaryButton class="w-full">Save</PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import ModalDialog from './ModalDialog.vue'
import TextInput from './TextInput.vue'
import PrimaryButton from './PrimaryButton.vue'
import { useApiKey } from '../use/config'
import type { ApiKeyDialogProps, ApiKeyDialogEmits } from './types'

const props = defineProps<ApiKeyDialogProps>()
const emit = defineEmits<ApiKeyDialogEmits>()

const store = inject<any>('store', null)
const client = props.client ?? inject<any>('client', null)
const apiKey = useApiKey()
const apikey = ref(store?.apikey ?? apiKey.value ?? client?.bearerToken ?? '')

function submit() {
  if (store) store.apikey = apikey.value
  if (client) client.bearerToken = apikey.value
  apiKey.value = apikey.value
  emit('save', apikey.value)
  emit('done')
}
</script>
