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

  <div v-if="metadataApi" class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">AutoCreateForm</h1>
    
    <div class="space-x-2">
      <SecondaryButton @click="showCreateBooking=!showCreateBooking">Create Booking</SecondaryButton>
      <SecondaryButton @click="showCreateBookingCard=!showCreateBookingCard">Card</SecondaryButton>
    </div>
    
    <div>
      <h3 class="my-4 text-xl">Bookings</h3>
      <DataGrid :items="bookings" :selectedColumns="['id','name','roomType','bookingStartDate','cost','timeAgo']" 
        @rowSelected="selectBooking($event)" class="mb-4" />
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


</template>

<script setup lang="ts">
import type { ApiRequest, ApiResponse } from '../types'
import { inject, onMounted, ref } from 'vue'
import { lastRightPart, JsonServiceClient } from '@servicestack/client'
import { dateInputFormat } from './api'
import { useConfig, useAppMetadata, useFiles } from '../api'
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

const { metadataApi, clear, load, enumOptions } = useAppMetadata()
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


const { setConfig } = useConfig()
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

const Icons = {
  Padlock:       "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='#B1B4B5' d='M376.749 349.097c-13.531 0-24.5-10.969-24.5-24.5V181.932c0-48.083-39.119-87.203-87.203-87.203-48.083 0-87.203 39.119-87.203 87.203v82.977c0 13.531-10.969 24.5-24.5 24.5s-24.5-10.969-24.5-24.5v-82.977c0-75.103 61.1-136.203 136.203-136.203s136.203 61.1 136.203 136.203v142.665c0 13.531-10.969 24.5-24.5 24.5z'/><path fill='#FFB636' d='M414.115 497.459H115.977c-27.835 0-50.4-22.565-50.4-50.4V274.691c0-27.835 22.565-50.4 50.4-50.4h298.138c27.835 0 50.4 22.565 50.4 50.4v172.367c0 27.836-22.565 50.401-50.4 50.401z'/><path fill='#FFD469' d='M109.311 456.841h-2.525c-7.953 0-14.4-6.447-14.4-14.4V279.309c0-7.953 6.447-14.4 14.4-14.4h2.525c7.953 0 14.4 6.447 14.4 14.4v163.132c0 7.953-6.447 14.4-14.4 14.4z'/></svg>",
  Booking:       "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='currentColor' d='M16 10H8c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1zm3-7h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1H8V2c0-.55-.45-1-1-1s-1 .45-1 1v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V8h14v10c0 .55-.45 1-1 1zm-5-5H8c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1z'/></svg>",
  Coupon:        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='currentColor' d='M2 9.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5.5a2.5 2.5 0 1 0 0 5V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5.5a2.5 2.5 0 1 0 0-5zm2-1.532a4.5 4.5 0 0 1 0 8.064V19h16v-2.968a4.5 4.5 0 0 1 0-8.064V5H4v2.968zM9 9h6v2H9V9zm0 4h6v2H9v-2z' /></svg>",
  DataGrid:      "<svg class='w-6 h-6 text-indigo-700 dark:text-indigo-300' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='currentColor' d='M0 1v14h16V1H0zm6 9V7h4v3H6zm4 1v3H6v-3h4zm0-8v3H6V3h4zM5 3v3H1V3h4zM1 7h4v3H1V7zm10 0h4v3h-4V7zm0-1V3h4v3h-4zM1 11h4v3H1v-3zm10 3v-3h4v3h-4z' /></svg>",
  AutoQueryGrid: "<svg class='h-6 w-6 text-indigo-700 dark:text-indigo-300' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'><path fill='currentColor' d='M3 6.75A3.75 3.75 0 0 1 6.75 3h14.5A3.75 3.75 0 0 1 25 6.75v6.262a3.296 3.296 0 0 0-1.5.22V11h-5v6h.856L17 19.356V18.5h-6v5h2.542a3.329 3.329 0 0 0-.02.077L13.166 25H6.75A3.75 3.75 0 0 1 3 21.25V6.75ZM4.5 18.5v2.75a2.25 2.25 0 0 0 2.25 2.25H9.5v-5h-5Zm5-1.5v-6h-5v6h5Zm7.5 0v-6h-6v6h6Zm6.5-10.25a2.25 2.25 0 0 0-2.25-2.25H18.5v5h5V6.75ZM17 4.5h-6v5h6v-5Zm-7.5 0H6.75A2.25 2.25 0 0 0 4.5 6.75V9.5h5v-5Zm13.6 10.17l-7.903 7.902a2.686 2.686 0 0 0-.706 1.247l-.458 1.831a1.087 1.087 0 0 0 1.319 1.318l1.83-.457a2.685 2.685 0 0 0 1.248-.707l7.902-7.902a2.286 2.286 0 0 0-3.232-3.233Z' /></svg>",
}
const bookingIcon = { svg: Icons.Booking }
const couponIcon = { svg: Icons.Coupon }

