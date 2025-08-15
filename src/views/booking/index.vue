<script setup lang="ts">
import { useDataStore } from '@/stores/main'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs';

const store = useDataStore()
const router = useRouter()
const route = useRoute()
const idFromRoute = route.params.id

if (store.loading) {
  router.push('/')
}

const b = store.allBookings.find(b => b.id === idFromRoute)

let days = 0
let hours = 0

if (b) {
  const dateStart = dayjs(b.pickupDate)
  const dateEnd = dayjs(b.returnDate)

  const hoursDiff = dateEnd.diff(dateStart, 'hours');
  days = Math.floor(hoursDiff / 24);
  hours = hoursDiff - (days * 24);
}

function plural(baseString: string, count: number) {
  if (count === 0) {
    return '';
  }

  if (count % 10 === 1) {
    return count.toString() + ' ' + baseString;
  }

  return count.toString() + ' ' + baseString + 's';
}

</script>

<template>
  <AppHeader :showControls="false" />

  <div class="booking-details flex flex-col items-center justify-center gap-8 w-10/12 ml-auto mr-auto" v-if="b">
    <div class="about">
      <h1 class="text-4xl font-bold mt-4 text-teal-400">{{ b?.customerName }} </h1>
    </div>

    <div class="booking-time text-right text-3xl font-light ml-4 text-teal-500"> Pick-up </div>

    <div class="flex items-center justify-center mb-6 ml-auto mr-auto">
      <BookingLineDate :date="dayjs(b?.pickupDate).toDate()" :id="b?.id ?? ''" />
      <BookingLineTime :time="dayjs(b?.pickupDate).format('h:mm')" :pickUp="true" :id="b?.id ?? ''" />
      <BookingLineStation :station="b?.stationName ?? ''" :id="b?.id ?? ''" />
    </div>

    <div class="booking-time text-right text-3xl font-light ml-4 text-pink-400"> Return </div>

    <div class="flex items-center justify-center mb-6 ml-auto mr-auto">
      <BookingLineDate :date="dayjs(b?.returnDate).toDate()" :id="b?.id ?? ''" />
      <BookingLineTime :time="dayjs(b?.returnDate).format('h:mm')" :pickUp="false" :id="b?.id ?? ''" />
      <BookingLineStation :station="b?.stationName ?? ''" :id="b?.id ?? ''" />
    </div>

    <div class="booking-time text-right text-3xl font-light ml-4 text-slate-400"> Duration </div>

    <div class="flex items-center justify-center mb-6 ml-auto mr-auto">
      <div class="text-3xl font-bold text-teal-400">
        <span v-if="days"> {{ plural('day', days) }}</span>
        <span v-if="hours" class="ml-2"> {{ plural(' hour', hours) }}</span>
      </div>
    </div>


    <div class="text-sm">#{{ idFromRoute }}</div>
    <div>
      <router-link to="/" class="text-white">
        <button class="bg-teal-base text-white px-4 py-2 rounded text-2xl">&#8592; Back</button>
      </router-link>
    </div>
  </div>

  <div v-else class="text-red-500 text-4xl font-bold mt-4">Booking not found: #{{ idFromRoute }}</div>
</template>


<script lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import { defineComponent } from 'vue'
import BookingLineStation from '@/components/calendar/BookingLineStation.vue';
import BookingLineTime from '@/components/calendar/BookingLineTime.vue';
import BookingLineDate from '@/components/calendar/BookingLineDate.vue';

export default defineComponent({
  name: 'AboutPage',
  components: {
    AppHeader,
    BookingLineStation,
    BookingLineTime,
    BookingLineDate
  },
})
</script>
