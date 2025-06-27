<template>
<ModalDialog :id="id" @done="done" size-class="w-full sm:max-w-prose">
    <div class="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="">
            <div class="mt-3 text-center sm:mt-0 sm:mx-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Query Preferences</h3>

                <div class="mt-4">
                    <label :for="`${id}-take`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Results per page</label>
                    <select :id="`${id}-take`" v-model="prefs.take" 
                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-black border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option v-for="take in allTakes.filter(x => props.maxLimit == null || x <= props.maxLimit)" :value="take" :selected="take === prefs.take">{{take}}</option>
                    </select>
                </div>
                
                <div class="mt-4 flex items-center py-4 border-b border-gray-200 dark:border-gray-800">
                    <input type="radio" :id="`${id}-allColumns`" @click="prefs.selectedColumns=[]" :checked="prefs.selectedColumns!.length===0"
                        class="focus:ring-indigo-500 h-4 w-4 bg-white dark:bg-black text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-700">
                    <label class="ml-3 block text-gray-700 dark:text-gray-300" :for="`${id}-allColumns`">View all columns</label>
                </div>

                <div class="mt-4">
                    <div class="pb-2 px-4">
                        <div class="">
                            <div v-for="c in columns" :key="c.name" class="flex items-center">
                                <input type="checkbox" :id="c.name" :value="c.name" v-model="prefs.selectedColumns" 
                                    class="h-4 w-4 bg-white dark:bg-black border-gray-300 dark:border-gray-700 rounded text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500">
                                <label :for="c.name" class="ml-3">{{c.name}}</label>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <PrimaryButton @click="save" color="red" class="ml-2">
            Save
        </PrimaryButton>
        <SecondaryButton @click="done">
            Cancel
        </SecondaryButton>
    </div>
</ModalDialog>
</template>

<script setup lang="ts">
import type { ApiPrefs } from '@/types'
import type { QueryPrefsProps, QueryPrefsEmits } from '@/components/types'
import { useConfig } from '@/use/config'
import { ref, watchEffect } from 'vue'

const { autoQueryGridDefaults } = useConfig()

const props = withDefaults(defineProps<QueryPrefsProps>(), {
    id: 'QueryPrefs'
})

const emit = defineEmits<QueryPrefsEmits>()

const prefs = ref<ApiPrefs>({})

watchEffect(() => prefs.value = Object.assign({ 
    take: autoQueryGridDefaults.value.take,
    selectedColumns:[] 
}, props.prefs))

const allTakes = [10, 25, 50, 100, 250, 500, 1000]

function done() {
    emit('done')
}

function save() {
    emit('save', prefs.value)
}
</script>