<template>
  <div class="dashboard">
    <div class="sidebar">
      <Sidebar :events="stats.events" />
    </div>
    <div class="main-content">
      <DashboardCharts :summary="stats.summary" :events="stats.events" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/EventSidebar.vue';
import DashboardCharts from './components/DashboardCharts.vue';
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

function hasStatsChanged(oldStats: Stats, newStats: Stats): boolean {
  if (oldStats.events.length !== newStats.events.length) return true;
  if (oldStats.summary.totalEvents !== newStats.summary.totalEvents) return true;
  
  const oldLastEvent = oldStats.events[oldStats.events.length - 1];
  const newLastEvent = newStats.events[newStats.events.length - 1];
  
  if (oldLastEvent?.timestamp !== newLastEvent?.timestamp) return true;
  
  return false;
}

onMounted(() => {
  stats.events = initialStats.events;
  stats.summary = initialStats.summary;

  setInterval(async () => {
    const res = await fetch(`/stats/${pixelId}`);
    const fetchedStats = await res.json();
    
    if (hasStatsChanged(stats, fetchedStats)) {
      stats.events = fetchedStats.events;
      stats.summary = fetchedStats.summary;
    }
  }, 5000);
});
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 300px;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid #ccc;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
}
</style>
