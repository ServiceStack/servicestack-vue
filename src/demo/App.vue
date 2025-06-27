<template>
  <div class="absolute top-2 right-2">
    <DarkModeToggle />
  </div>

  <div class="text-center space-x-3">
    <SecondaryButton @click="show = !show">Toggle</SecondaryButton>
    <SecondaryButton @click="slideOver = !slideOver">Slide Over</SecondaryButton>
    <SecondaryButton @click="modal = !modal">Modal Dialog</SecondaryButton>
  </div>

  <div class="mt-8 mx-auto max-w-4xl flex flex-col gap-y-4">
    <h3>date</h3>
    <div class="grid grid-cols-6 gap-6">
      <TextInput class="col-span-2" type="date" id="isoDate7Z" v-model="dates.isoDate7Z" :label="dates.isoDate7Z" required />
      <TextInput class="col-span-2" type="date" id="isoDate3Z" v-model="dates.isoDate3Z" :label="dates.isoDate3Z" required />
      <TextInput class="col-span-2" type="date" id="isoDateZ" v-model="dates.isoDateZ" :label="dates.isoDateZ" required />
      <TextInput class="col-span-2" type="date" id="isoDate" v-model="dates.isoDate" :label="dates.isoDate" required />
      <TextInput class="col-span-2" type="date" id="isoDateOnly" v-model="dates.isoDateOnly" :label="dates.isoDateOnly" required />
    </div>
    
    <h3>datetime-local</h3>
    <div class="grid grid-cols-6 gap-6">
      <TextInput class="col-span-2" type="datetime-local" id="isoDate7Z" v-model="dates.isoDate7Z" :label="dates.isoDate7Z" required />
      <TextInput class="col-span-2" type="datetime-local" id="isoDate3Z" v-model="dates.isoDate3Z" :label="dates.isoDate3Z" required />
      <TextInput class="col-span-2" type="datetime-local" id="isoDateZ" v-model="dates.isoDateZ" :label="dates.isoDateZ" required />
      <TextInput class="col-span-2" type="datetime-local" id="isoDate" v-model="dates.isoDate" :label="dates.isoDate" required />
      <TextInput class="col-span-2" type="datetime-local" id="isoDateOnly" v-model="dates.isoDateOnly" :label="dates.isoDateOnly" required />
    </div>

    <h3>Dynamic DateTimes</h3>
    <div class="grid grid-cols-6 gap-6">
      <div v-for="f in dynamicDateTimes" class="col-span-2">
        <DynamicInput :input="f" :modelValue="modelDateTimes" @update:modelValue="modelDateTimes=$event" :api="api" />
        <div>{{ modelDateTimes[f.id] }}</div>
      </div>
    </div>
    <div>
      <pre>{{ modelDateTimes }}</pre>
    </div>

    <h3>Dynamic Dates</h3>
    <div class="grid grid-cols-6 gap-6">
      <div v-for="f in dynamicDates" class="col-span-2">
        <DynamicInput :input="f" :modelValue="modelDates" @update:modelValue="modelDates=$event" :api="api" />
        <div>{{ modelDates[f.id] }}</div>
      </div>
    </div>
    <div>
      <pre>{{ modelDates }}</pre>
    </div>
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
                <Combobox id="single" v-model="combos.single" :multiple="false" label="Single" :options="enumOptions('RoomType')" />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <Combobox id="multiple" v-model="combos.multiple" :multiple="true" label="Multiple" :values="contactNames" />
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

  <div class="mx-auto max-w-6xl">
    <h1 class="my-8 text-3xl">AutoForm</h1>
    <AutoForm type="QueryBookings" submitLabel="Send" :allowSubmit="x => x.take > 0" />

    <h3 class="py-4 text-2xl">Model Binding</h3>
    <AutoForm v-model="autoFormRequest" @success="$forceUpdate()" />
  </div>


  <div class="mx-auto max-w-6xl">

    <h1>MarkdownInput</h1>
    <MarkdownInput id="richtext" v-model="richtext" />
          
    <h1 class="my-8 text-3xl">AutoQueryGrid</h1>
    <AutoQueryGrid class="mb-3" type="Tracks" modelTitle="Record" newButtonLabel="New CD">
      <template #formfooter="{ updateModel }">
          <SecondaryButton @click="updateModel({ name:'Go' })">Go</SecondaryButton>
      </template>
    </AutoQueryGrid>
    
    <AutoQueryGrid class="mb-3" apis="QueryBookings,CreateBooking,UpdateBooking" />
    
    <AutoQueryGrid class="mb-3" type="Booking" selected-columns="id,name,roomType,roomNumber,cost,bookingStartDate" />
    
    <AutoQueryGrid class="mb-3" type="JobApplication" />

    
    <h3 class="my-4 text-xl">Custom Bookings AutoQueryGrid</h3>

    <AutoQueryGrid class="mb-3" type="Booking" :can-filter="c => c != 'CouponId'">
      <template #id="{ id }">#{{ id }}</template>
      <template #name="{ name }">{{ name }}</template>
      <template #roomType="{ roomType }">{{ roomType }}</template>
      <template #roomNumber="{ roomNumber }">{{ roomNumber }}</template>
      <template #cost="{ cost }"><PreviewFormat :value="cost" :format="Formats.currency" /></template>
      <template #bookingStartDate="{ bookingStartDate }">{{ formatDate(bookingStartDate) }}</template>      
      <template #couponId="{ couponId, discount }">
        <TextLink v-if="couponId" class="flex items-end" :href="`/grid/coupons?Id=${couponId}`" :title="couponId">
          <Icon class="w-5 h-5 mr-1" type="Coupon" />
          <PreviewFormat :value="discount.description" />
        </TextLink>
      </template>
      <template #discount="{ discount }">
        <PreviewFormat :value="discount" />
      </template>
    </AutoQueryGrid>

    <div>
      <h3 class="py-2 text-2xl font-semibold">Custom Vue.mjs Bookings AutoQueryGrid</h3>
      <AutoQueryGrid type="Booking" selected-columns="id,name,cost,bookingStartDate,bookingEndDate,discount,createdBy">
        <template #discount="{ discount }">
          <TextLink v-if="discount" class="flex items-end" @click.stop="showCoupon(discount.id)" :title="discount.id">
            <Icon class="w-5 h-5 mr-1" type="Coupon" />
            <PreviewFormat :value="discount.description" />
          </TextLink>
        </template>
        <template #formfooter>
            <h3 class="text-2xl">HERE</h3>
        </template>
      </AutoQueryGrid>
      <AutoEditForm v-if="coupon" class="my-8" type="UpdateCoupon" v-model="coupon" @done="close" @save="close" />
    </div>

    <h3 class="my-4 text-xl">Simple Responsive</h3>

    <AutoQueryGrid type="Booking" 
      selectedColumns="id,name,roomType,roomNumber,cost,bookingStartDate,bookingEndDate" 
      :headerTitles="{ roomNumber:'Room', bookingStartDate:'Start', bookingEndDate:'End' }"
      :visibleFrom="{ bookingStartDate:'lg', bookingEndDate:'xl' }" />

  </div>

  <div class="mx-auto max-w-4xl">
    <h1 class="my-8 text-3xl">Alerts</h1>
    <Alert>Default <b>Message</b></Alert>
    <Alert type="info">Information <b>Message</b></Alert>
    <Alert type="success">Success <b>Message</b></Alert>
    <Alert type="warn">Warning <b>Message</b></Alert>
    <Alert type="error">Error <b>Message</b></Alert>
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
    <div class="flex space-x-4">
      <TextLink @click="say('Hi!')" title="Greetings">Default <b>Link</b></TextLink>
      <TextLink color="purple" href="https://google.com" target="_blank" title="Google Link">Purple <b>Link</b></TextLink>
      <TextLink color="red"    href="https://google.com" target="_blank" title="Google Link">Red <b>Link</b></TextLink>
      <TextLink color="green"  href="https://google.com" target="_blank" title="Google Link">Green <b>Link</b></TextLink>
      <TextLink color="sky"    href="https://google.com" target="_blank" title="Google Link">Sky <b>Link</b></TextLink>
      <TextLink color="cyan"   href="https://google.com" target="_blank" title="Google Link">Cyan <b>Link</b></TextLink>
      <TextLink color="indigo" href="https://google.com" target="_blank" title="Google Link">Indigo <b>Link</b></TextLink>
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
      <DataGrid :items="bookings" :selected-columns="['id','name','roomType','bookingStartDate','cost','timeAgo']" 
        @row-selected="selectBooking($event)" :is-selected="row => selectedBooking == row" class="mb-4" />

      <DataGrid :items="bookings" selected-columns="id,name,roomType,bookingStartDate,cost,timeAgo" type="Booking"
      @row-selected="selectBooking($event)" :is-selected="row => selectedBooking == row" class="mb-4" />

      <DataGrid :items="bookings" class="mb-4" selected-columns="id,name,roomType,bookingStartDate,cost,timeAgo" 
        @row-selected="selectBooking($event)" :is-selected="row => selectedBooking == row" 
        @header-selected="selectHeader" :is-header-selected="column => selectedBookingHeader == column">
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

      <h3>Test Data Grid</h3>
      <DataGrid :items="bookings" type="Booking" :visible-from="{ name:'xl', bookingStartDate:'sm', bookingEndDate:'xl' }"
        selected-columns="id,name,roomType,roomNumber,cost,bookingStartDate,bookingEndDate,couponId" 
        :header-titles="{ roomNumber:'Room No', bookingStartDate:'Start Date', bookingEndDate:'End Date', couponId:'Voucher' }"
        @row-selected="editId = editId == $event.id ? null : $event.id" :is-selected="row => editId == row.id" />

      <AutoEditForm v-if="selectedBooking" formStyle="card" type="UpdateBooking" deleteType="DeleteBooking" v-model="selectedBooking" 
          @done="selectedBooking=null" @save="refreshBookings" @delete="refreshBookings">
          <template #heading>
            <h3 class="text-xl font-semibold text-green-700">Change an existing Room Booking</h3>
          </template>
          <template #subheading>
            Here are some <TextLink href="#">good tips on making room reservations</TextLink>.
          </template>
        </AutoEditForm>
    </div>

    <div v-if="showCreateBooking">
      <AutoCreateForm :type="CreateBooking" @done="showCreateBooking=false" @save="refreshBookings" />
    </div>
    <div v-if="showCreateBookingCard">
      <AutoCreateForm type="CreateBooking" formStyle="card" @done="showCreateBookingCard=false" @save="refreshBookings"
                      buttons-class="m-8 flex justify-end"
                      :show-cancel="false"
                      heading="Change an existing Room Booking"
                      subheading="Update a room reservation for our MyApp hotels." />
    </div>
    
    <div class="mt-4 space-x-2">
      <SecondaryButton @click="showGameItem=!showGameItem">Create Game Item</SecondaryButton>
    </div>
    
    <div>
      <h3 class="my-4 text-xl">Game Items</h3>
      <DataGrid :items="gameIems" @rowSelected="selectGameItem" :is-selected="row => selectedGameItem == row" class="mb-4" />
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
      <h3 class="text-lg">QueryBookings</h3>
      <AutoFormFields v-model="queryBookings" :api="queryBookingsApi" @update:modelValue="$forceUpdate" />
      <pre>{{ queryBookings }}</pre>
    </form>

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
    <h1 class="my-8 text-3xl">Icon</h1>
    <div class="flex space-x-4">
      <Icon :svg="Icons.Code" />
      <Icon :svg="Icons.Code"   class="w-24 h-24 border border-green-700 text-green-700" />
      <Icon :svg="Icons.Coupon" class="w-24 h-24 border border-green-700 text-green-700" />
      <Icon class="w-24 h-24" src="https://cdn.diffusion.works/artifacts/2023/01/26/9060157/output_77487570.png" />
    </div>
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
    <NavList title="Explore Vue Components">
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
    <EnsureAccessDialog v-if="ensureAccess" title="The Title" subtitle="The Sub Heading" @done="ensureAccess = false">
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
    <DataGrid :items="tracks" tableStyle="uppercaseHeadings,fullWidth,verticalLines" />
  </div>

  <div class="mx-auto max-w-4xl space-x-2">
    <h1 class="my-8 text-3xl">Preview Formats</h1>
    <div>
      <h3 class="my-4 text-lg font-semibold">Currency</h3>

      <PreviewFormat :value="50" :format="Formats.currency" />

      <p><PreviewFormat :value="50" :format="Formats.currency" class="text-lg" /></p>

      <h3 class="my-4 text-lg font-semibold">Bytes</h3>

      <PreviewFormat :value="1000000" :format="Formats.bytes" />

      <h3 class="my-4 text-lg font-semibold">Icon</h3>

      <PreviewFormat value="/profiles/1.jpg" :format="Formats.icon" class="w-40 h-40" />

      <h3 class="my-4 text-lg font-semibold">Icon Rounded</h3>

      <PreviewFormat value="/profiles/1.jpg" :format="Formats.iconRounded" />

      <h3 class="my-4 text-lg font-semibold">Icon with custom class</h3>

      <PreviewFormat value="/profiles/1.jpg" :format="Formats.icon" class="w-40 h-40 rounded-full" />

      <h3 class="my-4 text-lg font-semibold">Attachment (Image)</h3>

      <PreviewFormat value="/profiles/1.jpg" :format="Formats.attachment" />

      <h3 class="my-4 text-lg font-semibold">Attachment (Document)</h3>

      <PreviewFormat value="/content/hosting.md" :format="Formats.attachment" />

      <h3 class="my-4 text-lg font-semibold">Attachment (Document) with classes</h3>

      <PreviewFormat value="/content/hosting.md" :format="Formats.attachment" class="text-xl text-indigo-700 font-semibold" icon-class="w-8 h-8" />

      <h3 class="my-4 text-lg font-semibold">Link</h3>

      <PreviewFormat value="https://servicestack.net/blazor" :format="Formats.link" />

      <h3 class="my-4 text-lg font-semibold">Link with class</h3>

      <PreviewFormat value="https://servicestack.net/blazor" :format="Formats.link" class="text-xl text-green-700 font-semibold" />

      <h3 class="my-4 text-lg font-semibold">Link Email</h3>

      <PreviewFormat value="user@email.com" :format="Formats.linkMailTo" />

      <h3 class="my-4 text-lg font-semibold">Link Phone</h3>

      <PreviewFormat value="555 123 4567" :format="Formats.linkTel" />
    </div>
    <div>
      <h3 class="my-4 text-lg font-semibold">Session</h3>
      <div class="max-w-screen-sm">
          <HtmlFormat :value="session" />
      </div>

      <h3 class="my-4 text-lg font-semibold">Single Model</h3>

      <div class="max-w-screen-sm">
          <HtmlFormat :value="tracks[0]" />
      </div>

      <h3 class="my-4 text-lg font-semibold">Item Collections</h3>

      <div class="max-w-screen-sm">
        <HtmlFormat :value="tracks" />
      </div>

      <h3 class="my-4 text-lg font-semibold">Nested Complex Types</h3>
      <HtmlFormat :value="players" :classes="classes" />

    </div>
  </div>

