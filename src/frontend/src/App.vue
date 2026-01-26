<template>
  <div class="app-container">
    <header class="top-bar">
      <h1 class="logo">simple pixel</h1>
      <!-- <div class="nav-buttons">
        <button class="nav-btn" @click="navigateToNewPixel" title="Create New Pixel">
          New Pixel
        </button>
        <button class="nav-btn delete-btn" @click="showDeleteModal = true" title="Delete This Pixel">
          Delete Pixel
        </button>
        <button class="help-button" @click="showHelp = !showHelp" :title="showHelp ? 'Back to Dashboard' : 'Help'">
          <span v-if="showHelp">←</span>
          <span v-else>?</span>
        </button>
      </div> -->
      <div class="nav">
        <button v-if="stats.events.length > 0" class="nav-button" @click="navigateToNewPixel" title="New Pixel">new
          pixel</button>
        <button v-if="stats.events.length > 0" class="nav-button" @click="showHelp = !showHelp"
          :title="showHelp ? 'Stats' : 'Help'">
          <span v-if="showHelp">stats</span>
          <span v-else>help / about</span>
        </button>
        <button v-if="stats.events.length > 0" class="nav-button delete-button" @click="showDeleteModal = true"
          title="Delete Pixel">delete
          pixel</button>
      </div>
    </header>
    <div class="dashboard">
      <div class="sidebar">
        <Sidebar :events="stats.events" />
      </div>
      <div class="main-content">
        <HelpView v-if="showHelp || stats.events.length === 0" :pixelId="pixelId" />
        <DashboardCharts v-else :summary="stats.summary" :events="stats.events" :pixel="stats.pixel" />
      </div>
    </div>
    <DeletePixelModal v-if="showDeleteModal" :pixelId="pixelId" @close="showDeleteModal = false" />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/EventSidebar.vue';
import DashboardCharts from './components/DashboardCharts.vue';
import HelpView from './components/HelpView.vue';
import DeletePixelModal from './components/DeletePixelModal.vue';
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
const showDeleteModal = ref(false);

function navigateToNewPixel() {
  window.location.href = '/create-pixel';
}

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
  pointer-events: none;
  user-select: none;
  margin: 0.5rem 0.75rem;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav {
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-button {
  min-width: 100px;
  padding: 0.5rem 0.75rem;
  height: 100%;
  border: 0;
  background: #222222;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-button:hover {
  background: #444444;
}

.nav-button.delete-button {
  background: rgba(211, 47, 47, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
}

.nav-button.delete-button:hover {
  background: rgba(211, 47, 47, 0.5);
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
