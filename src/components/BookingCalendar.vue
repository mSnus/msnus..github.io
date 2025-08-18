<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDataStore } from '@/stores/main'
import dayjs from 'dayjs';
import { weekKeyToMonday } from '@/weekKey'

const store = useDataStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
    store.load('2025-08-01')

    const qWeek = typeof route.query.week === 'string' ? route.query.week : null

    if (qWeek) {
        store.setSelectedWeek(qWeek)
    } else if (store.selectedWeek) {
        // reflect store -> url
        router.replace({ query: { ...route.query, week: store.selectedWeek } }).catch(() => { })
    }
})

const isWide = window.matchMedia("(min-width: 1280px)").matches;

const gridClasses = !isWide ? 'grid-cols-2 grid-rows-3' : 'grid-cols-3 grid-rows-2';

const bookings = computed(() => store.loading ? [] : store.bookingsForSelectedWeek)

const bookingsByDay = computed(() => {
    if (!store.selectedWeek) return {}

    const map: Record<number, { bookings: typeof bookings.value, count: number, date: string, dayName: string }> = {}
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const monday = weekKeyToMonday(store.selectedWeek)


    for (const b of bookings.value) {
        // filter stations
        if (store.selectedStation && b.stationId !== store.selectedStation) continue

        if (!map[b.dayNumber]) {
            map[b.dayNumber] = { bookings: [], count: 0, date: '', dayName: '' }
        }

        map[b.dayNumber].bookings.push(b)
        map[b.dayNumber].count++
    }

    for (let i = 1; i <= 7; i++) {
        if (!map[i]) {
            map[i] = { bookings: [], count: 0, date: '', dayName: '' }
        }

        const date = dayjs(monday).add(i - 1, 'day').format('MMM, D')
        const dayName = dayNames[i - 1]

        map[i].date = date
        map[i].dayName = dayName
    }

    console.log('bookingsByDay', map)
    return map
})

// swipe tracking
const touchStartX = ref<number | null>(null)
const touchStartY = ref<number | null>(null)
const threshold = 50 // px min horizontal movement

function onTouchStart(e: TouchEvent) {
    const t = e.touches[0]
    touchStartX.value = t.clientX
    touchStartY.value = t.clientY
}

function onTouchEnd(e: TouchEvent) {
    if (touchStartX.value === null) return
    const t = e.changedTouches[0]
    const dx = t.clientX - (touchStartX.value ?? 0)
    const dy = t.clientY - (touchStartY.value ?? 0)
    // ignore mostly-vertical swipes
    if (Math.abs(dx) < Math.abs(dy) * 1.5) {
        touchStartX.value = null
        touchStartY.value = null
        return
    }
    if (dx < -threshold) {
        // swipe left
        nextWeek()
    } else if (dx > threshold) {
        // swipe right
        previousWeek()
    }
    touchStartX.value = null
    touchStartY.value = null
}

function nextWeek() {
    store.selectNextWeek()
    if (store.selectedWeek) router.replace({ query: { ...route.query, week: store.selectedWeek } }).catch(() => { })
}

function previousWeek() {
    store.selectPrevWeek()
    if (store.selectedWeek) router.replace({ query: { ...route.query, week: store.selectedWeek } }).catch(() => { })
}
</script>

<template>
    <div v-if="store.loading" class="flex flex-col items-center justify-center">
        <div class="text-gray-500">Loading…</div>
        <div class="loading-spinner"></div>
    </div>
    <div v-else-if="store.error" class="text-pink-500 text-2xl">Error loading data: {{ store.error }}</div>
    <div v-else>
        <div class="calendar-wrapper flex flex-col w-screen items-center justify-start"
            @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">

            <div v-if="!bookings.length" class="text-md bg-amber-100">No bookings this week</div>

            <div class="calendar-grid
            w-full grid
            pr-2 pl-2" :class="gridClasses">
                <template v-for="(booking, index) in bookingsByDay" :key="index">
                    <template v-if="index < 7">
                        <CalendarCard :booking="booking" />
                    </template>
                </template>
            </div>

            <div class="calendar-sunday-controls w-full three-cell">
                <div class="week-control text-lg text-indigo-200 flex items-center justify-center w-full h-full cursor-pointer"
                    @click="previousWeek">
                    &#9664; previous
                </div>
                <CalendarCard :booking="bookingsByDay[7]" />
                <div class="week-control text-lg text-indigo-200 flex items-center justify-center w-full h-full cursor-pointer"
                    @click="nextWeek">next
                    &#9654;
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* .calendar-wrapper {
    height: calc(100vh - var(--header-height) - 2rem);
} */

.loading-spinner {
    background-image: url('/src/assets/images/spinner.gif');
    max-width: 30rem;
    max-height: 30rem;
    height: 30rem;
    width: 30rem;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    margin: 0 auto;
}

.week-control {
    touch-action: manipulation;
}

.three-cell {
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}

@media (max-width: calc(80rem - 1px)) {
    .calendar-grid .calendar-card:nth-child(n) {
        padding-top: calc(var(--spacing) * 4);
        border-bottom: solid 1px var(--color-teal-300);
    }

    .calendar-grid .calendar-card:nth-child(2n) {
        border-left: solid 1px var(--color-teal-300);
    }

    .three-cell .calendar-card:nth-child(2n) {
        padding-top: calc(var(--spacing) * 4);
        border-left: solid 1px var(--color-teal-300);
        border-right: solid 1px var(--color-teal-300);
        width: 50vw;
    }
}

@media (min-width: 80rem) {
    .calendar-grid .calendar-card:nth-child(-n+3) {
        border-bottom: solid 1px var(--color-teal-300);
        padding-bottom: calc(var(--spacing) * 4);
    }

    .calendar-grid .calendar-card:nth-child(n+4) {
        padding-top: calc(var(--spacing) * 4);
    }

    .calendar-grid .calendar-card:nth-child(3n+1) {
        border-right: solid 1px var(--color-teal-300);
    }

    .calendar-grid .calendar-card:nth-child(3n) {
        border-left: solid 1px var(--color-teal-300);
    }

    .calendar-grid .calendar-card:nth-child(n+7) {
        border-top: solid 1px var(--color-red-300);
        padding-top: calc(var(--spacing) * 4);
    }

    .calendar-sunday-controls {
        border-top: solid 1px var(--color-teal-300);
    }

    .calendar-sunday-controls .calendar-card:nth-child(2) {
        border-left: solid 1px var(--color-teal-300);
        border-right: solid 1px var(--color-teal-300);
        padding-top: calc(var(--spacing) * 4);
    }

    .three-cell .calendar-card:nth-child(2n) {
        padding-top: calc(var(--spacing) * 4);
        border-left: solid 1px var(--color-teal-300);
        border-right: solid 1px var(--color-teal-300);
        width: 33vw;
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import DayDate from './calendar/DayDate.vue';
import DayBookings from './calendar/DayBookings.vue';
import BookingLineTime from './calendar/BookingLineTime.vue';
import BookingLineStation from './calendar/BookingLineStation.vue';
import CalendarCard from './calendar/CalendarCard.vue';

export default defineComponent({
    name: 'BookingCalendar',
    components: {
        DayDate,
        DayBookings,
        BookingLineTime,
        BookingLineStation
    }
})
</script>