</template>

<script setup lang="ts">
import type { JsonServiceClient } from '@servicestack/client'
import type { ApiResponse, InputInfo } from '../types'
import { inject, onMounted, ref } from 'vue'
import { lastRightPart } from '@servicestack/client'
import { useConfig, useMetadata, useFiles, useUtils, useFormatters, useAuth } from '../'
import { Icons, allContacts, bookings as bookingObject, forecasts, tracks, allTypesJson, players } from './data'
import { AllTypes, Authenticate, 
    Booking, CreateBooking, QueryBookings, RoomType,
    CreateJobApplication, JobApplicationAttachment, 
    GameItem, CreateGameItem, QueryGameItem, QueryCoupons 
} from './dtos'
import Combobox from '../components/Combobox.vue'
import SecondaryButton from '../components/SecondaryButton.vue'

function classes(type:'array'|'object', tag:'div'|'table'|'thead'|'th'|'tr'|'td',depth:number,cls:string,index?:number) {
    if (type == 'array') {
      if (tag === 'th') return cls.replace('text-sm text-gray-500 font-medium',' ') + (depth == 0 
          ? 'text-xs uppercase font-semibold text-indigo-700'
          : 'text-xs font-medium text-gray-500')
      if (tag === 'tr') return depth > 0 || index! % 2 == 0 ? 'bg-white' : 'bg-yellow-50'
      if (tag === 'td' && depth > 0) return 'px-4 py-3 whitespace-nowrap text-xs'
    }
    return cls
}

