<template>
    <div class="mobile-warning">
        <div class="mobile-content">
            <div class="icon">📱</div>
            <h1>Screen Too Small</h1>
            <p class="message">
                Simple Pixel requires a wider screen to display the dashboard properly.
            </p>
            <p class="suggestion">
                Please use a tablet, laptop, or desktop computer to view your pixel statistics.
            </p>
            <div class="info-box">
                <p><strong>Minimum width required:</strong> 768px</p>
                <p><strong>Your current width:</strong> <span class="current-width">{{ screenWidth }}px</span></p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const screenWidth = ref(window.innerWidth);

function updateWidth() {
    screenWidth.value = window.innerWidth;
}

onMounted(() => {
    window.addEventListener('resize', updateWidth);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
});
</script>

<style scoped>
.mobile-warning {
    padding: var(--spacing-xl);
    max-width: 600px;
    margin: 0 auto;
}

.mobile-content {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-xl) var(--spacing-lg);
    text-align: center;
    box-shadow: var(--shadow-md);
}

.icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
}

h1 {
    font-size: 1.75rem;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-md) 0;
}

.message {
    font-size: var(--spacing-md);
    color: #555;
    margin: 0 0 var(--spacing-md) 0;
    line-height: 1.6;
}

.suggestion {
    font-size: 0.95rem;
    color: var(--color-text-light);
    margin: 0 0 var(--spacing-lg) 0;
    line-height: 1.6;
}

.info-box {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    border-left: 5px solid #ff9800;
}

.info-box p {
    margin: var(--spacing-sm) 0;
    font-size: 0.9rem;
    color: #555;
}

.current-width {
    font-weight: bold;
    color: #4a90e2;
}

.create-btn {
    padding: 0.75rem var(--spacing-lg);
    font-size: var(--spacing-md);
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 var(--shadow-sm) 12px rgba(102, 126, 234, 0.4);
}

.create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.create-btn:active {
    transform: translateY(0);
}
</style>