const onClick = msg => alert(msg)

const simple = ref<any>(null)
const contact = ref<any>(null)
const contacts = ref<any[]>([])

let allContacts = [   
  [ "Alexis Kirlin", "/profiles/profile.jpg" ],
  [ "Alize Glover", "/profiles/2.jpg" ],
  [ "Damon Jakubowski", "/profiles/3.jpg" ],
  [ "Max O'Hara", "/profiles/4.jpg" ],
  [ "Diego Collier", "/profiles/5.jpg" ],
  [ "Deanna Williamson", "/profiles/6.jpg" ],
  [ "Wilfred Wilderman", "/profiles/7.jpg" ],
  [ "Dillan Dibbert", "/profiles/8.jpg" ],
  [ "Axel Torphy", "/profiles/9.jpg" ],
  [ "Eda Ritchie", "/profiles/angelina-litvin-52R7t7x8CPI-unsplash.jpg" ],
  [ "Teagan Franecki", "/profiles/art-hauntington-jzY0KRJopEI-unsplash.jpg" ],
  [ "Marilou VonRueden", "/profiles/askar-ulzhabayev-mOnHNBhyjgM-unsplash.jpg" ],
  [ "Khalil Powlowski", "/profiles/charles-etoroma-95UF6LXe-Lo-unsplash.jpg" ],
  [ "Hazle Sawayn", "/profiles/christopher-campbell-rDEOVtE7vOs-unsplash.jpg" ],
  [ "Dale Cremin", "/profiles/de-andre-bush-baeDx6LuSt4-unsplash.jpg" ],
  [ "Judson Ziemann", "/profiles/engin-akyurt-ljkKZUU6AkQ-unsplash.jpg" ],
  [ "Estefania Rodriguez", "/profiles/engin-akyurt-UJavPBeDsT8-unsplash.jpg" ],
  [ "Obie Ferry", "/profiles/hisu-lee-u6LGX2VMOP4-unsplash.jpg" ],
  [ "Jaquan Prosacco", "/profiles/janko-ferlic-mIs_QHS1ht8-unsplash.jpg" ],
  [ "Marlene Beahan", "/profiles/joel-mott-LaK153ghdig-unsplash.jpg" ],
  [ "Rowena Paucek", "/profiles/joseph-gonzalez-iFgRcqHznqg-unsplash.jpg" ],
  [ "Elvis Tillman", "/profiles/luke-braswell-oYFv-_JKsVk-unsplash.jpg" ],
  [ "Mabelle Block", "/profiles/mateus-campos-felipe-JoM_lC1WAnE-unsplash.jpg" ],
  [ "Mia Huels", "/profiles/omid-armin-VS4Bg3tWWcI-unsplash.jpg" ],
  [ "Dion Jenkins", "/profiles/peter-john-manlapig-KRBHTbLTMDs-unsplash.jpg" ],
  [ "Buster Block", "/profiles/reza-biazar-eSjmZW97cH8-unsplash.jpg" ],
  [ "Maggie Trantow", "/profiles/roman-holoschchuk-O-98kcPe0P8-unsplash.jpg" ],
  [ "Rogers Watsica", "/profiles/takashi-miyazaki-93-nUbomATA-unsplash.jpg" ],
].map(c => ({ displayName:c[0], profileUrl:'https://blazor-gallery.servicestack.net' + c[1] }))


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
  if (item) requestAnimationFrame(() => selectedBooking.value = item)
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
  if (item) requestAnimationFrame(() => selectedGameItem.value = item)
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
