<template>
  <div class="space-x-3">
    <SecondaryButton @click="show=!show">Toggle</SecondaryButton>
    <SecondaryButton @click="slideOver=!slideOver">Slide Over</SecondaryButton>
    <SecondaryButton @click="modal=!modal">Modal Dialog</SecondaryButton>
  </div>

  <div class="mt-8">
    <form v-if="show" class="mx-auto max-w-4xl" @submit.prevent="onSubmit">
      <div class="shadow overflow-hidden sm:rounded-md bg-white">
        <div class="relative px-4 py-5 bg-white sm:p-6">

          <CloseButton @close="close"/>
            
          <fieldset>
            <legend class="text-base font-medium text-gray-900 text-center mb-4">New Booking</legend>

            <ErrorSummary :except="visibleFields" class="mb-4" />

            <div class="grid grid-cols-6 gap-6">

              <div class="col-span-6 sm:col-span-3">
                <TextInput id="name" v-model="request.name" required placeholder="Name for this booking" />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <SelectInput id="roomType" v-model="request.roomType" :options="enumOptions('RoomType')" />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <TextInput type="number" id="roomNumber" v-model="request.roomNumber" min="0" required />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <TextInput type="number" id="cost" v-model="request.cost" min="0" required />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <TextInput type="date" id="bookingStartDate" v-model="request.bookingStartDate" required />
              </div>
              <div class="col-span-6 sm:col-span-3">
                <TextInput type="date" id="bookingEndDate" v-model="request.bookingEndDate" />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <CheckboxInput id="lateCheckout" v-model="lateCheckout" label="Late Checkout" />
              </div>

              <div class="col-span-6">
                <TextareaInput id="notes" v-model="request.notes" placeholder="Notes about this booking" style="height:6rem" />
              </div>
            </div>
          </fieldset>
        </div>

        <div class="mt-4 px-4 py-3 bg-gray-50 text-right sm:px-6">
          <div class="flex justify-between items-center">
            <div><FormLoading :loading="loading" /></div>
            <div><PrimaryButton>Create Booking</PrimaryButton></div>
          </div>
        </div>
        
      </div>
      </form>
  </div>

  <SlideOver v-if="slideOver" title="Title" @done="slideOver=false">
    Test SlideOver
  </SlideOver>

  <ModalDialog v-if="modal" :show="true" @done="modal=false">
    <div class="p-8">Test ModalDialog</div>
  </ModalDialog>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateBooking, RoomType, useClient, dateInputFormat, enumOptions } from './api';

const emit = defineEmits<{
  (e:'done'): () => void
}>()

const visibleFields = "name,roomType,roomNumber,bookingStartDate,bookingEndDate,cost,notes"

const show = ref(true)
const slideOver = ref(false)
const modal = ref(false)
const loading = ref(false)
const lateCheckout = ref(false)

const client = useClient()

const request = new CreateBooking({
  roomType: RoomType.Single,
  roomNumber: 0,
  cost: 0,
  bookingStartDate: dateInputFormat(new Date())
})

const onSubmit = async (e: Event) => {
  loading.value = true;
  setTimeout(() => { loading.value = false; close(); }, 3000)
  // const api = await client.api(request)
  // if (api.succeeded) close()
}
const close = () => { show.value = false; emit('done'); }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
