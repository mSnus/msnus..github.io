<script setup lang="ts">

import { computed, ref } from 'vue'
import { useDataStore } from '@/stores/main'
import { useRouter, useRoute } from 'vue-router'

const store = useDataStore()
const router = useRouter()
const route = useRoute()

const weekKey = computed(() => store.selectedWeek)
const weekDisplay = computed(() => (weekKey.value ? (store.weekDisplayMap[weekKey.value] ?? weekKey.value) : ''))

const weeks = computed(() => store.weekKeysAsc)
const displayMap = computed(() => store.weekDisplayMap)
const weeksByYear = computed(() => {
    const map: Record<string, string[]> = {}
    for (const week of weeks.value) {
        const year = week.substring(0, 4)
        if (!map[year]) {
            map[year] = []
        }
        map[year].push(week)
    }
    return map
})

const current = computed(() => store.selectedWeek)


function selectWeek(weekKey: string) {
    store.setSelectedWeek(weekKey)
    router.replace({ query: { ...route.query, week: weekKey } }).catch(() => { })
    isDropdownVisible.value = false
    store.setSelectedStation('') // Reset selected station when changing week
    store.eventSelectedStationCleared = true
}

let isDropdownVisible = ref(false)
</script>

<template>
    <div class="week-chooser" @click="isDropdownVisible = !isDropdownVisible">
        <div class="text-md">{{ weekDisplay }}</div>
        <div class="arrow">&#9660;</div>
    </div>
    <TransitionGroup name="fade" tag="div" :key="Number(isDropdownVisible)">
        <div class="week-dropdown" v-if="isDropdownVisible">
            <div class="dropdown-close text-teal mb-4 text-4xl text-right font-bold" @click="isDropdownVisible = false">
                &#10799;</div>
            <div v-for="(weekGroup, year) in weeksByYear" :key="year" class="mb-2">
                <div class="text-teal mb-4 text-4xl  font-bold">{{ year }}</div>
                <div class=" grid grid-cols-3 gap-2 text-base pt-4 pb-4">
                    <div v-for="wk in weekGroup" :key="wk"
                        class="px-3 py-2 cursor-pointer select-none border border-slate-300" :class="{
                            'bg-slate-100 border-slate-300': wk === current,
                            'hover:bg-slate-50': wk !== current
                        }" @click="selectWeek(wk)">
                        {{ displayMap[wk] }}
                    </div>
                </div>
            </div>
        </div>
    </TransitionGroup>
</template>

<script lang="ts">
import { defineComponent, TransitionGroup } from 'vue'

export default defineComponent({
    name: 'WeekChooser',
    components: {
        TransitionGroup
    }
})
</script>


<style scoped>
@reference "../assets/styles/global.css";

.week-chooser {
    @apply bg-teal-light text-teal-dark px-4 flex gap-2 justify-center items-center border-teal border-1 rounded-3xl;
}

.week-chooser .arrow {
    font-size: calc(var(--text-md) * 0.6);
}

.week-dropdown {
    @apply absolute left-0 bg-white p-8 w-screen;
    height: calc(100vh - var(--header-height));
    overflow-y: scroll;
    top: var(--header-height);
    z-index: 100;
    transition: opacity 1s ease;
}

.dropdown-close {
    margin-top: -1rem;
    margin-bottom: -1rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>
