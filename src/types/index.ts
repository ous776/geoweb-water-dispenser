export interface WaterDispenser {
	id: string;
	name: string;
	longitude: number;
	latitude: number;
	address?: string;
	description?: string;
}

export interface MapConfig {
	center: [number, number];
	zoom: number;
	minZoom?: number;
	maxZoom?: number;
}
