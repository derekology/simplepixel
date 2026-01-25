<script setup lang="ts">
import { onMounted } from "vue";

interface Stats {
  events: any[];
  summary: any;
}

function renderCharts(stats: Stats) {
  const chartContainer = document.getElementById("charts");
  if (!chartContainer) return;

  chartContainer.innerHTML = `<pre>${JSON.stringify(stats.events, null, 2)}</pre><pre>${JSON.stringify(stats.summary, null, 2)}</pre>`;
}

onMounted(() => {
  const initialStats: Stats = (window as any).__INITIAL_STATS__;
  const pixelId: string = (window as any).__PIXEL_ID__;

  renderCharts(initialStats);
  setInterval(async () => {
    const res = await fetch(`/stats/${pixelId}`);
    const stats = await res.json();
    renderCharts(stats);
  }, 5000);
});
</script>

<template>
  <div>
    <h1>Simple Pixel</h1>
    <div id="charts"></div>
  </div>
</template>

<style scoped></style>