const emit = defineEmits<{
  (e: 'done'): () => void
}>()

const visibleFields = "name,roomType,roomNumber,bookingStartDate,bookingEndDate,cost,notes"

const show = ref(true)
const slideOver = ref(false)
const modal = ref(false)
const loading = ref(false)
const lateCheckout = ref(false)
const fields = ref([])
const ensureAccess = ref(false)
const tags = ref(['red','green','blue'])
const booking = bookingObject[0]

const { dateInputFormat, setRef } = useUtils()
const { setConfig, setAutoQueryGridDefaults } = useConfig()
const { loadMetadata, metadataApi, enumOptions } = useMetadata()
const { Formats, currency, formatDate, relativeTime } = useFormatters()

loadMetadata({
  olderThan: 60 * 60 * 1000,
  //resolvePath: 'https://localhost:5001/metadata/app.json',
  resolvePath: 'https://blazor-gallery.servicestack.net/metadata/app.json',
})

setConfig({
  assetsPathResolver: (src:string) => src.startsWith('/profiles/') 
    ? 'https://blazor-gallery.servicestack.net' + src
    : src.startsWith('/') 
      ? 'http://localhost:5000' + src 
      : src
})

setAutoQueryGridDefaults({
  // showDownloadCsv: false,
  // showCopyApiUrl: false,
})

