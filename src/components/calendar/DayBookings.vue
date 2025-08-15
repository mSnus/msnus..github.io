<script setup lang="ts">
import ArrowView from '@/assets/images/arrow-dn.svg';
import Dots from '@/assets/images/dots.svg';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const props = defineProps({
    number: {
        type: Number,
        required: true
    }
});


function bookings(count: number) {
    if (count === 0) {
        return 'no bookings';
    }

    if (count % 10 === 1) {
        return count.toString() + ' booking';
    }

    return count.toString() + ' bookings';
}

const displayNumber = bookings(props.number);

function handleClick() {
    toast.warning("Not implemented, but should lead to a page with all bookings for this day", {
        position: toast.POSITION.TOP_CENTER,
    });

}
</script>

<template>
    <div class="count-part flex items-center justify-center-safe gap-2 ml-2" @click="handleClick">
        <div class="header-bookings text-indigo text-md">+ {{ displayNumber }}</div>
        <div class="pl-2 pt-3">
            <component :is="Dots" class="header-dots" />
        </div>
        <!-- <div>
            <component :is="ArrowView" class="header-arrow" />
        </div> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'DayBookings'
})
</script>

<style scoped>
.header-arrow {
    height: var(--text-base);
    width: var(--text-base);
    display: inline-block;
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}

.header-dots {
    height: var(--text-base);
    width: calc(var(--text-base) * 2);
    display: inline-block;
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}

.header-bookings {
    padding-top: calc(var(--text-base) * 0.33);
    font-style: normal;
    font-weight: 400;
    color: var(--color-indigo-400);
}
</style>
