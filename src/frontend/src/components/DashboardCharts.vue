<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale, type ChartConfiguration } from 'chart.js';
import VisitorMap from './VisitorMap.vue';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale);

interface StatsSummary {
    totalEvents: number;
    uniqueUsers: number;
    newUsers: number;
    returningUsers: number;
    eventsPerUser: number;
    countryCounts: Record<string, number>;
    deviceTypeCounts: Record<string, number>;
    osCounts: Record<string, number>;
    browserCounts: Record<string, number>;
    parameterRows: Array<{ parameter: string; value: string; count: number }>;
}

interface PixelEvent {
    timestamp: number;
    isReturning: boolean;
    country: string | null;
    region: string | null;
    browser: string | null;
    os: string | null;
    deviceType: string | null;
    params: Record<string, any>;
    notes: string | null;
}

interface PixelMetadata {
    id: string;
    createdAt: number;
    expiresAt: number;
}

const props = defineProps<{
    summary: StatsSummary;
    events: PixelEvent[];
    pixel: PixelMetadata;
}>();

const timeSeriesChart = ref<HTMLCanvasElement | null>(null);
const userTypeChart = ref<HTMLCanvasElement | null>(null);
const countryChart = ref<HTMLCanvasElement | null>(null);
const deviceChart = ref<HTMLCanvasElement | null>(null);
const osChart = ref<HTMLCanvasElement | null>(null);
const browserChart = ref<HTMLCanvasElement | null>(null);

let timeSeriesChartInstance: Chart | null = null;
let userTypeChartInstance: Chart | null = null;
let countryChartInstance: Chart | null = null;
let deviceChartInstance: Chart | null = null;
let osChartInstance: Chart | null = null;
let browserChartInstance: Chart | null = null;

const chartColors = [
    '#4a90e2', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#3498db', '#95a5a6', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#c0392b'
];

function getTopItems(data: Record<string, number>, limit: number = 8) {
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, limit);
    const others = sorted.slice(limit);

    if (others.length > 0) {
        const othersSum = others.reduce((sum, [_, count]) => sum + count, 0);
        top.push(['Others', othersSum]);
    }

    return {
        labels: top.map(([label]) => label),
        data: top.map(([_, count]) => count)
    };
}

function createPieChart(canvas: HTMLCanvasElement, labels: string[], data: number[], title: string): Chart {
    const ctx = canvas.getContext('2d')!;
    const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: chartColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    return new Chart(ctx, config);
}

