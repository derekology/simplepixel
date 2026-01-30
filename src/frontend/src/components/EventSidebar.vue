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
    <div class="sidebar-container">
        <div v-if="props.events.length === 0" class="no-events">
            <p>No events yet</p>
        </div>
        <div v-else class="events-list">
            <div v-for="(event, index) in events.slice().reverse()" :key="index" class="event-card"
                @click="openModal(event)">
                <div class="event-header">
                    <div>
                        <span class="time">{{ formatTime(event.timestamp) }}</span><br />
                        <span class="date">{{ formatDate(event.timestamp) }}</span>
                    </div>
                    <div class="indicators">
                        <span v-if="!event.isReturning" class="new-user">New visitor</span>
                        <span v-if="event.notes" class="note-indicator" :title="'Warning: ' + event.notes">!</span>
                    </div>
                </div>
                <div class="event-details">
                    <div>📍{{ formatLocation(event.region, event.country) }}</div>
                </div>
            </div>
        </div>
        <EventModal :event="selectedEvent" @close="closeModal" />
    </div>
</template>

<style scoped>
.sidebar-container {
    padding: 0.5rem;
    height: 100%;
}

.no-events {
    padding: 2rem 1rem;
    text-align: center;
    color: #999;
    font-style: italic;
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-card {
    background: #FFFFFF;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.event-card:hover {
    background-color: #EEEEEE;
}

.event-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    align-items: center;
}

.time {
    font-weight: bold;
    font-size: 0.95rem;
    color: #333;
}

.date {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
}

.indicators {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.note-indicator {
    background: linear-gradient(135deg, #ffd54f 0%, #ffca28 100%);
    color: #333;
    font-weight: bold;
    border-radius: 2px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    cursor: help;
    position: relative;
}

.new-user {
    background: #dd3333;
    border-radius: 4px;
    padding: 3px 8px;
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.event-details {
    font-size: 0.85rem;
    color: #555;
}
</style>
