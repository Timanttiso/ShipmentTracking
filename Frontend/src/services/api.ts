import requestHelper from './serviceHelper';
import type Shipment from '../models/shipment';
import type { CreatedShipment } from '../models/shipment';
import type Destination from '../models/destination';
import type Ship from '../models/ship';

interface AddShipmentRequest {
	shipment_name: string;
	ship_id: number;
	eta: string | null;
	destination_id: number | null;
}

export const fetchShipments = (): Promise<Shipment[]> => {
	return requestHelper<Shipment[]>('/api/shipments', true);
};

export const addShipment = (shipment: AddShipmentRequest): Promise<[CreatedShipment]> => {
	return requestHelper<[CreatedShipment]>('/api/shipments/add-shipment', true, {
		method: 'POST',
		body: JSON.stringify(shipment),
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