function groupEventsByTimeInterval(events: PixelEvent[], pixelCreatedAt: number, pixelExpiresAt: number): { labels: string[], data: number[] } {
    const now = Date.now();
    const startTime = pixelCreatedAt;
    const endTime = Math.min(now, pixelExpiresAt);
    const timeRangeMs = endTime - startTime;

    let intervalMs: number;
    let formatLabel: (date: Date) => string;

    if (timeRangeMs < 3600000) {
        intervalMs = 300000;
        formatLabel = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (timeRangeMs < 86400000) {
        intervalMs = 3600000;
        formatLabel = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric' });
    } else if (timeRangeMs < 2592000000) {
        intervalMs = 86400000;
        formatLabel = (date) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[date.getMonth()]} ${date.getDate()}`;
        };
    } else {
        intervalMs = 2592000000;
        formatLabel = (date) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
        };
    }

    const buckets = new Map<number, number>();

    events.forEach(event => {
        const bucketIndex = Math.floor((event.timestamp - startTime) / intervalMs);
        buckets.set(bucketIndex, (buckets.get(bucketIndex) || 0) + 1);
    });

    const totalBuckets = Math.ceil((endTime - startTime) / intervalMs);
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 0; i < totalBuckets; i++) {
        const bucketTime = startTime + (i * intervalMs);
        labels.push(formatLabel(new Date(bucketTime)));
        data.push(buckets.get(i) || 0);
    }

    return { labels, data };
}

function createTimeSeriesChart(canvas: HTMLCanvasElement): Chart {
    const ctx = canvas.getContext('2d')!;
    const { labels, data } = groupEventsByTimeInterval(props.events, props.pixel.createdAt, props.pixel.expiresAt);

    const config: ChartConfiguration = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Events',
                data,
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#4a90e2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: '#e5e5e5'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };
    return new Chart(ctx, config);
}

function initCharts() {
    if (timeSeriesChart.value && props.events.length > 0) {
        timeSeriesChartInstance = createTimeSeriesChart(timeSeriesChart.value);
    }

    if (userTypeChart.value && props.summary.totalEvents > 0) {
        userTypeChartInstance = createPieChart(
            userTypeChart.value,
            ['New Users', 'Returning Users'],
            [props.summary.newUsers, props.summary.returningUsers],
            'User Type Distribution'
        );
    }

    if (countryChart.value && Object.keys(props.summary.countryCounts).length > 0) {
        const countryData = getTopItems(props.summary.countryCounts);
        countryChartInstance = createPieChart(
            countryChart.value,
            countryData.labels,
            countryData.data,
            'Countries'
        );
    }

    if (deviceChart.value && Object.keys(props.summary.deviceTypeCounts).length > 0) {
        const deviceData = getTopItems(props.summary.deviceTypeCounts);
        deviceChartInstance = createPieChart(
            deviceChart.value,
            deviceData.labels,
            deviceData.data,
            'Device Types'
        );
    }

    if (osChart.value && Object.keys(props.summary.osCounts).length > 0) {
        const osData = getTopItems(props.summary.osCounts);
        osChartInstance = createPieChart(
            osChart.value,
            osData.labels,
            osData.data,
            'Operating Systems'
        );
    }

    if (browserChart.value && Object.keys(props.summary.browserCounts).length > 0) {
        const browserData = getTopItems(props.summary.browserCounts);
        browserChartInstance = createPieChart(
            browserChart.value,
            browserData.labels,
            browserData.data,
            'Browsers'
        );
    }
}

function destroyCharts() {
    timeSeriesChartInstance?.destroy();
    userTypeChartInstance?.destroy();
    countryChartInstance?.destroy();
    deviceChartInstance?.destroy();
    osChartInstance?.destroy();
    browserChartInstance?.destroy();
}

onMounted(() => {
    nextTick(() => {
        initCharts();
    });
});

watch([() => props.summary, () => props.events, () => props.pixel], () => {
    destroyCharts();
    nextTick(() => {
        initCharts();
    });
}, { deep: true });
</script>

<template>
    <div class="dashboard">
        <VisitorMap v-if="Object.keys(summary.countryCounts).length > 0" :countryCounts="summary.countryCounts" />

        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-label">Total Visits</div>
                <div class="stat-value">{{ summary.totalEvents }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Unique Visitors</div>
                <div class="stat-value">{{ summary.uniqueUsers }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg Visits per Visitor</div>
                <div class="stat-value">{{ summary.eventsPerUser }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">One-time Visitors</div>
                <div class="stat-value">{{ summary.newUsers }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Returning Visitors</div>
                <div class="stat-value">{{ summary.returningUsers }}</div>
            </div>
        </div>

        <div class="time-series-container" v-if="events.length > 0">
            <h3>Events Over Time</h3>
            <div class="chart-wrapper">
                <canvas ref="timeSeriesChart"></canvas>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-container" v-if="summary.totalEvents > 0">
                <h3>Visitor Type</h3>
                <div class="chart-wrapper">
                    <canvas ref="userTypeChart"></canvas>
                </div>
            </div>

            <div class="chart-container" v-if="Object.keys(summary.countryCounts).length > 0">
                <h3>Countries</h3>
                <div class="chart-wrapper">
                    <canvas ref="countryChart"></canvas>
                </div>
            </div>

            <div class="chart-container" v-if="Object.keys(summary.deviceTypeCounts).length > 0">
                <h3>Device Types</h3>
                <div class="chart-wrapper">
                    <canvas ref="deviceChart"></canvas>
                </div>
            </div>

            <div class="chart-container" v-if="Object.keys(summary.osCounts).length > 0">
                <h3>Operating Systems</h3>
                <div class="chart-wrapper">
                    <canvas ref="osChart"></canvas>
                </div>
            </div>

            <div class="chart-container" v-if="Object.keys(summary.browserCounts).length > 0">
                <h3>Browsers</h3>
                <div class="chart-wrapper">
                    <canvas ref="browserChart"></canvas>
                </div>
            </div>
        </div>

        <div class="params-table-container" v-if="summary.parameterRows.length > 0">
            <h3>Parameters</h3>
            <div class="table-wrapper">
                <table class="params-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in summary.parameterRows" :key="index">
                            <td class="param-name">{{ row.parameter }}</td>
                            <td class="param-value">{{ row.value }}</td>
                            <td class="param-count">{{ row.count }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
}

.stats-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 0 1rem 2rem 1rem;
}

.stat-card {
    /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
    background: #ffffff;
    color: #000000;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex: 1 1 calc(33.333% - 1rem);
    min-width: 250px;
}

/* .stat-card:nth-child(2) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) {
    background: linear-gradient(135deg, #49e67d 0%, #23caac 100%);
}

.stat-card:nth-child(5) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
} */

.stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
    flex-shrink: 0;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: right;
    white-space: nowrap;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    padding: 0 1rem 1rem 1rem;
}

.time-series-container {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 0 1rem 2rem 1rem;
}

.time-series-container h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #333;
    border-bottom: 2px solid #e5e5e5;
    padding-bottom: 0.5rem;
}

.chart-container {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #333;
    border-bottom: 2px solid #e5e5e5;
    padding-bottom: 0.5rem;
}

.chart-wrapper {
    position: relative;
    height: 300px;
}

.params-table-container {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 0 1rem 2rem 1rem;
}

.params-table-container h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #333;
    border-bottom: 2px solid #e5e5e5;
    padding-bottom: 0.5rem;
}

.table-wrapper {
    overflow-x: auto;
}

.params-table {
    width: 100%;
    border-collapse: collapse;
}

.params-table thead {
    background-color: #f5f5f5;
}

.params-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: #555;
    border-bottom: 2px solid #e5e5e5;
}

.params-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e5e5;
}

.params-table tbody tr:hover {
    background-color: #f9f9f9;
}

.param-name {
    font-weight: 600;
    color: #000000;
}

.param-value {
    color: #333;
    font-family: monospace;
}

.param-count {
    text-align: right;
    font-weight: 600;
    color: #666;
}

@media (max-width: 768px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }

    .stat-card {
        flex: 1 1 100%;
    }

    .stat-value {
        font-size: 2rem;
    }

    .params-table th,
    .params-table td {
        padding: 0.5rem;
        font-size: 0.9rem;
    }
}
</style>
