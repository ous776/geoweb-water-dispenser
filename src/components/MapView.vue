<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';

const mapContainer = ref<HTMLElement | null>(null);
let map: Map | null = null;

onMounted(() => {
	if (!mapContainer.value) return;

	// Base OSM layer
	const osmLayer = new TileLayer({
		source: new OSM(),
	});

	// Example WMS layer (you'll need to replace with actual WMS service)
	const wmsLayer = new TileLayer({
		source: new TileWMS({
			url: 'https://ows.terrestris.de/osm/service',
			params: {
				'LAYERS': 'OSM-WMS',
				'TILED': true
			},
			serverType: 'geoserver',
		}),
		opacity: 0.5,
	});

	// Vector layer for water dispenser markers (WFS will be added here)
	const vectorSource = new VectorSource({
		features: []
	});

	const vectorLayer = new VectorLayer({
		source: vectorSource,
		style: new Style({
			image: new Icon({
				anchor: [0.5, 1],
				src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%232196F3" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
				scale: 1.5,
			}),
		}),
	});

	// Initialize map
	map = new Map({
		target: mapContainer.value,
		layers: [osmLayer, vectorLayer],
		view: new View({
			center: fromLonLat([10.0, 53.5]), // Hamburg, Germany coordinates
			zoom: 12,
		}),
	});

	// Example: Add a sample water dispenser marker
	const sampleFeature = new Feature({
		geometry: new Point(fromLonLat([10.0, 53.5])),
		name: 'Sample Water Dispenser',
	});
	vectorSource.addFeature(sampleFeature);
});

</script>

<template>
	<section class="map-section" aria-label="Water dispenser map">
		<div 
			ref="mapContainer" 
			class="map-container"
			role="application"
			aria-label="Interactive map showing water dispenser locations"
			tabindex="0"
		></div>
	</section>
</template>

<style scoped>
.map-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.map-container {
	flex: 1;
	width: 100%;
	min-height: 500px;
	height: 100%;
}

.map-container:focus {
	outline: 2px solid #2196F3;
	outline-offset: -2px;
}

@media (max-width: 768px) {
	.map-container {
		min-height: 400px;
	}
}

@media (orientation: landscape) and (max-width: 768px) {
	.map-container {
		min-height: 300px;
	}
}
</style>
