<template>
  <div class="dashboard">
    <div class="sidebar">
      <Sidebar :events="stats.events" />
    </div>
    <div class="main-content">
      <!-- charts, maps, etc will go here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/EventSidebar.vue';
import { onMounted, reactive } from 'vue';

interface Stats {
  events: any[];
  summary: any;
}

const stats = reactive<Stats>({
  events: [],
  summary: {}
});

const initialStats: Stats = (window as any).__INITIAL_STATS__;
const pixelId: string = (window as any).__PIXEL_ID__;

onMounted(() => {
  stats.events = initialStats.events;
  stats.summary = initialStats.summary;

  setInterval(async () => {
    const res = await fetch(`/stats/${pixelId}`);
    const fetchedStats = await res.json();
    stats.events = fetchedStats.events;
    stats.summary = fetchedStats.summary;
  }, 5000);
});
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 20%;
  min-width: 250px;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid #ccc;
  padding: 1rem;
  background-color: #f9f9f9;
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}
</style>
