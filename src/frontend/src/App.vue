<template>
  <div class="app-container">
    <header class="top-bar">
      <h1 class="logo">simple pixel</h1>
      <div class="nav">
        <button class="nav-button" @click="showHelp = !showHelp" :title="showHelp ? 'Stats' : 'Help'">
          <span v-if="stats.events.length === 0"></span>
          <span v-else-if="showHelp">stats</span>
          <span v-else>help / about</span>
        </button>
      </div>
    </header>
    <div class="dashboard">
      <div class="sidebar">
        <Sidebar :events="stats.events" />
      </div>
      <div class="main-content">
        <HelpView v-if="showHelp || stats.events.length === 0" />
        <DashboardCharts v-else :summary="stats.summary" :events="stats.events" :pixel="stats.pixel" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/EventSidebar.vue';
import DashboardCharts from './components/DashboardCharts.vue';
import HelpView from './components/HelpView.vue';
import { onMounted, reactive, ref } from 'vue';

interface Stats {
  pixel: {
    id: string;
    createdAt: number;
    expiresAt: number;
  };
  events: any[];
  summary: any;
}

const stats = reactive<Stats>({
  pixel: { id: '', createdAt: 0, expiresAt: 0 },
  events: [],
  summary: {}
});

const showHelp = ref(false);

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
  stats.pixel = initialStats.pixel;
  stats.events = initialStats.events;
  stats.summary = initialStats.summary;

  setInterval(async () => {
    const res = await fetch(`/stats/${pixelId}`);
    const fetchedStats = await res.json();

    if (hasStatsChanged(stats, fetchedStats)) {
      stats.pixel = fetchedStats.pixel;
      stats.events = fetchedStats.events;
      stats.summary = fetchedStats.summary;
    }
  }, 5000);
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222222;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-top: 5px solid #dd3333;
  height: 50px;
}

.logo {
  margin: 0.5rem 0.75rem;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav {
  display: flex;
  height: 100%;
}

.nav-button {
  padding: 0.5rem 0.75rem;
  height: 100%;
  border: 0;
  background: #222222;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background: #ffffff0c;
}

.dashboard {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #ccc;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
}
</style>
