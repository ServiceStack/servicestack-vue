<template>
  <input id="confirmDelete" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-black"
         v-model="deleteConfirmed" />
  <label for="confirmDelete" class="ml-2 mr-2 select-none">confirm</label>
  <span @click.prevent="onClick" :class="cls" v-bind="$attrs">
    <slot>Delete</slot>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

let deleteConfirmed = ref<boolean>(false)

const emit = defineEmits<{
  (e:'delete'): void
}>()

const onClick = () => {
  if (deleteConfirmed.value) emit('delete')
}

const cls = computed(() => ["select-none inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white",
  deleteConfirmed.value ? "cursor-pointer bg-red-600 dark:bg-red-300 hover:bg-red-700 dark:hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" : "bg-red-400 dark:bg-red-500"])
</script>
