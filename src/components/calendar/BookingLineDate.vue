<script setup lang="ts">
import dayjs from 'dayjs';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
});

const bookDate = dayjs(props.date).format('MMMM D, YYYY') 
</script>

<template>
    <router-link :to="'/booking/' + props.id">
        <div class="text-md text-left pl-2 font-bold">
            {{ bookDate }}
        </div>
    </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BookingLineDate'
})
</script>
