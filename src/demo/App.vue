<template>
  <div class="absolute top-2 right-2">
    <DarkModeToggle />
  </div>

  <div class="text-center space-x-3">
    <SecondaryButton @click="show = !show">Toggle</SecondaryButton>
    <SecondaryButton @click="slideOver = !slideOver">Slide Over</SecondaryButton>
    <SecondaryButton @click="modal = !modal">Modal Dialog</SecondaryButton>
  </div>

  <div class="mt-8">
    <form v-if="show" class="mx-auto max-w-4xl" @submit.prevent="onSubmit">
      <div class="shadow overflow-hidden sm:rounded-md bg-white dark:bg-black">
        <div class="relative px-4 py-5 bg-white dark:bg-black sm:p-6">

          <CloseButton @close="close" />

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
                <TextareaInput id="notes" v-model="request.notes" placeholder="Notes about this booking"
                  style="height:6rem" />
              </div>
            </div>
          </fieldset>
        </div>

        <div class="mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 text-right sm:px-6">
          <div class="flex justify-between items-center">
            <div>
              <FormLoading v-if="loading" />
            </div>
            <div>
              <PrimaryButton>Create Booking</PrimaryButton>
            </div>
          </div>
        </div>

      </div>
    </form>
  </div>

  <SlideOver v-if="slideOver" title="Title" @done="slideOver = false">
    Test SlideOver
  </SlideOver>

  <ModalDialog v-if="modal" :show="true" @done="modal = false">
    <div class="p-8">Test ModalDialog</div>
  </ModalDialog>

  <div class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">Alerts</h1>
    <Alert>Default <b>Message</b></Alert>
    <Alert type="Information">Information <b>Message</b></Alert>
    <Alert type="Success">Success <b>Message</b></Alert>
    <Alert type="Warning">Warning <b>Message</b></Alert>
    <Alert type="Error">Error <b>Message</b></Alert>
  </div>

  <div class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">AlertSuccess</h1>
    <AlertSuccess message="Inline Message" />
    <AlertSuccess>Success <b>Message</b></AlertSuccess>
  </div>

  <div class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">Buttons</h1>
    <PrimaryButton href="https://blazor-gallery.servicestack.net" class="mr-2">
        Blazor Gallery
    </PrimaryButton>

    <SecondaryButton href="https://docs.servicestack.net/templates-blazor-tailwind">
        Blazor Docs
    </SecondaryButton>
  </div>

  <div class="mx-auto max-w-4xl space-x-2">
    <h1 class="my-8 text-3xl">Button Styles</h1>
    <PrimaryButton>Default</PrimaryButton>
    <PrimaryButton color="blue">Blue</PrimaryButton>
    <PrimaryButton color="purple">Purple</PrimaryButton>
    <PrimaryButton color="red">Red</PrimaryButton>
    <PrimaryButton color="green">Green</PrimaryButton>
    <PrimaryButton color="sky">Sky</PrimaryButton>
    <PrimaryButton color="cyan">Cyan</PrimaryButton>
    <PrimaryButton color="indigo">Indigo</PrimaryButton>
  </div>

  <div class="mx-auto max-w-4xl space-x-2">
    <h1 class="my-8 text-3xl">Inputs</h1>
    <div class="max-w-xl space-y-4 mb-4">
      <FileInput id="single" />
      <FileInput id="multiple" multiple />
      <TagInput id="tags" v-model="tags" />
      <div class="mt-2 flex flex-wrap">
        <b>Tags: </b>
        <span class="ml-2" v-for="tag in tags">{{ tag }}</span>
      </div>
    </div>
    <Loading>Custom Loading...</Loading>
    <div class="flex space-x-2">
      <p><TextLink href="https://google.com" target="_blank" title="Google Link" @click="onClick('here')">Blue <b>Link</b></TextLink></p>
      <p><TextLink color="purple" href="https://google.com" target="_blank" title="Google Link">Purple <b>Link</b></TextLink></p>
      <p><TextLink color="red" href="https://google.com" target="_blank" title="Google Link">Red <b>Link</b></TextLink></p>
      <p><TextLink color="green" href="https://google.com" target="_blank" title="Google Link">Green <b>Link</b></TextLink></p>
      <p><TextLink color="sky" href="https://google.com" target="_blank" title="Google Link">Sky <b>Link</b></TextLink></p>
      <p><TextLink color="cyan" href="https://google.com" target="_blank" title="Google Link">Cyan <b>Link</b></TextLink></p>
      <p><TextLink color="indigo" href="https://google.com" target="_blank" title="Google Link">Indigo <b>Link</b></TextLink></p>
    </div>
  </div>

  <div class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">Autocomplete</h1>

    <div class="max-w-xl grid grid-cols-6 gap-6">
      <form class="col-span-12">
        
        <div class="mb-3">
          <Autocomplete id="simple" :options="allContacts" v-model="simple" label="Single Contact"
              :match="(x:any, value:string) => x!.displayName.toLowerCase().includes(value.toLowerCase())"
              placeholder="Select Contact">
              <template #item="{ displayName }">
                <span class="block truncate">{{ displayName }}</span>
              </template>
          </Autocomplete>
          <div class="mt-2 flex justify-end">
            <p>
              <b class="text-gray-500">Single:</b> 
              <div v-if="simple" class="flex">
                <img :src="simple.profileUrl" class="w-8 h-8 rounded-full mr-2">
                <b class="text-lg">{{ simple.displayName }}</b>
              </div>
            </p>
          </div>
        </div>

        <div class="mb-3">
          <Autocomplete id="contact" :options="allContacts" v-model="contact" label="Single Contact with Icon"
              :match="(x:any, value:string) => x!.displayName.toLowerCase().includes(value.toLowerCase())"
              placeholder="Select Contact">
              <template #item="{ displayName, profileUrl }">
                <div class="flex items-center">
                    <Icon class="h-6 w-6 flex-shrink-0 rounded-full" :src="profileUrl" loading="lazy" />
                    <span class="ml-3 truncate">{{ displayName }}</span>
                </div>
              </template>
          </Autocomplete> 
          <div class="mt-2 flex justify-end">
            <p>
              <b class="text-gray-500">Single with Icon:</b> 
              <div v-if="contact" class="flex">
                <img :src="contact.profileUrl" class="w-8 h-8 rounded-full mr-2">
                <b class="text-lg">{{ contact.displayName }}</b>
              </div>
            </p>
          </div>         
        </div>

        <div class="mb-3">
          <Autocomplete id="contacts" :options="allContacts" v-model="contacts" multiple label="Single Contact with Icon"
              :match="(x:any, value:string) => x!.displayName.toLowerCase().includes(value.toLowerCase())"
              placeholder="Select Contact">
              <template #item="{ displayName, profileUrl }">
                <div class="flex items-center">
                    <Icon class="h-6 w-6 flex-shrink-0 rounded-full" :src="profileUrl" loading="lazy" />
                    <span class="ml-3 truncate">{{ displayName }}</span>
                </div>
              </template>
          </Autocomplete>
          <div class="mt-2">
            <div class="text-right"><b class="text-gray-500">Multiple with Icon:</b></div>
            <p>
              <div v-if="contacts.length" class="flex flex-wrap">
                <div v-for="contact in contacts" class="flex ml-4 mb-2">
                  <img :src="contact.profileUrl" class="w-6 h-6 rounded-full mr-2">
                  <span>{{ contact.displayName }}</span>
                </div>
              </div>
            </p>
          </div>         
        </div>

        <PrimaryButton class="mt-8" type="button">Button</PrimaryButton>
      </form>

    </div>
  </div>

  <div class="mx-auto max-w-4xl space-x-2">
    <h1 class="my-8 text-3xl">Data Grids</h1>
    <DataGrid :items="bookings" />

    <h3 class="my-4 text-xl">Weather</h3>
    <DataGrid :items="forecasts" class="max-w-screen-md" :tableStyle="['stripedRows','uppercaseHeadings']"
              :header-titles="{ temperatureC:'TEMP. (C)', temperatureF:'TEMP. (F)' }"
              :visible-from="{ date:'lg' }">
      <template v-slot:date-header>
          <span class="text-green-600">Z Date</span>
      </template>
      <template #date="{ date }">
          {{ formatDate(date) }}
      </template>
      <template #temperatureC="{ temperatureC }">
          {{ temperatureC }}
      </template>
      <template #temperatureF="{ temperatureF }">
          {{ temperatureF }}
      </template>
      <template #summary="{ summary }">
          {{ summary }}
      </template>
    </DataGrid>

    <h3 class="my-4 text-xl">Responsive Bookings</h3>
    <DataGrid :items="bookings" 
      :visible-from="{ name:'xl', bookingStartDate:'sm', bookingEndDate:'xl' }">
      <template #id="{ id }">
        <span class="text-gray-900">{{ id }}</span>
      </template>
      
      <template #name="{ name }">
        {{ name }}
      </template>
      
      <template #roomNumber-header>
        <span class="hidden lg:inline">Room </span>No
      </template>

      <template #cost="{ cost }">{{ currency(cost) }}</template>
      
      <template #bookingStartDate-header>
        Start<span class="hidden lg:inline"> Date</span>
      </template>
      <template #bookingStartDate="{ bookingStartDate }">{{ formatDate(bookingStartDate) }}</template>
      
      <template #bookingEndDate-header>
        End<span class="hidden lg:inline"> Date</span>
      </template>
      <template #bookingEndDate="{ bookingEndDate }">{{ formatDate(bookingEndDate) }}</template>

      <template #createdBy-header>
        Employee
      </template>
      <template #createdBy="{ createdBy }">{{ createdBy }}</template>
    </DataGrid>  

  </div>

  <div v-if="metadataApi" class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">AutoCreateForm</h1>
    
    <div class="space-x-2">
      <SecondaryButton @click="showCreateBooking=!showCreateBooking">Create Booking</SecondaryButton>
      <SecondaryButton @click="showCreateBookingCard=!showCreateBookingCard">Card</SecondaryButton>
    </div>
    
    <h1 class="my-8 text-3xl">AutoEditForm</h1>
    <div>
      <AutoEditForm formStyle="card" type="UpdateBooking" deleteType="DeleteBooking" v-model="booking" />
    </div>

    <div>
      <h3 class="my-4 text-xl">Bookings</h3>
      <DataGrid :items="bookings" :selectedColumns="['id','name','roomType','bookingStartDate','cost','timeAgo']" 
        :allow-selection="true" @row-selected="selectBooking($event)" class="mb-4" />

      <DataGrid :items="bookings" :selectedColumns="['id','name','roomType','bookingStartDate','cost','timeAgo']" type="Booking"
        :allow-selection="true" @row-selected="selectBooking($event)" class="mb-4" />

      <DataGrid :items="bookings" class="mb-4" :selectedColumns="['id','name','roomType','bookingStartDate','cost','timeAgo']"
        :allow-selection="true" @row-selected="selectBooking($event)" :allow-header-selection="true" @header-selected="selectHeader">
        <template #id="{ id }">
          <b class="text-indigo-600">{{ id }}</b>
        </template>
        <template #bookingStartDate="{ bookingStartDate }">
          {{ formatDate(bookingStartDate) }}
        </template>
        <template #cost="{ cost }">
          {{ currency(cost) }}
        </template>
        <template #timeAgo="{ timeAgo }">
          {{ relativeTime(timeAgo) }}
        </template>
      </DataGrid>

      <AutoEditForm v-if="selectedBooking" formStyle="card" type="UpdateBooking" deleteType="DeleteBooking" v-model="selectedBooking" 
          @done="selectedBooking=null" @save="refreshBookings" @delete="refreshBookings" />
    </div>

    <div v-if="showCreateBooking">
      <AutoCreateForm :type="CreateBooking" @done="showCreateBooking=false" @save="refreshBookings" />
    </div>
    <div v-if="showCreateBookingCard">
      <AutoCreateForm type="CreateBooking" formStyle="card" @done="showCreateBookingCard=false" @save="refreshBookings" />
    </div>
    
    <div class="mt-4 space-x-2">
      <SecondaryButton @click="showGameItem=!showGameItem">Create Game Item</SecondaryButton>
    </div>
    
    <div>
      <h3 class="my-4 text-xl">Game Items</h3>
      <DataGrid :items="gameIems" @rowSelected="selectGameItem($event)" class="mb-4" />
      <AutoEditForm v-if="selectedGameItem" formStyle="card" type="UpdateGameItem" deleteType="DeleteGameItem" v-model="selectedGameItem" 
          @done="selectedGameItem=null" @save="refreshGameIems" @delete="refreshGameIems" />
      <div v-if="showGameItem">
        <AutoCreateForm :type="CreateGameItem" @done="showGameItem=false" @save="refreshGameIems" />
      </div>
    </div>
    
  </div>

  <div v-if="metadataApi" class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">AutoFormFields</h1>
    <form class="mb-3" @submit.prevent="">
      <input type="submit" class="hidden">
      <h3 class="text-lg">CreateBooking</h3>
      <AutoFormFields v-model="createBooking" :api="createBookingApi" @update:modelValue="$forceUpdate" />
      <pre>{{ createBooking }}</pre>
    </form>

    <form class="mb-3" @submit.prevent="">
      <input type="submit" class="hidden">
      <h3 class="text-lg">CreateJobApplication</h3>
      <AutoFormFields v-model="createJobApplication" :api="createJobApplicationApi" @update:modelValue="$forceUpdate" />
      <pre>{{ createJobApplication }}</pre>
    </form>

    <form class="mb-3" @submit.prevent="">
      <input type="submit" class="hidden">
      <h3 class="text-lg">AllTypes</h3>
      <AutoFormFields v-model="allTypes" :api="allTypesApi" @update:modelValue="$forceUpdate" />
      <AutoEditForm v-model="allTypesJson" formStyle="card" type="AllTypes" />
      <pre>{{ allTypes }}</pre>
    </form>
  </div>

  <div class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">Breadcrumbs</h1>
    <Breadcrumbs>
      <Breadcrumb href="/gallery">
        gallery
      </Breadcrumb>
      <Breadcrumb href="/gallery/navigation">
        navigation
      </Breadcrumb>
      <Breadcrumb>
        Breadcrumb Examples
      </Breadcrumb>
    </Breadcrumbs>
  </div>
  
  <div class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">NavList</h1>
    <Icon class="w-24 h-24" src="https://cdn.diffusion.works/artifacts/2023/01/26/9060157/output_77487570.png" />
    <NavList title="Explore Blazor Components">
        <NavListItem title="DataGrid" href="/gallery/datagrid" :iconSvg="Icons.DataGrid">
            DataGrid Component Examples for rendering tabular data
        </NavListItem>
        <NavListItem title="AutoQuery Grid" href="/gallery/autoquerygrid" :iconSvg="Icons.AutoQueryGrid">
            Instant customizable UIs for calling AutoQuery CRUD APIs
        </NavListItem>
    </NavList>

    <h2 class="mt-8 text-base font-semibold text-gray-500 dark:text-gray-400 flex">
        <span title="Requires Auth"><Icon class="h-6 w-6 mr-2" :svg="Icons.Padlock" /></span>
        Booking APIs
    </h2>
    <NavList>
        <NavListItem title="Bookings" href="/grid/bookings" :icon="bookingIcon">
            Create and manage Bookings
        </NavListItem>
        <NavListItem title="Coupons" href="/grid/coupons" :icon="couponIcon">
            Create and manage discount Coupons
        </NavListItem>
    </NavList>
  </div>

  <div class="mx-auto max-w-4xl space-x-2">
    <h1 class="my-8 text-3xl">Modals</h1>
    <SecondaryButton @click="ensureAccess = !ensureAccess">Ensure Access</SecondaryButton>
    <EnsureAccessDialog v-if="ensureAccess" title="The Title" subHeading="The Sub Heading" @done="ensureAccess = false">
      No Access
    </EnsureAccessDialog>
  </div>

  <div class="mx-auto max-w-4xl space-x-2">
    <h1 class="my-8 text-3xl">Table Styles</h1>

    <h3 class="my-4 text-lg font-semibold">Default (Striped Rows)</h3>

    <DataGrid :items="tracks" />

    <h3 class="my-4 text-lg font-semibold">Simple</h3>

    <DataGrid :items="tracks" tableStyle="simple" />

    <h3 class="my-4 text-lg font-semibold">Uppercase Headings</h3>

    <DataGrid :items="tracks" tableStyle="uppercaseHeadings" />

    <h3 class="my-4 text-lg font-semibold">Vertical Lines</h3>

    <DataGrid :items="tracks" tableStyle="verticalLines" />

    <h3 class="my-4 text-lg font-semibold">White Background</h3>

    <DataGrid :items="tracks" tableStyle="whiteBackground" />

    <h3 class="my-4 text-lg font-semibold">Full Width</h3>

    <DataGrid :items="tracks" tableStyle="fullWidth" />

    <h3 class="my-4 text-lg font-semibold">Full Width, Uppercase with Vertical Lines</h3>

    <DataGrid :items="tracks" :tableStyle="['uppercaseHeadings', 'fullWidth', 'verticalLines']" />
  </div>

