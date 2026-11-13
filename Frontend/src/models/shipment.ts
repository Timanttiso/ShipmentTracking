export type ShipmentStatus = 1 | 2 | 3;

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
	1: 'Matkalla',
	2: 'Saapunut',
	3: 'Viivästynyt',
};

export default interface Shipment {
	id: number;
	shipment_name: string;
	eta: string | null;
	status: ShipmentStatus;
	ship_name: string | null;
	ship_updated_at: string | null;
	mmsi: string;
	lon: number | null;
	lat: number | null;
	created_at: string | null;
	updated_at: string | null;
	destination_id: number | null;
	destination_name: string;
	destination_lon: number;
	destination_lat: number;
	ship_id: number;
	user_id: number;
}

export interface CreatedShipment {
	id: number;
	shipment_name: string;
	eta: string | null;
	status: ShipmentStatus;
	created_at: string | null;
	updated_at: string | null;
	destination_id: number | null;
	ship_id: number;
	user_id: number;
}
