<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CountryCounts {
    [country: string]: number;
}

const props = defineProps<{
    countryCounts: CountryCounts;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let geoJsonLayer: L.GeoJSON | null = null;

const countryCodeMap: Record<string, string> = {
    'United States': 'USA',
    'United Kingdom': 'GBR',
    'Germany': 'DEU',
    'France': 'FRA',
    'Italy': 'ITA',
    'Spain': 'ESP',
    'Canada': 'CAN',
    'Australia': 'AUS',
    'Japan': 'JPN',
    'China': 'CHN',
    'India': 'IND',
    'Brazil': 'BRA',
    'Mexico': 'MEX',
    'Russia': 'RUS',
    'South Korea': 'KOR',
    'Netherlands': 'NLD',
    'Belgium': 'BEL',
    'Sweden': 'SWE',
    'Norway': 'NOR',
    'Denmark': 'DNK',
    'Finland': 'FIN',
    'Poland': 'POL',
    'Switzerland': 'CHE',
    'Austria': 'AUT',
    'Portugal': 'PRT',
    'Greece': 'GRC',
    'Turkey': 'TUR',
    'South Africa': 'ZAF',
    'Argentina': 'ARG',
    'Chile': 'CHL',
    'Colombia': 'COL',
    'Peru': 'PER',
    'Venezuela': 'VEN',
    'Egypt': 'EGY',
    'Nigeria': 'NGA',
    'Kenya': 'KEN',
    'Thailand': 'THA',
    'Vietnam': 'VNM',
    'Philippines': 'PHL',
    'Indonesia': 'IDN',
    'Malaysia': 'MYS',
    'Singapore': 'SGP',
    'New Zealand': 'NZL',
    'Ireland': 'IRL',
    'Czech Republic': 'CZE',
    'Hungary': 'HUN',
    'Romania': 'ROU',
    'Ukraine': 'UKR',
    'Israel': 'ISR',
    'Saudi Arabia': 'SAU',
    'United Arab Emirates': 'ARE',
    'Pakistan': 'PAK',
    'Bangladesh': 'BGD',
};

function getColor(count: number, maxCount: number): string {
    if (count === 0) return '#f0f0f0';
    const ratio = count / maxCount;
    if (ratio > 0.7) return '#0a2f51';
    if (ratio > 0.5) return '#0e4d92';
    if (ratio > 0.3) return '#1e88e5';
    if (ratio > 0.15) return '#42a5f5';
    return '#90caf9';
}

async function loadGeoJSON() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
        const geoData = await response.json();

        const maxCount = Math.max(...Object.values(props.countryCounts));

        if (map) {
            geoJsonLayer = L.geoJSON(geoData, {
                style: (feature) => {
                    const countryName = feature?.properties?.name || '';
                    const count = props.countryCounts[countryName] || 0;

                    return {
                        fillColor: getColor(count, maxCount),
                        weight: 1,
                        opacity: 1,
                        color: '#ffffff',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: (feature, layer) => {
                    const countryName = feature.properties.name;
                    const count = props.countryCounts[countryName] || 0;

                    if (count > 0) {
                        layer.bindTooltip(`<strong>${countryName}</strong><br/>Visitors: ${count}`, {
                            sticky: true
                        });
                    }

                    layer.on({
                        mouseover: (e) => {
                            const layer = e.target;
                            if (count > 0) {
                                layer.setStyle({
                                    weight: 2,
                                    color: '#666',
                                    fillOpacity: 0.9
                                });
                            }
                        },
                        mouseout: (e) => {
                            geoJsonLayer?.resetStyle(e.target);
                        }
                    });
                }
            }).addTo(map);
        }
    } catch (error) {
        console.error('Error loading GeoJSON:', error);
    }
}

function initMap() {
    if (mapContainer.value && !map) {
        map = L.map(mapContainer.value, {
            center: [50, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 5,
            scrollWheelZoom: false,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            noWrap: true
        }).addTo(map);

        loadGeoJSON();
    }
}

function updateMap() {
    if (geoJsonLayer && map) {
        map.removeLayer(geoJsonLayer);
        geoJsonLayer = null;
        loadGeoJSON();
    }
}

onMounted(() => {
    nextTick(() => {
        initMap();
    });
});

watch(() => props.countryCounts, () => {
    updateMap();
}, { deep: true });
</script>

<template>
    <div class="map-container">
        <div ref="mapContainer" class="map"></div>
    </div>
</template>

<style scoped>
.map-container {
    width: 100%;
    margin-bottom: var(--spacing-lg);
    background-color: #aad3df;
}

.map {
    height: 400px;
    width: 100%;
    background-color: #aad3df;
}

@media (max-width: 768px) {
    .map {
        height: 300px;
    }
}
</style>
