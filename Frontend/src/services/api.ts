import requestHelper from "./serviceHelper"
import type { Shipment } from "../types/shipment"

export const fetchShipments = (): Promise<Shipment[]> => {
    return requestHelper<Shipment[]>('/api/shipments')
}

export const addShipment = <TResponse = unknown>(reqBody: Record<string, unknown>): Promise<TResponse> => {
    return requestHelper<TResponse>('/api/shipments/add-shipment', {
        method: 'POST',
        body: JSON.stringify(reqBody),
    })
}