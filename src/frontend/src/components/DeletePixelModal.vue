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
            window.location.href = '/create-pixel';
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
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #d32f2f;
}

.close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.close-btn:hover:not(:disabled) {
    background-color: #f0f0f0;
}

.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-body {
    padding: 1.5rem;
}

.warning-section {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border-left: 5px solid #ff9800;
    border-radius: 4px;
    margin-bottom: 1.5rem;
}

.warning-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.warning-text {
    margin: 0;
    color: #333;
    line-height: 1.6;
}

.confirm-section {
    margin-bottom: 1.5rem;
}

.confirm-section label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-size: 0.95rem;
}

.confirm-section input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.confirm-section input:focus {
    outline: none;
    border-color: #d32f2f;
}

.confirm-section input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.error-message {
    color: #d32f2f;
    background-color: #ffebee;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.button-group {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-cancel,
.btn-delete {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.btn-cancel {
    background-color: #f5f5f5;
    color: #333;
}

.btn-cancel:hover:not(:disabled) {
    background-color: #e0e0e0;
}

.btn-delete {
    background-color: #d32f2f;
    color: white;
}

.btn-delete:hover:not(:disabled) {
    background-color: #b71c1c;
}

.btn-delete:disabled {
    background-color: #e0e0e0;
    color: #999;
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