const dates = {
  isoDate7Z: "2024-03-16T12:11:03.8071595Z",
  isoDate3Z: "2024-03-16T12:11:03.807Z",
  isoDateZ: "2024-03-16T12:11:03Z",
  isoDate: "2024-03-16T12:11:03",
  isoDateOnly: "2024-03-16",
}

const api:{error?:any} = {}

let modelDateTimes = ref<{[k:string]:string}>({})
const dynamicDateTimes:{[k:string]:InputInfo} = Object.keys(dates).reduce((acc,x) => { 
  acc[x] = {
    id:x,
    type:'datetime-local',
    label: dates[x],
    value: dates[x]
  }
  modelDateTimes.value[x] = dates[x]
  return acc }, {})

let modelDates = ref<{[k:string]:string}>({})
const dynamicDates:{[k:string]:InputInfo} = Object.keys(dates).reduce((acc,x) => { 
  acc[x] = {
    id:x,
    type:'date',
    label: dates[x],
    value: dates[x]
  }
  modelDates.value[x] = dates[x]
  return acc }, {})

const client = inject<JsonServiceClient>('client')!

authenticate()

const autoFormRequest = new QueryBookings({  
  skip: 1,
  take: 2,
  orderBy: 'Name'
})

const queryBookings = new QueryBookings({  
})

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

