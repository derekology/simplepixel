<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController, type ChartConfiguration } from 'chart.js';
import VisitorMap from './VisitorMap.vue';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

interface StatsSummary {
    totalEvents: number;
    uniqueUsers: number;
    newUsers: number;
    returningUsers: number;
    countryCounts: Record<string, number>;
    deviceTypeCounts: Record<string, number>;
    osCounts: Record<string, number>;
    browserCounts: Record<string, number>;
    paramCounts: Record<string, Record<string, number>>;
}

const props = defineProps<{
    summary: StatsSummary;
}>();

const eventsPerUser = computed(() => {
    if (props.summary.uniqueUsers === 0) return '0.0';
    return (props.summary.totalEvents / props.summary.uniqueUsers).toFixed(1);
});

const userTypeChart = ref<HTMLCanvasElement | null>(null);
const countryChart = ref<HTMLCanvasElement | null>(null);
const deviceChart = ref<HTMLCanvasElement | null>(null);
const osChart = ref<HTMLCanvasElement | null>(null);
const browserChart = ref<HTMLCanvasElement | null>(null);

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

function initCharts() {
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

watch(() => props.summary, () => {
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
                <div class="stat-label">Total Events</div>
                <div class="stat-value">{{ summary.totalEvents }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Unique Users</div>
                <div class="stat-value">{{ summary.uniqueUsers }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">New Users</div>
                <div class="stat-value">{{ summary.newUsers }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Returning Users</div>
                <div class="stat-value">{{ summary.returningUsers }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Events per User</div>
                <div class="stat-value">{{ eventsPerUser }}</div>
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
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

.stat-card:nth-child(2) {
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
}

.stat-card:hover {
    transform: translateY(-4px);
}

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
}
</style>
