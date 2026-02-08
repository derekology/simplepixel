<template>
  <div class="app-container">
    <MobileWarning v-if="isMobile" />
    <div v-else>
      <DemoBanner v-if="isDemo" />

      <NotFound v-if="pixelNotFound" />

      <HelpView v-else-if="stats.events.length === 0" :pixelId="pixelId" :isDemo="isDemo" />

      <div v-else>
        <header class="top-bar">
          <h1 class="logo"><span class="logo-highlight">::</span>simple pixel<span class="byline"
              @click="goToWebsite">by
              derekw</span></h1>
          <div class="nav">
            <button class="nav-button" @click="navigateToNewPixel" title="New Pixel">
              new pixel
            </button>
            <button class="nav-button" @click="exportToCSV" title="Export to CSV">
              export csv
            </button>
            <button class="nav-button delete-button" @click="showDeleteModal = true" title="Delete Pixel">
              delete pixel
            </button>
            <button class="nav-button" @click="showHelp = !showHelp" :title="showHelp ? 'Stats' : 'Help'">
              <span v-if="showHelp">stats</span>
              <span v-else>help / about</span>
            </button>
          </div>
        </header>
        <div class="dashboard" :class="{ 'has-demo-banner': isDemo }">
          <div class="sidebar">
            <Sidebar :events="stats.events" />
          </div>
          <div class="main-content">
            <HelpView v-if="showHelp || stats.events.length === 0" :pixelId="pixelId" :isDemo="isDemo" />
            <DashboardCharts v-else :summary="stats.summary" :events="stats.events" :pixel="stats.pixel" />
          </div>
        </div>
        <DeletePixelModal v-if="showDeleteModal" :pixelId="pixelId" @close="showDeleteModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/EventSidebar.vue';
import DashboardCharts from './components/DashboardCharts.vue';
import HelpView from './components/HelpView.vue';
import DeletePixelModal from './components/DeletePixelModal.vue';
import NotFound from './components/NotFound.vue';
import MobileWarning from './components/MobileWarning.vue';
import DemoBanner from './components/DemoBanner.vue';
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

const MOBILE_BREAKPOINT = 768;
const POLL_INTERVAL = 5000;

const stats = reactive<Stats>({
  pixel: { id: '', createdAt: 0, expiresAt: 0 },
  events: [],
  summary: {}
});

const showHelp = ref(false);
const showDeleteModal = ref(false);
const screenWidth = ref(window.innerWidth);
const pixelNotFound = ref(false);

const isMobile = computed(() => screenWidth.value < MOBILE_BREAKPOINT);

const initialStats: Stats = (window as any).__INITIAL_STATS__;
const pixelId: string = (window as any).__PIXEL_ID__;
const nodeEnv: string = (window as any).__NODE_ENV__ || 'development';

const isDemo = computed(() => nodeEnv === 'demo');

function updateScreenWidth() {
  screenWidth.value = window.innerWidth;
}

function navigateToNewPixel() {
  window.location.href = '/';
}

function goToWebsite() {
  window.open('https://derekw.co/?utm_medium=referral&utm_source=simple-pixel', '_blank');
}

function escapeCSVValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function addCSVSection(lines: string[], title: string, header: string, data: Record<string, any>) {
  if (Object.keys(data).length === 0) return;

  lines.push(title);
  lines.push(header);
  Object.entries(data).forEach(([key, value]) => {
    lines.push(`${key},${value}`);
  });
  lines.push('');
}

function buildSummaryCSV(lines: string[]) {
  lines.push('SUMMARY DATA');
  lines.push('');
  lines.push(`Pixel ID,${pixelId}`);
  lines.push(`Created At,${new Date(stats.pixel.createdAt).toISOString()}`);
  lines.push(`Expires At,${new Date(stats.pixel.expiresAt).toISOString()}`);
  lines.push(`Total Events,${stats.summary.totalEvents}`);
  lines.push(`Unique Users,${stats.summary.uniqueUsers}`);
  lines.push(`New Users,${stats.summary.newUsers}`);
  lines.push(`Returning Users,${stats.summary.returningUsers}`);
  lines.push(`Events per User,${stats.summary.eventsPerUser}`);
  lines.push('');
}

function buildDistributionCSV(lines: string[]) {
  addCSVSection(lines, 'COUNTRY DISTRIBUTION', 'Country,Count', stats.summary.countryCounts);
  addCSVSection(lines, 'DEVICE TYPE DISTRIBUTION', 'Device Type,Count', stats.summary.deviceTypeCounts);
  addCSVSection(lines, 'OPERATING SYSTEM DISTRIBUTION', 'Operating System,Count', stats.summary.osCounts);
  addCSVSection(lines, 'BROWSER DISTRIBUTION', 'Browser,Count', stats.summary.browserCounts);
}

