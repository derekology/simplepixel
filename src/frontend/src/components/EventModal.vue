<script setup lang="ts">
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
    event: PixelEvent | null;
}>();

const emit = defineEmits<{
    close: [];
}>();

function formatDate(ts: number) {
    const date = new Date(ts);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatTime(ts: number) {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatLocation(region: string | null, country: string | null) {
    if (region && country && region !== country && region !== "Unknown" && country !== "Unknown") {
        return `${region}, ${country}`;
    } else if (country && country !== "Unknown") {
        return country;
    } else {
        return "Unknown";
    }
}

function formatNotes(notes: string | null) {
    if (!notes) return "No notes available.";
    const notesArray = notes.split(';').map(note => note.trim());
    return notesArray.join('\n');
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="event" class="modal-overlay" @click.self="emit('close')">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Details</h2>
                        <button class="close-btn" @click="emit('close')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-section">
                            <h3>Time & Location</h3>
                            <div class="detail-row">
                                <span class="label">Date:</span>
                                <span class="value">{{ formatDate(event.timestamp) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Time:</span>
                                <span class="value">{{ formatTime(event.timestamp) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Location:</span>
                                <span class="value">{{ formatLocation(event.region, event.country) }}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3>Device Information</h3>
                            <div class="detail-row">
                                <span class="label">Browser:</span>
                                <span class="value">{{ event.browser || 'Unknown' }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">OS:</span>
                                <span class="value">{{ event.os || 'Unknown' }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Device Type:</span>
                                <span class="value">{{ event.deviceType || 'Unknown' }}</span>
                            </div>
                        </div>

                        <div v-if="Object.keys(event.params).length" class="detail-section">
                            <h3>Parameters</h3>
                            <div class="params-grid">
                                <div v-for="(value, key) in event.params" :key="key" class="param-row">
                                    <span class="param-key">{{ key }}</span>
                                    <span class="param-value">{{ value }}</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="event.notes" class="detail-section">
                            <h3>Warnings</h3>
                            <div class="notes-content">{{ formatNotes(event.notes) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 var(--shadow-sm) 6px rgba(0, 0, 0, 0.1);
    padding: var(--spacing-lg);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
}

.modal-header h2 {
    margin: 0;
    font-size: var(--spacing-lg);
    color: var(--color-text-primary);
}

.close-btn {
    background: none;
    border: none;
    font-size: var(--spacing-xl);
    cursor: pointer;
    color: var(--color-text-light);
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #f0f0f0;
}

.detail-section {
    margin-bottom: var(--spacing-lg);
}

.detail-section:last-child {
    margin-bottom: 0;
}

.detail-section h3 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.var(--spacing-md);
    color: var(--color-text-primary);
    border-bottom: 2px solid #e5e5e5;
    padding-bottom: var(--spacing-sm);
}

.detail-row {
    display: flex;
    padding: var(--spacing-sm) 0;
}

.label {
    font-weight: 600;
    color: var(--color-text-light);
    min-width: 150px;
}

.value {
    color: var(--color-text-primary);
}

.notes-content {
    padding: var(--spacing-md);
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    white-space: pre-wrap;
}

.params-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.param-row {
    display: flex;
    padding: 0.75rem;
    border-bottom: #ccc solid 1px;
}

.param-key {
    font-weight: bold;
    min-width: 150px;
    word-break: break-word;
}

.param-value {
    color: var(--color-text-primary);
    word-break: break-word;
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: scale(0.9);
}
</style>