</template>

<script setup lang="ts">
import type { ApiRequest, ApiResponse } from '../types'
import { inject, onMounted, ref } from 'vue'
import { lastRightPart, JsonServiceClient, toDate, fromXsdDuration } from '@servicestack/client'
import { useConfig, useFiles, useUtils, useFormatters } from '../'
import { useAppMetadata } from '../metadata'
import { Icons, allContacts, bookings as bookingObject, forecasts, tracks, bookingsJson, allTypesJson } from './data'
import { AllTypes, Authenticate, 
    Booking, CreateBooking, QueryBookings, RoomType,
    CreateJobApplication, JobApplicationAttachment, 
    GameItem, CreateGameItem, QueryGameItem 
} from './dtos'

const emit = defineEmits<{
  (e: 'done'): () => void
}>()

const visibleFields = "name,roomType,roomNumber,bookingStartDate,bookingEndDate,cost,notes"

const show = ref(true)
const slideOver = ref(false)
const modal = ref(false)
const loading = ref(false)
const lateCheckout = ref(false)
const ensureAccess = ref(false)
const tags = ref(['red','green','blue'])
const booking = bookingObject[0]

const { dateInputFormat } = useUtils()
const { setConfig } = useConfig()
const { metadataApi, clear, load, enumOptions } = useAppMetadata()
const { currency, formatDate, relativeTime } = useFormatters()