function buildParameterCSV(lines: string[]) {
  if (!stats.summary.parameterRows || stats.summary.parameterRows.length === 0) return;

  lines.push('PARAMETER DATA');
  lines.push('Parameter,Value,Count');
  stats.summary.parameterRows.forEach((row: any) => {
    lines.push(`${row.parameter},${row.value},${row.count}`);
  });
  lines.push('');
}

function buildEventCSV(lines: string[]) {
  lines.push('EVENT DATA');
  lines.push('Timestamp,Date,Time,Is Returning,Country,Region,Browser,OS,Device Type,Notes,Parameters');

  stats.events.forEach((event: any) => {
    const timestamp = new Date(event.timestamp);
    const dateStr = timestamp.toLocaleDateString();
    const timeStr = timestamp.toLocaleTimeString();
    const paramsStr = event.params ? JSON.stringify(event.params).replace(/"/g, '""') : '';
    const notes = event.notes ? escapeCSVValue(event.notes) : '';

    lines.push([
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
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToCSV() {
  const csvLines: string[] = [];

  buildSummaryCSV(csvLines);
  buildDistributionCSV(csvLines);
  buildParameterCSV(csvLines);
  buildEventCSV(csvLines);

  const csvContent = csvLines.join('\n');
  const filename = `simple-pixel-${pixelId}-${Date.now()}.csv`;
  downloadCSV(csvContent, filename);
}

function hasStatsChanged(oldStats: Stats, newStats: Stats): boolean {
  if (oldStats.events.length !== newStats.events.length) return true;
  if (oldStats.summary.totalEvents !== newStats.summary.totalEvents) return true;

  const oldLastEvent = oldStats.events[oldStats.events.length - 1];
  const newLastEvent = newStats.events[newStats.events.length - 1];

  if (oldLastEvent?.timestamp !== newLastEvent?.timestamp) return true;

  return false;
}

function updateStats(newStats: Stats) {
  stats.pixel = newStats.pixel;
  stats.events = newStats.events;
  stats.summary = newStats.summary;
}

async function pollStats() {
  const res = await fetch(`/stats/${pixelId}`);
  const fetchedStats = await res.json();

  if (hasStatsChanged(stats, fetchedStats)) {
    updateStats(fetchedStats);
  }
}

onMounted(() => {
  if (!initialStats || !initialStats.pixel || !initialStats.pixel.id) {
    pixelNotFound.value = true;
    return;
  }

  updateStats(initialStats);

  window.addEventListener('resize', updateScreenWidth);

  setInterval(pollStats, POLL_INTERVAL);
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
  background: var(--color-bg-dark);
  color: var(--color-text-white);
  box-shadow: var(--shadow-md);
  ;
  border-top: 5px solid var(--color-primary);
  height: var(--top-bar-height);
}

.logo {
  pointer-events: none;
  user-select: none;
  margin: var(--spacing-sm) 0.75rem;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.logo-highlight {
  color: var(--color-primary);
  font-weight: 900;
  margin-right: var(--radius-sm);
  font-size: 0.75rem;
}

.byline {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-left: var(--radius-sm);
  cursor: pointer;
  pointer-events: auto;
  font-style: italic;
  transition: var(--slow-transition);
}

.byline:hover {
  color: var(--color-text-white);
}

.nav {
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-button {
  min-width: 100px;
  padding: var(--spacing-sm) 0.75rem;
  height: 100%;
  border: 0;
  background: var(--color-bg-dark);
  color: var(--color-text-white);
  cursor: pointer;
  transition: var(--slow-transition);
}

.nav-button:hover {
  background: var(--color-bg-hover);
}

.nav-button.delete-button {
  background: var(--color-danger-light);
}

.nav-button.delete-button:hover {
  background: var(--color-danger-hover);
}

.dashboard {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  height: calc(100vh - var(--top-bar-height));
  overflow-y: auto;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  height: calc(100vh - var(--top-bar-height));
  overflow-y: auto;
  min-width: 0;
}

.dashboard.has-demo-banner .sidebar {
  height: calc(100vh - var(--top-bar-height) - var(--top-banner-height));
}

.dashboard.has-demo-banner .main-content {
  height: calc(100vh - var(--top-bar-height) - var(--top-banner-height));
}
</style>
