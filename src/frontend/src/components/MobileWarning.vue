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
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
}

.mobile-content {
    background: white;
    border-radius: 12px;
    padding: 2rem 1.5rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

h1 {
    font-size: 1.75rem;
    color: #333;
    margin: 0 0 1rem 0;
}

.message {
    font-size: 1rem;
    color: #555;
    margin: 0 0 1rem 0;
    line-height: 1.6;
}

.suggestion {
    font-size: 0.95rem;
    color: #666;
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
}

.info-box {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-left: 5px solid #ff9800;
}

.info-box p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    color: #555;
}

.current-width {
    font-weight: bold;
    color: #4a90e2;
}

.create-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.create-btn:active {
    transform: translateY(0);
}
</style>
