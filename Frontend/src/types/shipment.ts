export type ShipmentStatus = 1 | 2 | 3

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
    1: 'Matkalla',
    2: 'Toimitettu',
    3: 'Viivästynyt',
}

export type Shipment = {
    id: number
    shipment_name: string
    ship_mmsi: string
    eta: string | null
    status: ShipmentStatus
    lon: string
    lat: string
    user_id: number
    created_at: string | null
    updated_at: string | null
}
