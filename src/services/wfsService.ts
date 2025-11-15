import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import type { WaterDispenser } from '@/types';

/**
 * Service for fetching water dispenser data from WFS
 */
export class WFSService {
	private wfsUrl: string;
	private featureType: string;

	constructor(wfsUrl: string, featureType: string) {
		this.wfsUrl = wfsUrl;
		this.featureType = featureType;
	}

	/**
	 * Create a vector source with WFS data
	 */
	createVectorSource(): VectorSource {
		return new VectorSource({
			format: new GeoJSON(),
			url: (extent): string => {
				return `${this.wfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${this.featureType}&outputFormat=application/json&srsname=EPSG:3857&bbox=${extent.join(',')},EPSG:3857`;
			},
			strategy: (extent, resolution): [number, number, number, number][] => {
				return [extent as [number, number, number, number]];
			},
		});
	}

	/**
	 * Fetch water dispenser data
	 */
	async fetchWaterDispensers(): Promise<WaterDispenser[]> {
		try {
			const response = await fetch(
				`${this.wfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${this.featureType}&outputFormat=application/json`
			);
			
			if (!response.ok) {
				throw new Error(`WFS request failed: ${response.statusText}`);
			}

			const data = await response.json();
			return this.parseFeatures(data);
		} catch (error) {
			console.error('Error fetching water dispensers:', error);
			return [];
		}
	}

	/**
	 * Parse GeoJSON features to WaterDispenser objects
	 */
	private parseFeatures(geojson: GeoJSON.FeatureCollection): WaterDispenser[] {
		return geojson.features.map((feature, index) => ({
			id: feature.id?.toString() || `dispenser-${index}`,
			name: feature.properties?.name || 'Water Dispenser',
			longitude: feature.geometry.coordinates[0],
			latitude: feature.geometry.coordinates[1],
			address: feature.properties?.address,
			description: feature.properties?.description,
		}));
	}
}
