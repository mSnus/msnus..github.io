<script setup lang="ts">

const props = defineProps({
    date: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    }
});

const dayClass = ['sat', 'sun'].includes(props.day.toLowerCase()) ? 'text-blue-500' : 'text-gray-400';
</script>

<template>
    <div class="day-part flex items-center justify-center">
        <div class="header-date font-work font-bold text-md text-left">{{ date }}</div>
        <div class="header-day text-base pl-2 pb-1 uppercase text-left" :class="dayClass">{{ day }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'DayDate'
})
</script>

<style scoped>
.day-part {
    margin-right: -0.2rem;
}

.header-day {
    padding-top: calc(var(--text-base) * 0.35);
    font-style: normal;
    font-weight: 500;
    text-align: right;
}
</style>
