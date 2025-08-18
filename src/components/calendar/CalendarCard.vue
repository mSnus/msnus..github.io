<script setup lang="ts">
import { BookingRecord } from '@/types/booking'

const MAX_BOOKINGS = import.meta.env.VITE_MAX_BOOKINGS_PER_DAY

const props = defineProps({
    booking: {
        type: Object as () => BookingRecord,
        required: true
    }
});

</script>

<template>
    <div class="calendar-card flex flex-col">
        <DayDate :date="props.booking.date" :day="props.booking.dayName" class="day-headers mb-4" />
        <div v-for="b in props.booking.bookings.slice(0, MAX_BOOKINGS)" :key="b.id" class="text-sm">

            <div class="flex items-start mb-6">
                <BookingLineTime :time="b.bookTime" :pickUp="b.isPickup" :id="b.id" />
                <BookingLineStation :station="b.stationName" :id="b.id" />
            </div>
        </div>
        <div v-if="props.booking.bookings.length > MAX_BOOKINGS" class="text-xs text-gray-500">
            <DayBookings :number="props.booking.bookings.length - MAX_BOOKINGS" />
        </div>
    </div>
</template>

<style scoped>
.calendar-card {
    min-height: calc(((100vh - var(--header-height) - 2rem) /var(--calendar-grid-row-count)) - 2rem);
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import DayDate from './DayDate.vue';
import DayBookings from './DayBookings.vue';
import BookingLineTime from './BookingLineTime.vue';
import BookingLineStation from './BookingLineStation.vue';

export default defineComponent({
    name: 'CalendarCard',
    components: {
        DayDate,
        DayBookings,
        BookingLineTime,
        BookingLineStation
    }
})
</script>
