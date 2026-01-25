<script setup lang="ts">
import { ref } from 'vue';
import EventModal from './EventModal.vue';

interface PixelEvent {
    timestamp: number;
    isReturning: boolean;
    country: string | null;
    region: string | null;
    browser: string | null;
    os: string | null;
    deviceType: string | null;
    params: Record<string, any>;
    notes: string | null;
}

const props = defineProps<{
    events: PixelEvent[];
}>();

const selectedEvent = ref<PixelEvent | null>(null);

function formatLocation(region: string | null, country: string | null) {
    if (region && country && region !== country && region !== "Unknown" && country !== "Unknown") {
        return `${region}, ${country}`;
    } else if (country && country !== "Unknown") {
        return country;
    } else {
        return "Unknown";
    }
}

function formatDate(ts: number) {
    const date = new Date(ts);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatTime(ts: number) {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function openModal(event: PixelEvent) {
    selectedEvent.value = event;
}

function closeModal() {
    selectedEvent.value = null;
}
</script>

<template>
    <div>
        <div v-for="(event, index) in events.slice().reverse()" :key="index" class="event-card"
            @click="openModal(event)">
            <div class="event-header">
                <div>
                    <span class="time">{{ formatTime(event.timestamp) }}</span>
                    <span class="date">{{ formatDate(event.timestamp) }}</span>
                    <span v-if="!event.isReturning" class="new-user">New user</span>
                </div>
                <div class="indicators">
                    <span v-if="event.notes" class="note-indicator" :title="event.notes">!</span>
                </div>
            </div>
            <div class="event-details">
                <div>{{ formatLocation(event.region, event.country) }}</div>
            </div>
        </div>
        <EventModal :event="selectedEvent" @close="closeModal" />
    </div>
</template>

<style scoped>
.event-card {
    padding: 1rem 0.75rem;
    border-bottom: #ccc solid 1px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.event-card:hover {
    background-color: #f0f0f0;
}

.event-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    align-items: center;
}

.time {
    font-weight: bold;
}

.date {
    margin: 0rem 0.5rem;
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
}

.indicators {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.note-indicator {
    background-color: #ff9800;
    color: white;
    font-weight: bold;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    cursor: help;
}

.new-user {
    background: #dd3333c4;
    border-radius: 3px;
    padding: 2px 6px;
    color: white;
    font-size: 0.7rem;
}

.event-details {
    font-size: 0.85rem;
    color: #333;
}
</style>
