export type WaterType = 'still' | 'sparkling' | 'filtered' | 'mixed';
export type LocationType = 'indoor' | 'outdoor';

export interface WaterDispenser {
	id: string;
	name: string;
	longitude: number;
	latitude: number;
	address?: string;
	description?: string;
	waterType: WaterType;
	locationType: LocationType;
}

export interface MapConfig {
	center: [number, number];
	zoom: number;
	minZoom?: number;
	maxZoom?: number;
}

export interface DispenserStyle {
	color: string;
	symbol: string;
	label: string;
}
