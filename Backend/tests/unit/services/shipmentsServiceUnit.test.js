import e from 'express'
import { vi, test, expect, describe, beforeEach } from 'vitest'

vi.doMock('../../../models/shipment.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            add: vi.fn()
        }
    }
})

vi.doMock('../../../models/destination.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            getById: vi.fn()
        }
    }
})

vi.doMock('../../../models/ship.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            GetById: vi.fn()
        }
    }
})

vi.doMock('../../../models/user_ship.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            GetUserShipByShipId: vi.fn()
        }
    }
})

const Destination = (await import('../../../models/destination.js')).default
const Ship = (await import('../../../models/ship.js')).default
const User_Ship = (await import('../../../models/user_ship.js')).default
const Shipment = (await import('../../../models/shipment.js')).default
const ShipmentService = (await import('../../../services/shipmentService.js')).default

beforeEach(() => {
    vi.resetAllMocks()
})

describe('Shipment service unit tests', () => {
    test('Add a shipment', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const input = {
            shipment_name: 'UnitTestShipment',
            eta: eta,
            destination_id: 1,
            ship_id: 1
        }

        const destination1 = {
            id: 1,
            destination_name: 'UnitTestDestination1',
            lon: 20.00,
            lat: 40.00,
            user_id:8
        }

        const ship1 = {
            id: 1,
            ship_name: 'UNIT TEST SHIP',
            mmsi: '230000001',
            lon: 20.00,
            lat: 20.00,
            updated_at: Date.now()
        }

        const fullShip1 = {
            id: 1,
            ship_nickname: 'UnitTestShip',
            ship_name: 'UNIT TEST SHIP',
            mmsi: '230000001',
            lon: 20.00,
            lat: 20.00,
            updated_at: Date.now()
        }

        const output = [{
            id: 1,
            shipment_name: 'UnitTestShipment',
            eta: input.eta,
            status: 1,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 1,
            ship_id: 1
        }]

        Destination.getById.mockResolvedValue(destination1)
        Ship.GetById.mockResolvedValue(ship1)
        User_Ship.GetUserShipByShipId.mockResolvedValue(fullShip1)
        Shipment.add.mockResolvedValue(output)

        const result = await ShipmentService.AddShipment(input, 8)

        expect(result).toEqual(output)

        expect(Destination.getById).toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledWith(1, 8)

        expect(Ship.GetById).toHaveBeenCalledOnce()
        expect(Ship.GetById).toHaveBeenCalledWith(1)

        expect(User_Ship.GetUserShipByShipId).toHaveBeenCalledOnce()
        expect(User_Ship.GetUserShipByShipId).toHaveBeenCalledWith(8, 1)

        expect(Shipment.add).toHaveBeenCalledOnce()
        expect(Shipment.add).toHaveBeenCalledWith({
            shipment_name: input.shipment_name,
            eta: input.eta,
            status: 1,
            user_id: 8,
            destination_id: input.destination_id,
            ship_id: input.ship_id
        })
    })
})