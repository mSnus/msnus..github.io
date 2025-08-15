<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDataStore } from '@/stores/main'
import dayjs from 'dayjs';
import { weekKeyToMonday } from '@/weekKey'

const store = useDataStore()
const router = useRouter()
const route = useRoute()

const MAX_BOOKINGS = import.meta.env.VITE_MAX_BOOKINGS_PER_DAY

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

const bookings = computed(() => store.loading ? [] : store.bookingsForSelectedWeek)

const bookingsByDay = computed(() => {
    const map: Record<number, { bookings: typeof bookings.value, count: number }> = {}

    for (const b of bookings.value) {
        if (store.selectedStation && b.stationId !== store.selectedStation) continue

        if (!map[b.dayNumber]) {
            map[b.dayNumber] = { bookings: [], count: 0 }
        }

        map[b.dayNumber].bookings.push(b)
        map[b.dayNumber].count++
    }

    return map
})

const dayDisplayMap = computed(() => {
    if (!store.selectedWeek) return {}

    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const map: Record<number, { date: string, dayName: string }> = {}
    const monday = weekKeyToMonday(store.selectedWeek)

    for (let i = 1; i <= 9; i++) {
        if (i === 7 || i === 9) {
            map[i] = { date: i + ' DYB', dayName: 'FYR' }
            continue
        }
        let realDay = i == 8 ? 7 : i // user 6th and 9th day for control squares, Sunday in the middle
        const date = dayjs(monday).add(realDay - 1, 'day').format('MMM, D')
        const dayName = dayNames[realDay - 1]
        map[i] = { date, dayName }
    }

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
        <div class="mb-4 flex w-screen" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">

            <div v-if="!bookings.length" class="text-md bg-amber-100">No bookings this week</div>

            <div class="booking-calendar 
            w-full max-h-7/12
            grid grid-cols-3 grid-rows-3
            gap-x-4 pr-2 pl-2 pt-12">
                <div v-for="(day, index) in dayDisplayMap" :key="index">
                    <template v-if="(index != 7 && index != 9)">
                        <DayDate :date="day.date" :day="day.dayName" class="day-headers mb-4" />
                        <template v-if="bookingsByDay[index]">
                            <!-- <DayBookings :number="bookingsByDay[day]?.length ?? 0" class="day-headers" /> -->
                            <div v-for="b in bookingsByDay[index].bookings.slice(0, MAX_BOOKINGS)" :key="b.id"
                                class="text-sm">

                                <div class="flex items-start mb-6">
                                    <BookingLineTime :time="b.bookTime" :pickUp="b.isPickup" :id="b.id" />
                                    <BookingLineStation :station="b.stationName" :id="b.id" />
                                </div>
                            </div>
                            <div v-if="bookingsByDay[index].count > MAX_BOOKINGS" class="text-xs text-gray-500">
                                <DayBookings :number="bookingsByDay[index].count - MAX_BOOKINGS" />
                            </div>
                        </template>
                    </template>
                    <template v-else-if="index == 7">
                        <div class="week-control text-lg text-indigo-200 flex items-center justify-center w-full h-full"
                            @click="previousWeek">
                            &#9664; previous
                        </div>
                    </template>
                    <template v-else="index == 9">
                        <div class="week-control text-lg text-indigo-200 flex items-center justify-center w-full h-full"
                            @click="nextWeek">next
                            &#9654;
                        </div>
                    </template>
                </div>

            </div>

        </div>
    </div>
</template>

<style scoped>
.booking-calendar {
    height: calc(100vh - var(--header-height) - 2rem);
}

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
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import DayDate from './calendar/DayDate.vue';
import DayBookings from './calendar/DayBookings.vue';
import BookingLineTime from './calendar/BookingLineTime.vue';
import BookingLineStation from './calendar/BookingLineStation.vue';

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
