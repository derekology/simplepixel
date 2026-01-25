<script setup lang="ts">
interface PixelEvent {
    timestamp: number;
    isReturning: boolean;
    country: string;
    region: string;
    browser: string;
    os: string;
    deviceType: string;
    params: Record<string, any>;
    notes: string | null;
}

const props = defineProps<{
    events: PixelEvent[];
}>();

function formatLocation(region: string, country: string) {
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
</script>

<template>
    <div>
        <div v-for="(event, index) in events.slice().reverse()" :key="index" class="event-card">
            <div class="event-header">
                <div>
                    <strong>{{ formatDate(event.timestamp) }}</strong>
                    <span class="time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <span v-if="!event.isReturning" class="new-user">New</span>
            </div>
            <div class="event-details">
                <div>Location: {{ formatLocation(event.region, event.country) }}</div>
                <div>Browser: {{ event.browser }} | OS: {{ event.os }} | Device: {{ event.deviceType }}</div>
                <div v-if="Object.keys(event.params).length">
                    Params:
                    <span v-for="(val, key) in event.params" :key="key">
                        {{ key }}={{ val }}&nbsp;
                    </span>
                </div>
                <div v-if="event.notes" class="notes">Notes: {{ event.notes }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.event-card {
    border-bottom: 1px solid #ddd;
    padding: 0.5rem 0;
}

.event-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
}

.time {
    margin-left: 0.5rem;
    color: #666;
    font-weight: normal;
}

.returning {
    color: green;
    font-weight: bold;
}

.new-user {
    color: blue;
    font-weight: bold;
}

.event-details {
    font-size: 0.85rem;
    color: #333;
}

.notes {
    font-style: italic;
    color: #666;
    margin-top: 0.25rem;
}
</style>
