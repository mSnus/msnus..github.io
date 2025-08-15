<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    station: {
        type: String,
        required: true
    },
});
</script>

<template>
    <router-link :to="'/booking/' + props.id">
        <div class="text-md text-left pl-2 font-light">
            {{ props.station }}
        </div>
    </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BookingLineStation'
})
</script>
