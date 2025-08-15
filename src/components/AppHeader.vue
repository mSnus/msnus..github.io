<script setup lang="ts">
import logoUrl from '../assets/images/logo.svg'

const props = defineProps({
  showControls: {
    type: Boolean,
    required: true
  },
})
</script>

<template>
  <header class="app-header w-screen bg-teal-base sticky top-0 left-0 h-height overflow-hiddden z-10">
    <div class="app-header--container
      flex flex-wrap items-center   
      h-height
      gap-4 p-4 
      xl:w-10/12 2xl:w-8/12" :class="props.showControls ? 'justify-between  w-full m-auto' : 'justify-center'"
      id="app-header">
      <div class="flex items-center px-6 " :class="props.showControls ? 'w-full' : 'w-fit'">
        <img :src="logoUrl" alt="Logo" class="logo" />
      </div>
      <div class="flex items-stretch px-6 justify-between w-full" v-if="props.showControls">
        <WeekChooser />
        <StationSearch />
      </div>
    </div>
  </header>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WeekChooser from '@/components/WeekChooser.vue'
import StationSearch from '@/components/StationSearch.vue'

export default defineComponent({
  name: 'AppHeader',
  components: {
    WeekChooser,
    StationSearch
  }
})
</script>