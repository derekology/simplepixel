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
                    <div><span class="device-emoji">{{ getDeviceEmoji(event.deviceType) }}</span>{{
                        formatLocation(event.region, event.country) }}</div>
                </div>
            </div>
        </div>
        <EventModal :event="selectedEvent" @close="closeModal" />
    </div>
</template>

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

function getDeviceEmoji(deviceType: string | null): string {
    if (!deviceType) return '🔳';
    const type = deviceType.toLowerCase();
    if (type.includes('mobile')) return '📱';
    if (type.includes('tablet')) return '🔳';
    if (type.includes('desktop') || type.includes('pc')) return '💻';
    return '❔';
}

function openModal(event: PixelEvent) {
    selectedEvent.value = event;
}

function closeModal() {
    selectedEvent.value = null;
}
</script>

<style scoped>
.sidebar-container {
    padding: var(--spacing-sm);
    height: calc(100vh - var(--top-bar-height));
    overflow-y: scroll;
}

.sidebar-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
    margin: var(--spacing-sm) var(--spacing-sm) var(--spacing-md) var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--color-primary);
}

.no-events {
    padding: var(--spacing-xl) var(--spacing-md);
    text-align: center;
    color: var(--color-text-lighter);
    font-style: italic;
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-card {
    background: var(--color-bg-white);
    padding: 0.75rem;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: var(--transition-normal);
    box-shadow: var(--shadow-sm);
}

.event-card:hover {
    background-color: var(--color-bg-light);
}

.event-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
    align-items: center;
}

.device-emoji {
    font-size: 0.8rem;
    margin-right: 0.35rem;
}

.time {
    font-weight: bold;
    font-size: 0.95rem;
    color: var(--color-text);
}

.date {
    font-size: 0.8rem;
    color: var(--color-text-light);
    font-style: italic;
}

.indicators {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.note-indicator {
    background: linear-gradient(135deg, var(--color-note) 0%, var(--color-note-alt) 100%);
    color: var(--color-text);
    font-weight: bold;
    border-radius: var(--radius-sm);
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
    background: var(--color-primary);
    border-radius: var(--radius-sm);
    padding: 3px 8px;
    color: var(--color-text-white);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.event-details {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
}
</style>
