<template>
  <div class="demo-banner">
    <div class="demo-banner-content">
      <span class="demo-icon">⚠️</span>
      <span class="demo-text">
        While this demo is usually fully functional, we recommend you
        <a href="https://github.com/derekology/simple-pixel" target="_blank" rel="noopener noreferrer"
          class="demo-link">host your own instance</a>.
      </span>
    </div>
  </div>
</template>

<style scoped>
.demo-banner {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  padding: 0.5rem 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.demo-banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.demo-icon {
  font-size: 1.25rem;
  margin-top: -5px;
}

.demo-text {
  font-size: 0.95rem;
  font-weight: 500;
}

.demo-link {
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.demo-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}
</style>