clear({ olderThan: 60 * 60 * 1000 })
if (!metadataApi.value) {
  const metadataUrl = 'https://localhost:5001/metadata/app.json'
  console.log(`loading AppMetadata from ${metadataUrl}...`)
  ;(async () => {
    let res = await fetch(metadataUrl)
    let json = await res.text()
    console.log(`loaded ${metadataUrl}, length: ${json.length}`)
    load(JSON.parse(json))
  })()
}


setConfig({
  assetsPathResolver: (src:string) => src.startsWith('/') ? 'http://localhost:5000' + src : src
})

const client = inject('client') as JsonServiceClient

client.api(new Authenticate({ provider:'credentials', userName:'manager@email.com', password:'p@55wOrd'}))
  .then(r => console.log('Authenticate', r.error, r.response))

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

const bookingIcon = { svg: Icons.Booking }
const couponIcon = { svg: Icons.Coupon }

const onClick = msg => alert(msg)

const simple = ref<any>(null)
const contact = ref<any>(null)
const contacts = ref<any[]>([])


const { getMimeType } = useFiles()

const createBooking = new CreateBooking()
const createBookingApi: ApiResponse|null = null

const toFile = (filePath:string) => ({ 
  filePath,
  fileName: lastRightPart(filePath,'/'),
  contentType: getMimeType(filePath)
})

