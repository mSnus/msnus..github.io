<template>
  <AppHeader :showControls="true" />
  <BookingCalendar />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BookingCalendar from '@/components/BookingCalendar.vue'

export default defineComponent({
  name: 'HomePage',
  components: { AppHeader, BookingCalendar },
})
</script>
