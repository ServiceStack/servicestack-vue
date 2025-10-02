<template>
<div :class="['flex', !multiple ? 'justify-between' : 'flex-col']">
    <div class="relative flex-grow mr-2 sm:mr-4">
        <label v-if="useLabel" :for="id" :class="`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass??''}`">{{ useLabel }}</label>
        <div class="block mt-2">
            <span class="sr-only">{{ help ?? useLabel }}</span>

            <input ref="input" type="file" :multiple="multiple"
                :name="id"
                :id="id"
                :class="cls"
                :placeholder="usePlaceholder"
                :aria-invalid="errorField != null"
                :aria-describedby="`${id}-error`"
                v-bind="$attrs"
                @change="onChange">

            <div v-if="errorField" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </div>
        </div>
        <p v-if="errorField" class="mt-2 text-sm text-red-500" :id="`${id}-error`">{{ errorField }}</p>
        <p v-else-if="help" class="mt-2 text-sm text-gray-500" :id="`${id}-description`">{{ help }}</p>
    </div>
    <div v-if="!multiple">
        <div v-if="src" class="shrink-0 cursor-pointer" :title="!isDataUri(src) ? src : ''">
            <img @click="openFile" :class="['h-16 w-16', imgCls(src)]" :alt="`Current ${useLabel ?? ''}`"
                :src="fallbackSrc || assetsPathResolver(src)"
                @error="onError">
        </div>
    </div>
    <div v-else class="mt-3">
        <table class="w-full">
            <tr v-for="file in fileList">
                <td class="pr-6 align-bottom pb-2">
                    <div class="flex w-full" :title="!isDataUri(file.filePath) ? file.filePath : ''">
                        <img :src="fallbackSrcMap[filePathUri(file.filePath)!] || assetsPathResolver(filePathUri(file.filePath)!)"
                            :class="['mr-2 h-8 w-8',imgCls(file.filePath)]"
                            @error="fallbackSrcMap[filePathUri(file.filePath)!] = fallbackPathResolver(filePathUri(file.filePath)!)">
                        <a v-if="!isDataUri(file.filePath)" :href="assetsPathResolver(file.filePath||'')" target="_blank" class="overflow-hidden">
                            {{file.fileName}}
                        </a>
                        <span v-else class="overflow-hidden">{{file.fileName}}</span>
                    </div>
                </td>
                <td class="align-top pb-2 whitespace-nowrap">
                    <span v-if="file.contentLength && file.contentLength > 0" class="text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-black">
                        {{formatBytes(file.contentLength)}}
                    </span>
                </td>
            </tr>
        </table>
    </div>
</div>
</template>

<script setup lang="ts">
import type { ApiState, UploadedFile } from '@/types'
import type { FileInputProps } from '@/components/types'
import { computed, inject, onUnmounted, ref } from 'vue'
import { errorResponse, humanize, lastLeftPart, lastRightPart, toPascalCase } from '@servicestack/client'
import { useConfig } from '@/use/config'
import { filePathUri, getMimeType, formatBytes, fileImageUri, flush } from '@/use/files'
import { filterClass } from './css'

const props = defineProps<FileInputProps>()

const input = ref<HTMLInputElement|null>(null)

const { assetsPathResolver, fallbackPathResolver } = useConfig()
const fallbackSrcMap:{[name:string]:string|undefined} = {}

const fallbackSrc = ref<string|undefined>()
const fileList = ref<UploadedFile[]>(props.files?.map(toFile) || [])

function toFile(file:UploadedFile) {
    file.filePath = assetsPathResolver(file.filePath)
    return file
}

if (props.values && props.values.length > 0) {
    fileList.value = props.values.map(x => {
        let filePath = x.replace(/\\/g,'/')
        return { fileName:lastLeftPart(lastRightPart(filePath,'/'),'.'), filePath, contentType:getMimeType(filePath) } as UploadedFile
    }).map(toFile)
}

const useLabel = computed(() => props.label ?? humanize(toPascalCase(props.id)))
const usePlaceholder = computed(() => props.placeholder ?? useLabel.value)

let ctx: ApiState|undefined = inject('ApiState', undefined)
const errorField = computed(() => errorResponse.call({ responseStatus: props.status ?? (ctx as any)?.error.value }, props.id))

const cls = computed(() => filterClass(['block w-full sm:text-sm rounded-md dark:text-white dark:bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-200 hover:file:bg-violet-100 dark:hover:file:bg-violet-800', 
    errorField.value
        ? 'pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
        : 'text-slate-500 dark:text-slate-400'
        , props.inputClass], 'FileInput', props.filterClass))

const onChange = (e:Event) => {
    let f = e.target as HTMLInputElement
    fallbackSrc.value = ''
    fileList.value = Array.from(f.files||[]).map(x => ({
        fileName: x.name,
        filePath: fileImageUri(x)!,
        contentLength: x.size,
        contentType: x.type || getMimeType(x.name),
    }))
}

const openFile = () => input.value?.click()

const isDataUri = (src?:string|null) => src == null ? false : src.startsWith("data:") || src.startsWith("blob:")

const src = computed(() => {
    
    if (fileList.value.length > 0)
        return (fileList.value[0] as UploadedFile).filePath
    let filePath = typeof props.modelValue == 'string' ? props.modelValue : props.values && props.values[0]
    return filePath && filePathUri(assetsPathResolver(filePath)) || null    
})

const imgCls = (src?:string|null) => !src || src.startsWith("data:") || src.endsWith(".svg")
    ? ''
    : 'rounded-full object-cover'

function onError(e:Event) {
    fallbackSrc.value = fallbackPathResolver(src.value!)
}

onUnmounted(flush)

</script>
