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
    window.location.href = '/';
}
</script>

<style scoped>
.not-found-container {
    padding: var(--spacing-xl);
    max-width: 600px;
    margin: 0 auto;
}

.not-found-content {
    background: white;
    border-radius: 12px;
    padding: 3rem var(--spacing-xl);
    text-align: center;
    box-shadow: var(--shadow-md);
}

.icon {
    font-size: 5rem;
    margin-bottom: var(--spacing-md);
}

h1 {
    font-size: var(--spacing-xl);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-md) 0;
}

.message {
    font-size: 1.var(--spacing-md);
    color: #555;
    margin: 0 0 var(--spacing-md) 0;
    line-height: 1.6;
}

.info {
    font-size: 0.95rem;
    color: var(--color-text-light);
    margin: 0 0 var(--spacing-xl) 0;
    line-height: 1.6;
    padding: var(--spacing-md);
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border-left: 5px solid #ff9800;
    border-radius: var(--radius-sm);
}

.create-btn {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: 1.var(--spacing-md);
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
        padding: var(--spacing-md);
    }

    .not-found-content {
        padding: var(--spacing-xl) var(--spacing-lg);
    }

    h1 {
        font-size: var(--spacing-lg);
    }

    .icon {
        font-size: 4rem;
    }
}
</style>
