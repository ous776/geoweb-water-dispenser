<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text, RegularShape } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import type { Geometry } from 'ol/geom';
import type { FeatureLike } from 'ol/Feature';
import { defaults as defaultControls, Zoom, ScaleLine, FullScreen } from 'ol/control';

const GEOSERVER_URL = 'http://localhost:8080/geoserver';
const WORKSPACE = 'water_dispensers';
const LAYER = 'dispensers';

let map: Map;
let vectorSource: VectorSource;
let vectorLayer: VectorLayer<VectorSource>;

const editMode = ref(false);
const selectedFeature = ref<any>(null);
const formData = ref({
	name: '',
	location_name: '',
	water_types: [] as string[],
	is_indoor: false,
	floor: '',
	description: '',
	coordinates: ''
});

const waterTypeOptions = [
	{ value: 'still', label: 'Still Water' },
	{ value: 'sparkling', label: 'Sparkling Water' },
	{ value: 'filtered', label: 'Filtered Water' }
];


const getDispenserStyle = (feature: FeatureLike): Style => {
	const props = feature.getProperties();
	
	const waterTypes = props.water_types ? props.water_types.split(',') : [];
	const isIndoor = props.is_indoor;
	
	
	let color = '#2196F3'; 
	let label = 'STW'; // Still
	
	if (waterTypes.includes('sparkling')) {
		color = '#FF6B6B'; 
		label = 'SPW'; // Sparkling
	} else if (waterTypes.includes('filtered')) {
		color = '#4CAF50'; 
		label = 'FTW'; // Filtered
	} else if (waterTypes.includes('still')) {
		color = '#2196F3'; 
		label = 'STW'; // Still
	}
	
	
	const imageStyle = isIndoor 
		? new RegularShape({
				fill: new Fill({ color: color }),
				stroke: new Stroke({ color: '#fff', width: 2 }),
				points: 4,
				radius: 10,
				angle: Math.PI / 4
			})
		: new CircleStyle({
				radius: 10,
				fill: new Fill({ color: color }),
				stroke: new Stroke({ color: '#fff', width: 2 })
			});
	
	return new Style({
		image: imageStyle,
		text: new Text({
			text: label,
			offsetY: -20,
			font: '16px sans-serif',
			fill: new Fill({ color: '#000' }),
			stroke: new Stroke({ color: '#fff', width: 2 })
		})
	});
};