const say = msg => alert(msg)

const combos = ref<any>({ single:'', multiple:[] })
const contactNames = ref(allContacts.map(x => x.displayName))

const simple = ref<any>(null)
const contact = ref<any>(null)
const contacts = ref<any[]>([])


const { getMimeType } = useFiles()

const createBooking = new CreateBooking()
const queryBookingsApi: ApiResponse|null = null
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

const editId = ref()
const bookings = ref<Booking[]>([])
const selectedBooking = ref<Booking|null>(null)
const showCreateBooking = ref(false)
const showCreateBookingCard = ref(false)
const selectedBookingHeader = ref<string|null>(null)
const richtext = ref('')

function selectBooking(item:Booking) {
  setRef(selectedBooking, selectedBooking.value?.id == item?.id ? null : item)
}
function selectHeader(column:string) {
  console.log('selectHeader', column)
  selectedBookingHeader.value = selectedBookingHeader.value == column ? null : selectedBookingHeader.value
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

function selectGameItem(item:GameItem) {
  setRef(selectedGameItem, selectedGameItem.value?.name == item?.name ? null : item)
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

/* Custom Vue.mjs Bookings AutoQueryGrid */
const coupon = ref()
async function showCoupon(id:string) {
    const api = await client.api(new QueryCoupons({ id }))
    if (api.succeeded) {
        coupon.value = api.response!.results[0]
    }
}

const session = ref()

const { signIn } = useAuth()

async function authenticate() {
  const api = await client.api(new Authenticate({
    provider:'credentials',
    userName:'manager@email.com',
    password:'p@55wOrd',
  }))
  if (api.succeeded) {
    signIn(session.value = api.response!)
  }
}

onMounted(async () => { 
  await Promise.allSettled([
    refreshBookings(),
    refreshGameIems(),
    authenticate()
  ])
})
</script>

<style>
#app {
  margin-top: 60px;
}
b { font-weight: 600 }
</style>
