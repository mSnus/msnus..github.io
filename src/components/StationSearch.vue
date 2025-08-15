<script setup lang="ts">
import { useDataStore } from '@/stores/main'
import { computed, ref, watch } from 'vue'


const store = useDataStore()
const stationList = computed(() => store.stations.map(s => s.name));

function setSelectedStation(): boolean {
    const stationName = (document.getElementById('station-search') as HTMLInputElement).value;

    const station = store.stations.find(s => s.name === stationName);

    if (station) {
        if (station.id !== store.selectedStation) {
            store.setSelectedStation(station.id);
        }
    } else {
        if ('' !== store.selectedStation) {
            store.setSelectedStation('');
        }
    }
    return true
}

function clearSelectedStation() {
    store.setSelectedStation('');
    (document.getElementById('station-search') as HTMLInputElement).value = '';
    store.eventSelectedStationCleared = false;
}

watch(() => store.eventSelectedStationCleared, val => {
    if (val) {
        (document.getElementById('station-search') as HTMLInputElement).value = '';
        store.eventSelectedStationCleared = false;
    }
})
</script>

<template>
    <div class="flex w-5/12 items-center">
        <div class="search-box font-encode text-md w-full justify-center">
            <input id="station-search" type="text" list="station-list" placeholder="Type station name" autocomplete="off"
                @input="setSelectedStation" />
            <datalist id="station-list" class="datalist">
                <option v-for="(item, index) in stationList" :key="index" :value="item">{{ item }}</option>
            </datalist>
        </div>
        <div class="text-white pl-2 p text-4xl flex-0 opacity-50" @click="clearSelectedStation"
            v-if="store.selectedStation">
            <div class="arrow">&#10799;</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'StationSearch'
})
</script>

<style scoped>
@reference "../assets/styles/global.css";

.search-box {
    @apply bg-teal-white px-6 py-2 rounded-3xl justify-center items-center flex;
    font-family: 'Encode Sans', sans-serif;
    color: #51C8B0;
}
</style>