onMounted(() => {

	vectorSource = new VectorSource({
		format: new GeoJSON()
	});
	

	const loadAllFeatures = async () => {
		const url = `${GEOSERVER_URL}/${WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${WORKSPACE}:${LAYER}&outputFormat=application/json&_t=${Date.now()}`;

		
		try {
			const response = await fetch(url);
			const geojson = await response.json();

			

			geojson.features?.forEach((f: { id: string; properties: { name: any; original_fid: any; }; }, i: any) => {

				const originalId = f.id;
				
				if (originalId) {
					f.properties.original_fid = originalId;
				}

				f.id = `dispenser_${i}_${Date.now()}`;
			});
			
			const features = new GeoJSON().readFeatures(geojson, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});
			
			vectorSource.addFeatures(features);
			

			if (features.length > 0) {
				const extent = vectorSource.getExtent();
				console.log('Features extent:', extent);
				map.getView().fit(extent, {
					padding: [100, 100, 100, 100],
					maxZoom: 16,
					duration: 1000
				});
			}
		} catch (error) {
			console.error('Error loading features:', error);
		}
	};



	vectorLayer = new VectorLayer({
		source: vectorSource,
		style: getDispenserStyle
	});

	const osmLayer = new TileLayer({
		source: new OSM()
	});

	map = new Map({
		target: 'map',
		layers: [osmLayer, vectorLayer],
		controls: defaultControls().extend([
			new Zoom({
				className: 'ol-zoom'
			}),
			new ScaleLine({
				units: 'metric'
			}),
			new FullScreen()
		]),
		view: new View({
			center: fromLonLat([9.90, 54.316]), // Kiel
			zoom: 14,
			minZoom: 2,
			maxZoom: 19
		})
	});


	loadAllFeatures();

	setTimeout(() => {
		map.updateSize();
	}, 100);

	map.on('click', (evt) => {
		if (editMode.value) {
			const coords = toLonLat(evt.coordinate);
			formData.value.coordinates = `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
		} else {

			map.forEachFeatureAtPixel(evt.pixel, (feature) => {
				if (feature instanceof Feature) {
					editFeature(feature as Feature<Geometry>);
				}
				return true;
			});
		}
	});
})

function startAddMode() {
	editMode.value = true;
	selectedFeature.value = null;
	formData.value = {
		name: '',
		location_name: '',
		water_types: [],
		is_indoor: false,
		floor: '',
		description: '',
		coordinates: ''
	};
}

function editFeature(feature: Feature<Geometry>) {
	editMode.value = true;
	selectedFeature.value = feature;
	
	const props = feature.getProperties();
	const geom = feature.getGeometry();
	
	if (geom && geom.getType() === 'Point') {
		const coords = toLonLat((geom as any).getCoordinates());
		formData.value = {
			name: props.name || '',
			location_name: props.location_name || '',
			water_types: props.water_types ? props.water_types.split(',') : [],
			is_indoor: props.is_indoor || false,
			floor: props.floor || '',
			description: props.description || '',
			coordinates: `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`
		};
	}
}

function cancelEdit() {
	editMode.value = false;
	selectedFeature.value = null;
}

async function refreshMap() {

	vectorSource.clear();
	
	const url = `${GEOSERVER_URL}/${WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${WORKSPACE}:${LAYER}&outputFormat=application/json&_t=${Date.now()}`;

	
	try {
		const response = await fetch(url);
		const geojson = await response.json();
		
		
		geojson.features?.forEach((f: { id: string; properties: { original_fid: any; }; }, i: any) => {

			if (f.id) {
				f.properties.original_fid = f.id;
			}

			f.id = `dispenser_${i}_${Date.now()}`;
		});
		
		const features = new GeoJSON().readFeatures(geojson, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		});
		
		vectorSource.addFeatures(features);
		
	
		if (features.length > 0) {
			const extent = vectorSource.getExtent();
			map.getView().fit(extent, {
				padding: [100, 100, 100, 100],
				maxZoom: 16,
				duration: 1000
			});
		}
	} catch (error) {
		console.error('Error reloading features:', error);
	}
}


async function saveDispenser() {
	const coords = formData.value.coordinates.split(',').map(c => parseFloat(c.trim()));
	if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
		alert('Please click on the map to set a location');
		return;
	}

	if (formData.value.water_types.length === 0) {
		alert('Please select at least one water type');
		return;
	}

	const feature = {
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [coords[1], coords[0]]
		},
		properties: {
			name: formData.value.name,
			location_name: formData.value.location_name,
			water_types: formData.value.water_types.join(','),
			is_indoor: formData.value.is_indoor,
			floor: formData.value.floor || '',
			description: formData.value.description || ''
		}
	};

	console.log('Saving feature:', feature);

	if (selectedFeature.value) {
		const props = selectedFeature.value.getProperties();
		const originalFid = props.original_fid;
		
		if (!originalFid) {
			alert('Cannot update: Original feature ID not found.');
			return;
		}
		
		await updateFeature(originalFid, feature);
	} else {
		await insertFeature(feature);
	}
}

//Insert to Database
async function insertFeature(feature: any) {
	
	const wfsTransaction = `
		<wfs:Transaction service="WFS" version="1.1.0"
			xmlns:wfs="http://www.opengis.net/wfs"
			xmlns:gml="http://www.opengis.net/gml"
			xmlns:${WORKSPACE}="http://${WORKSPACE}">
			<wfs:Insert>
				<${WORKSPACE}:${LAYER}>
					<${WORKSPACE}:name>${escapeXml(feature.properties.name)}</${WORKSPACE}:name>
					<${WORKSPACE}:location_name>${escapeXml(feature.properties.location_name)}</${WORKSPACE}:location_name>
					<${WORKSPACE}:water_types>${escapeXml(feature.properties.water_types)}</${WORKSPACE}:water_types>
					<${WORKSPACE}:is_indoor>${feature.properties.is_indoor}</${WORKSPACE}:is_indoor>
					<${WORKSPACE}:floor>${escapeXml(feature.properties.floor)}</${WORKSPACE}:floor>
					<${WORKSPACE}:description>${escapeXml(feature.properties.description)}</${WORKSPACE}:description>
					<${WORKSPACE}:the_geom>
						<gml:Point srsName="EPSG:4326">
							<gml:coordinates>${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}</gml:coordinates>
						</gml:Point>
					</${WORKSPACE}:the_geom>
				</${WORKSPACE}:${LAYER}>
			</wfs:Insert>
		</wfs:Transaction>
	`;
	
	await sendTransaction(wfsTransaction);
}

async function updateFeature(featureId: string, feature: any) {
	const wfsTransaction = `
		<wfs:Transaction service="WFS" version="1.1.0"
			xmlns:wfs="http://www.opengis.net/wfs"
			xmlns:gml="http://www.opengis.net/gml"
			xmlns:ogc="http://www.opengis.net/ogc"
			xmlns:${WORKSPACE}="http://${WORKSPACE}">
			<wfs:Update typeName="${WORKSPACE}:${LAYER}">
				<wfs:Property>
					<wfs:Name>name</wfs:Name>
					<wfs:Value>${escapeXml(feature.properties.name)}</wfs:Value>
				</wfs:Property>
				<wfs:Property>
					<wfs:Name>location_name</wfs:Name>
					<wfs:Value>${escapeXml(feature.properties.location_name)}</wfs:Value>
				</wfs:Property>
				<wfs:Property>
					<wfs:Name>water_types</wfs:Name>
					<wfs:Value>${escapeXml(feature.properties.water_types)}</wfs:Value>
				</wfs:Property>
				<wfs:Property>
					<wfs:Name>is_indoor</wfs:Name>
					<wfs:Value>${feature.properties.is_indoor}</wfs:Value>
				</wfs:Property>
				<wfs:Property>
					<wfs:Name>floor</wfs:Name>
					<wfs:Value>${escapeXml(feature.properties.floor)}</wfs:Value>
				</wfs:Property>
				<wfs:Property>
					<wfs:Name>description</wfs:Name>
					<wfs:Value>${escapeXml(feature.properties.description)}</wfs:Value>
				</wfs:Property>
				<wfs:Property>
					<wfs:Name>the_geom</wfs:Name>
					<wfs:Value>
						<gml:Point srsName="EPSG:4326">
							<gml:coordinates>${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}</gml:coordinates>
						</gml:Point>
					</wfs:Value>
				</wfs:Property>
				<ogc:Filter>
					<ogc:FeatureId fid="${featureId}"/>
				</ogc:Filter>
			</wfs:Update>
		</wfs:Transaction>
	`;
	
	await sendTransaction(wfsTransaction);
}

async function deleteDispenser() {
	if (!selectedFeature.value || !confirm('Are you sure you want to delete this dispenser?')) {
		return;
	}
	

	const props = selectedFeature.value.getProperties();
	const originalFid = props.original_fid;
	
	
	if (!originalFid) {
		alert('Cannot delete: Original feature ID not found.');
		return;
	}
		
	let wfsTransaction;
	
	
		wfsTransaction = `
			<wfs:Transaction service="WFS" version="1.1.0"
				xmlns:wfs="http://www.opengis.net/wfs"
				xmlns:ogc="http://www.opengis.net/ogc"
				xmlns:${WORKSPACE}="http://${WORKSPACE}">
				<wfs:Delete typeName="${WORKSPACE}:${LAYER}">
					<ogc:Filter>
						<ogc:FeatureId fid="${originalFid}"/>
					</ogc:Filter>
				</wfs:Delete>
			</wfs:Transaction>
		`;
	
	
	await sendTransaction(wfsTransaction);
}

async function sendTransaction(xml: string) {
	try {
		
		const response = await fetch(`${GEOSERVER_URL}/${WORKSPACE}/wfs`, {
			method: 'POST',
			headers: { 
				'Content-Type': 'text/xml',
			},
			body: xml
		});
		
		
		const data = await response.text();

		
		if (data.includes('read-only')) {
			alert('Error: The layer is configured as read-only in GeoServer.\n\nTo fix:\n1. Open GeoServer Admin\n2. Go to Layers → water_dispensers:dispensers\n3. Check the layer is not read-only\n4. Enable WFS-T (transactional) access');
		} else if (data.includes('Exception') || data.includes('Error')) {
			alert('Error from GeoServer: ' + data.substring(0, 500));
		} else if (data.includes('TransactionResponse')) {
		
			alert('Transaction Successful!');
			cancelEdit();
		
			await refreshMap();
		} else {
			alert('Unexpected response from server');
		}
	} catch (error) {
		alert('Error performing transaction: ' + (error as Error).message);
	}
}

function escapeXml(str: string): string {
	if (!str) return '';
	return str.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case '\'': return '&apos;';
			case '"': return '&quot;';
			default: return c;
		}
	});
}
</script>

<template>
	<div class="map-container">
		<div id="map" role="application" aria-label="Water dispenser map"></div>
		
		<aside class="legend" role="complementary" aria-label="Map legend">
			<h3>Legend</h3>
			<div class="legend-section">
				<h4>Water Types</h4>
				<div class="legend-item">
					<span class="legend-symbol circle" style="background-color: #2196F3;"></span>
					<span>STW - Still Water</span>
				</div>
				<div class="legend-item">
					<span class="legend-symbol circle" style="background-color: #FF6B6B;"></span>
					<span>SPW - Sparkling Water</span>
				</div>
				<div class="legend-item">
					<span class="legend-symbol circle" style="background-color: #4CAF50;"></span>
					<span>FTW - Filtered Water</span>
				</div>
			</div>
			<div class="legend-section">
				<h4>Location Type</h4>
				<div class="legend-item">
					<span class="legend-symbol circle" style="background-color: #999;"></span>
					<span> Outdoor</span>
				</div>
				<div class="legend-item">
					<span class="legend-symbol square" style="background-color: #999;"></span>
					<span> Indoor</span>
				</div>
			</div>
		</aside>
		
		<aside class="control-panel" role="complementary" aria-label="Dispenser controls">
			<h2>Water Dispensers</h2>
			
			<div v-if="!editMode" class="view-mode">
				<button @click="startAddMode" class="btn-primary">Add New Dispenser</button>
				<p class="hint">Click on a marker to view/edit details</p>
			</div>
			
			<form v-else @submit.prevent="saveDispenser" class="edit-mode">
				<div class="form-group">
					<label for="name">Name:</label>
					<input type="text" id="name" v-model="formData.name" required />
				</div>
				
				<div class="form-group">
					<label for="location_name">Location Name:</label>
					<input type="text" id="location_name" v-model="formData.location_name" required />
				</div>
				
				<div class="form-group">
					<label for="water_types">Water Types:</label>
					<select id="water_types" v-model="formData.water_types" multiple size="3">
						<option v-for="opt in waterTypeOptions" :key="opt.value" :value="opt.value">
							{{ opt.label }}
						</option>
					</select>
					<small>Hold Ctrl/Cmd to select multiple</small>
				</div>
				
				<div class="form-group checkbox-group">
					<label>
						<input type="checkbox" id="is_indoor" v-model="formData.is_indoor" />
						Indoor Location
					</label>
				</div>
				
				<div v-if="formData.is_indoor" class="form-group">
					<label for="floor">Floor:</label>
					<input type="text" id="floor" v-model="formData.floor" placeholder="e.g., Ground Floor, 2nd Floor" />
				</div>
				
				<div class="form-group">
					<label for="description">Description:</label>
					<textarea id="description" v-model="formData.description" rows="2"></textarea>
				</div>
				
				<div class="form-group">
					<label for="coordinates">Coordinates:</label>
					<input type="text" id="coordinates" v-model="formData.coordinates"  />
					<small>{{ formData.coordinates ? 'Click map to change' : 'Click on map to set location' }}</small>
				</div>
				
				<div class="button-group">
					<button type="submit" class="btn-primary">Save</button>
					<button type="button" @click="cancelEdit" class="btn-secondary">Cancel</button>
					<button v-if="selectedFeature" type="button" @click="deleteDispenser" class="btn-danger">Delete</button>
				</div>
			</form>
		</aside>
	</div>
</template>

<style scoped>
.map-container {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 500px;
	flex: 1;
	display: flex;
}

#map {
	flex: 1;
	width: 100%;
	height: 100%;
}

.legend {
	position: absolute;
	bottom: 10px;
	left: 10px;
	background: white;
	padding: 1rem;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	z-index: 1000;
	min-width: 200px;
}

.legend h3 {
	margin: 0 0 0.75rem 0;
	font-size: 1.1rem;
	color: #2c3e50;
	border-bottom: 2px solid #2196F3;
	padding-bottom: 0.5rem;
}

.legend h4 {
	margin: 0.75rem 0 0.5rem 0;
	font-size: 0.9rem;
	color: #555;
	font-weight: 600;
}

.legend-section {
	margin-bottom: 0.5rem;
}

.legend-section:last-child {
	margin-bottom: 0;
}

.legend-item {
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;
	font-size: 0.85rem;
}

.legend-symbol {
	width: 16px;
	height: 16px;
	margin-right: 0.5rem;
	border: 2px solid white;
	box-shadow: 0 0 0 1px #ccc;
	flex-shrink: 0;
}

.legend-symbol.circle {
	border-radius: 50%;
}

.legend-symbol.square {
	border-radius: 2px;
	transform: rotate(45deg);
}

.control-panel {
	position: absolute;
	top: 10px;
	right: 10px;
	background: white;
	padding: 1.5rem;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	max-width: 320px;
	max-height: calc(100% - 20px);
	overflow-y: auto;
	z-index: 1000;
}

.control-panel h2 {
	margin: 0 0 1rem 0;
	font-size: 1.25rem;
	color: #2c3e50;
}

.view-mode {
	text-align: center;
}

.hint {
	margin-top: 1rem;
	font-size: 0.9rem;
	color: #666;
}

.form-group {
	margin-bottom: 1rem;
}

.form-group label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 600;
	color: #2c3e50;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 0.9rem;
	font-family: inherit;
}

.form-group input[type="text"]:focus,
.form-group select:focus,
.form-group textarea:focus {
	outline: none;
	border-color: #2196F3;
	box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.form-group select {
	cursor: pointer;
}

.form-group textarea {
	resize: vertical;
}

.form-group small {
	display: block;
	margin-top: 0.25rem;
	font-size: 0.8rem;
	color: #666;
}

.checkbox-group label {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
	margin-right: 0.5rem;
	cursor: pointer;
}

.button-group {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

button {
	padding: 0.6rem 1rem;
	border: none;
	border-radius: 4px;
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-primary {
	background: #2196F3;
	color: white;
	flex: 1;
}

.btn-primary:hover {
	background: #1976D2;
}

.btn-secondary {
	background: #999;
	color: white;
	flex: 1;
}

.btn-secondary:hover {
	background: #777;
}

.btn-danger {
	background: #f44336;
	color: white;
	flex: 1;
}

.btn-danger:hover {
	background: #d32f2f;
}

button:focus {
	outline: 2px solid #2196F3;
	outline-offset: 2px;
}

@media (max-width: 768px) {
	.legend {
		position: static;
		border-radius: 0;
		margin-bottom: 0.5rem;
	}
	
	.control-panel {
		position: static;
		max-width: 100%;
		border-radius: 0;
		max-height: none;
	}
	
	.map-container {
		flex-direction: column;
	}
	
	#map {
		min-height: 400px;
	}
}
</style>
