<template>
  <MobileWarning v-if="isMobile" />

  <NotFound v-else-if="pixelNotFound" />

  <div v-else class="app-container">
    <header class="top-bar">
      <h1 class="logo">simple pixel</h1>
      <div class="nav">
        <button v-if="stats.events.length > 0" class="nav-button" @click="navigateToNewPixel" title="New Pixel">
          new pixel
        </button>
        <button v-if="stats.events.length > 0" class="nav-button" @click="showHelp = !showHelp"
          :title="showHelp ? 'Stats' : 'Help'">
          <span v-if="showHelp">stats</span>
          <span v-else>help / about</span>
        </button>
        <button v-if="stats.events.length > 0" class="nav-button" @click="exportToCSV" title="Export to CSV">
          export csv
        </button>
        <button v-if="stats.events.length > 0" class="nav-button delete-button" @click="showDeleteModal = true"
          title="Delete Pixel">
          delete pixel
        </button>
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
import NotFound from './components/NotFound.vue';
import MobileWarning from './components/MobileWarning.vue';
import { onMounted, onUnmounted, reactive, ref, computed } from 'vue';

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
const screenWidth = ref(window.innerWidth);
const pixelNotFound = ref(false);

const isMobile = computed(() => screenWidth.value < 768);

function updateScreenWidth() {
  screenWidth.value = window.innerWidth;
}

function navigateToNewPixel() {
  window.location.href = '/create-pixel';
}

function exportToCSV() {
  const csvLines: string[] = [];

  csvLines.push('SUMMARY DATA');
  csvLines.push('');
  csvLines.push(`Pixel ID,${pixelId}`);
  csvLines.push(`Created At,${new Date(stats.pixel.createdAt).toISOString()}`);
  csvLines.push(`Expires At,${new Date(stats.pixel.expiresAt).toISOString()}`);
  csvLines.push(`Total Events,${stats.summary.totalEvents}`);
  csvLines.push(`Unique Users,${stats.summary.uniqueUsers}`);
  csvLines.push(`New Users,${stats.summary.newUsers}`);
  csvLines.push(`Returning Users,${stats.summary.returningUsers}`);
  csvLines.push(`Events per User,${stats.summary.eventsPerUser}`);
  csvLines.push('');

  if (Object.keys(stats.summary.countryCounts).length > 0) {
    csvLines.push('COUNTRY DISTRIBUTION');
    csvLines.push('Country,Count');
    Object.entries(stats.summary.countryCounts).forEach(([country, count]) => {
      csvLines.push(`${country},${count}`);
    });
    csvLines.push('');
  }

  if (Object.keys(stats.summary.deviceTypeCounts).length > 0) {
    csvLines.push('DEVICE TYPE DISTRIBUTION');
    csvLines.push('Device Type,Count');
    Object.entries(stats.summary.deviceTypeCounts).forEach(([device, count]) => {
      csvLines.push(`${device},${count}`);
    });
    csvLines.push('');
  }

  if (Object.keys(stats.summary.osCounts).length > 0) {
    csvLines.push('OPERATING SYSTEM DISTRIBUTION');
    csvLines.push('Operating System,Count');
    Object.entries(stats.summary.osCounts).forEach(([os, count]) => {
      csvLines.push(`${os},${count}`);
    });
    csvLines.push('');
  }

  if (Object.keys(stats.summary.browserCounts).length > 0) {
    csvLines.push('BROWSER DISTRIBUTION');
    csvLines.push('Browser,Count');
    Object.entries(stats.summary.browserCounts).forEach(([browser, count]) => {
      csvLines.push(`${browser},${count}`);
    });
    csvLines.push('');
  }

  if (stats.summary.parameterRows && stats.summary.parameterRows.length > 0) {
    csvLines.push('PARAMETER DATA');
    csvLines.push('Parameter,Value,Count');
    stats.summary.parameterRows.forEach((row: any) => {
      csvLines.push(`${row.parameter},${row.value},${row.count}`);
    });
    csvLines.push('');
  }

  csvLines.push('EVENT DATA');
  csvLines.push('Timestamp,Date,Time,Is Returning,Country,Region,Browser,OS,Device Type,Notes,Parameters');

  stats.events.forEach((event: any) => {
    const timestamp = new Date(event.timestamp);
    const dateStr = timestamp.toLocaleDateString();
    const timeStr = timestamp.toLocaleTimeString();
    const paramsStr = event.params ? JSON.stringify(event.params).replace(/"/g, '""') : '';
    const notes = event.notes ? `"${event.notes.replace(/"/g, '""')}"` : '';

    csvLines.push([
      event.timestamp,
      dateStr,
      timeStr,
      event.isReturning ? 'Yes' : 'No',
      event.country || '',
      event.region || '',
      event.browser || '',
      event.os || '',
      event.deviceType || '',
      notes,
      `"${paramsStr}"`
    ].join(','));
  });

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `simple-pixel-${pixelId}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  if (!initialStats || !initialStats.pixel || !initialStats.pixel.id) {
    pixelNotFound.value = true;
    return;
  }

  stats.pixel = initialStats.pixel;
  stats.events = initialStats.events;
  stats.summary = initialStats.summary;

  window.addEventListener('resize', updateScreenWidth);

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

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
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
  width: 330px;
  height: 100%;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}
</style>
