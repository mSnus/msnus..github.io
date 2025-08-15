<script setup lang="ts">
import ArrowUp from '@/assets/images/pick-up.svg';
import ArrowDown from '@/assets/images/return.svg';


const props = defineProps({
    id: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    pickUp: {
        type: Boolean,
        required: true
    },
});
</script>

<template>
    <router-link :to="'/booking/' + props.id">
        <div class="booking-line-time flex flex-row justify-end items-center gap-2">
            <div class="booking-time text-right text-md font-light ml-4"
                :class="{ 'text-pink-400': !props.pickUp, 'text-teal-500': props.pickUp }">{{
                    props.time }}
            </div>
            <div class="operation-icon">
                <component :is="props.pickUp ? ArrowUp : ArrowDown" />
            </div>
        </div>
    </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BookingLineTime'
})
</script>

<style scoped>
.operation-icon {
    height: calc(var(--text-base) * 1);
    width: calc(var(--text-base) * 1);
    left: 0;
    top: 0;
    display: inline-block;
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}
</style>
