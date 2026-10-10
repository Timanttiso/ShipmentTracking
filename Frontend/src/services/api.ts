import requestHelper from "./serviceHelper"
import type { Shipment } from "../types/shipment"
import type { Destination } from "../types/destination"

export const fetchShipments = (): Promise<Shipment[]> => {
    return requestHelper<Shipment[]>('/api/shipments', true)
}

type AddShipmentRequest = {
    shipment_name: string
    ship_mmsi: string
    eta: string | null
    destination_id: number | null
}

export const addShipment = <TResponse = unknown>(shipment: AddShipmentRequest): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/shipments/add-shipment', true, {
        method: 'POST',
        body: JSON.stringify(shipment),
    })
}

export const fetchDestinations = (): Promise<Destination[]> => {
    return requestHelper<Destination[]>('/api/destinations', true)
}

type DestinationRequest = {
    destination_name: string,
    lon: number,
    lat: number
}

export const addDestination = <TResponse = unknown>(destination: DestinationRequest): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/destinations/add-destination', true, {
        method: 'POST',
        body: JSON.stringify(destination),
    })
}

export const updateDestination = <TResponse = unknown>(id: number, destination: DestinationRequest): Promise<TResponse> => {
    return requestHelper<TResponse>(`/api/destinations/destination/${id}`, true, {
        method: 'PATCH',
        body: JSON.stringify(destination),
    })
}