const createJobApplication = new CreateJobApplication({
  //attachments: [new JobApplicationAttachment(toFile('https://cdn.diffusion.works/artifacts/2023/01/26/9060157/output_77487570.png'))]
})
const createJobApplicationApi: ApiResponse|null = null

const allTypes = new AllTypes({ stringList:['red','green'] })
const allTypesApi: ApiResponse|null = null

const bookings = ref<Booking[]>([])
const selectedBooking = ref<Booking|null>(null)
const showCreateBooking = ref(false)
const showCreateBookingCard = ref(false)

function selectBooking(item:Booking|null) {
  selectedBooking.value = null
  if (item) requestAnimationFrame(() => selectedBooking.value = Object.assign({}, item))
}
function selectHeader(column:string) {
  console.log('selectHeader', column)
}

async function refreshBookings(arg?:any) {
  if (arg) console.log('refreshBookings', arg)
  showCreateBooking.value = showCreateBookingCard.value = false
  selectedBooking.value = null
  let api = await client.api(new QueryBookings())
  if (api.succeeded) {
    bookings.value = api.response!.results
  }
}

const gameIems = ref<GameItem[]>([])
const selectedGameItem = ref<GameItem|null>(null)
const showGameItem = ref(false)

function selectGameItem(item:GameItem|null) {
  selectedGameItem.value = null
  if (item) requestAnimationFrame(() => selectedGameItem.value = Object.assign({}, item))
}

async function refreshGameIems(arg?:any) {
  if (arg) console.log('refreshGameIems', arg)
  showGameItem.value = false
  selectedGameItem.value = null
  let api = await client.api(new QueryGameItem())
  if (api.succeeded) {
    gameIems.value = api.response!.results
  }
}

onMounted(() => { refreshBookings(); refreshGameIems(); })
</script>

<style>
#app {
  margin-top: 60px;
}
b { font-weight: 600 }
</style>
