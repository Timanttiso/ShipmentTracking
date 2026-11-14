import requestHelper from './serviceHelper';
import type Shipment from '../models/shipment';
import type { CreatedShipment } from '../models/shipment';
import type Destination from '../models/destination';
import type Ship from '../models/ship';

interface ShipmentRequest {
	shipment_name: string;
	ship_id: number;
	eta: string | null;
	destination_id: number | null;
}

interface UpdatedShipment {
	id: number;
	shipment_name: string;
	eta: string;
	status: number;
	user_id: number;
	created_at: string;
	updated_at: string;
	destination_id: number;
	ship_id: number;
}

export const fetchShipments = (): Promise<Shipment[]> => {
	return requestHelper<Shipment[]>('/api/shipments', true);
};

// fetchShipment is used only to fetch an updated shipment. Could be avoided,
// if the udpdateShipment route returned the shipment
// in the same format as the shipments route.
export const fetchShipment = (id: number): Promise<Shipment> => {
	return requestHelper<Shipment>(`/api/shipments/shipment/${id}`, true);
};

export const addShipment = (shipment: ShipmentRequest): Promise<[CreatedShipment]> => {
	return requestHelper<[CreatedShipment]>('/api/shipments/add-shipment', true, {
		method: 'POST',
		body: JSON.stringify(shipment),
	});
};

export const updateShipment = (id: number, shipment: ShipmentRequest): Promise<[UpdatedShipment]> => {
	return requestHelper<[UpdatedShipment]>(`/api/shipments/shipment/${id}`, true, {
		method: 'PATCH',
		body: JSON.stringify(shipment),
	});
};

export const deleteShipment = (id: number): Promise<void> => {
	return requestHelper<void>(`/api/shipments/shipment/${id}`, true, {
		method: 'DELETE',
	});
};

interface DestinationRequest {
	destination_name: string;
	lon: number;
	lat: number;
}

export const fetchDestinations = (): Promise<Destination[]> => {
	return requestHelper<Destination[]>('/api/destinations', true);
};

export const addDestination = (destination: DestinationRequest): Promise<[Destination]> => {
	return requestHelper<[Destination]>('/api/destinations/add-destination', true, {
		method: 'POST',
		body: JSON.stringify(destination),
	});
};

export const updateDestination = (id: number, destination: DestinationRequest): Promise<[Destination]> => {
	return requestHelper<[Destination]>(`/api/destinations/destination/${id}`, true, {
		method: 'PATCH',
		body: JSON.stringify(destination),
	});
};

export const deleteDestination = (id: number): Promise<void> => {
	return requestHelper<void>(`/api/destinations/destination/${id}`, true, {
		method: 'DELETE',
	});
};

interface ShipRequest {
	ship_nickname: string;
	mmsi: string;
}

export const fetchUserShips = (): Promise<Ship[]> => {
	return requestHelper<Ship[]>('/api/ships', true);
};

export const addUserShip = (ship: ShipRequest): Promise<Ship> => {
	return requestHelper<Ship>('/api/ships/add-ship', true, {
		method: 'POST',
		body: JSON.stringify(ship),
	});
};

export const updateShip = (id: number, ship: ShipRequest): Promise<Ship> => {
	return requestHelper<Ship>(`/api/ships/ship/${id}`, true, {
		method: 'PATCH',
		body: JSON.stringify(ship),
	});
};

export const deleteShip = (id: number): Promise<void> => {
	return requestHelper<void>(`/api/ships/unfollow/${id}`, true, {
		method: 'DELETE',
	});
};
