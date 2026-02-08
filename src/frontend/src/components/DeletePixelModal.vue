<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    pixelId: string;
}>();

const emit = defineEmits<{
    close: [];
}>();

const deleteInput = ref('');
const isDeleting = ref(false);
const error = ref('');

async function handleDelete() {
    if (deleteInput.value !== 'delete') {
        error.value = 'Please type "delete" to confirm';
        return;
    }

    isDeleting.value = true;
    error.value = '';

    try {
        const response = await fetch(`/delete/${props.pixelId}`, {
            method: 'POST'
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            error.value = 'Failed to delete pixel';
            isDeleting.value = false;
        }
    } catch (err) {
        error.value = 'An error occurred while deleting';
        isDeleting.value = false;
    }
}
</script>

<template>
    <Teleport to="body">
        <div class="modal-overlay" @click.self="emit('close')">
            <Transition name="modal" appear>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Delete Pixel</h2>
                        <button class="close-btn" @click="emit('close')" :disabled="isDeleting">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="warning-section">
                            <div class="warning-icon">⚠️</div>
                            <p class="warning-text">
                                This action cannot be undone. This will permanently delete the pixel
                                <strong>{{ pixelId }}</strong> and all associated event data.
                            </p>
                        </div>

                        <div class="confirm-section">
                            <label for="delete-input">
                                Type <strong>"delete"</strong> to confirm:
                            </label>
                            <input id="delete-input" v-model="deleteInput" type="text" placeholder="delete"
                                :disabled="isDeleting" @keyup.enter="handleDelete" />
                        </div>

                        <div v-if="error" class="error-message">{{ error }}</div>

                        <div class="button-group">
                            <button class="btn-cancel" @click="emit('close')" :disabled="isDeleting">
                                Cancel
                            </button>
                            <button class="btn-delete" @click="handleDelete"
                                :disabled="isDeleting || deleteInput !== 'delete'">
                                {{ isDeleting ? 'Deleting...' : 'Delete Pixel' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 var(--shadow-sm) 6px rgba(0, 0, 0, 0.1);
    padding: var(--spacing-lg);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    font-size: var(--spacing-lg);
    color: var(--color-text);
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

.close-btn:hover:not(:disabled) {
    background-color: var(--color-bg-light);
}

.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-body {
    padding: var(--spacing-lg);
}

.warning-section {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-warning-gradient);
    border-left: 5px solid var(--color-warning);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-lg);
}

.warning-icon {
    font-size: var(--spacing-xl);
    flex-shrink: 0;
}

.warning-text {
    margin: 0;
    color: var(--color-text);
    line-height: 1.6;
}

.confirm-section {
    margin-bottom: var(--spacing-lg);
}

.confirm-section label {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-light);
    font-size: 0.95rem;
}

.confirm-section input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 6px;
    font-size: var(--spacing-md);
    transition: border-color 0.2s;
}

.confirm-section input:focus {
    outline: none;
    border-color: var(--color-danger);
}

.confirm-section input:disabled {
    background-color: var(--color-bg-light);
    cursor: not-allowed;
}

.error-message {
    color: var(--color-text);
    background-color: var(--color-bg-light);
    padding: 0.75rem;
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-md);
    font-size: 0.9rem;
}

.button-group {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
}

.btn-cancel,
.btn-delete {
    padding: 0.75rem var(--spacing-lg);
    border: none;
    border-radius: 6px;
    font-size: var(--spacing-md);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.btn-cancel {
    background-color: var(--color-bg-light);
    color: var(--color-text);
}

.btn-cancel:hover:not(:disabled) {
    background-color: var(--color-bg);
}

.btn-delete {
    background-color: var(--color-danger);
    color: var(--color-text);
}

.btn-delete:hover:not(:disabled) {
    background-color: var(--color-danger-dark);
}

.btn-delete:disabled {
    background-color: var(--color-bg);
    color: var(--color-text-lighter);
    cursor: not-allowed;
}

.modal-overlay {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-enter-active {
    transition: all 0.3s ease;
}

.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from {
    opacity: 0;
    transform: scale(0.9);
}

.modal-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>
