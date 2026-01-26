<template>
    <div class="not-found-container">
        <div class="not-found-content">
            <div class="icon">🔍</div>
            <h1>Pixel Not Found</h1>
            <p class="message">
                The pixel you're looking for doesn't exist or may have expired.
            </p>
            <p class="info">
                Pixels are automatically deleted 7 days after creation. If this pixel was created more than a week ago,
                it's been permanently removed.
            </p>
            <button class="create-btn" @click="createNewPixel">
                Create New Pixel
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
function createNewPixel() {
    window.location.href = '/create-pixel';
}
</script>

<style scoped>
.not-found-container {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
}

.not-found-content {
    background: white;
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
    font-size: 5rem;
    margin-bottom: 1rem;
}

h1 {
    font-size: 2rem;
    color: #333;
    margin: 0 0 1rem 0;
}

.message {
    font-size: 1.1rem;
    color: #555;
    margin: 0 0 1rem 0;
    line-height: 1.6;
}

.info {
    font-size: 0.95rem;
    color: #666;
    margin: 0 0 2rem 0;
    line-height: 1.6;
    padding: 1rem;
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border-left: 5px solid #ff9800;
    border-radius: 4px;
}

.create-btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    background: #dd3333;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.create-btn:hover {
    background-color: #bb2a2a;
}

.create-btn:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    .not-found-container {
        padding: 1rem;
    }

    .not-found-content {
        padding: 2rem 1.5rem;
    }

    h1 {
        font-size: 1.5rem;
    }

    .icon {
        font-size: 4rem;
    }
}
</style>
