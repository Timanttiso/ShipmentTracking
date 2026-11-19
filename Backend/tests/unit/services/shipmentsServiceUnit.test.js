import e from 'express'
import { vi, test, expect, describe, beforeEach } from 'vitest'

vi.doMock('../../../models/shipment.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            add: vi.fn(),
            getAllForUser: vi.fn(),
            getAllForUserByStatus: vi.fn(),
            getById: vi.fn(),
            updateShipmentInformation: vi.fn()
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
    }),

    test('Get all shipments for the user', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const output = [
            {
                id: 1,
                shipment_name: 'UnitTestShipment1',
                eta: eta,
                status: 1,
                user_id: 8,
                created_at: Date.now(),
                updated_at: null,
                destination_id: 1,
                ship_id: 1,
                destination_name: 'UnitTestDestination1',
                destination_lon: 20.00,
                destination_lat: 40.00,
                ship_name: 'UnitTestShip1',
                mmsi: '230000001',
                lon: 10.00,
                lat: 40.00,
                ship_updated_at: Date.now()
            },
            {
                id: 3,
                shipment_name: 'UnitTestShipment3',
                eta: eta,
                status: 1,
                user_id: 8,
                created_at: Date.now(),
                updated_at: null,
                destination_id: 2,
                ship_id: 1,
                destination_name: 'UnitTestDestination2',
                destination_lon: 20.00,
                destination_lat: 40.00,
                ship_name: 'UnitTestShip1',
                mmsi: '230000001',
                lon: 10.00,
                lat: 40.00,
                ship_updated_at: Date.now()
            }
        ]

        Shipment.getAllForUser.mockResolvedValue(output)

        const result = await ShipmentService.GetAllShipmentsForUser(8)

        expect(result).toEqual(output)

        expect(Shipment.getAllForUser).toHaveBeenCalledOnce()
        expect(Shipment.getAllForUser).toHaveBeenCalledWith(8)
    }),

    test('Get all shipments for the user with the status 2', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const output = [{ 
            id: 2,
            shipment_name: 'UnitTestShipment2',
            eta: eta,
            status: 2,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 3,
            ship_id: 2,
            destination_name: 'UnitTestDestination3',
            destination_lon: 50.00,
            destination_lat: 40.00,
            ship_name: 'UnitTestShip2',
            mmsi: '230000002',
            lon: 25.00,
            lat: 40.00,
            ship_updated_at: Date.now()
        }]

        Shipment.getAllForUserByStatus.mockResolvedValue(output)

        const result = await ShipmentService.GetAllShipmentsForUserByStatus(8, 2)

        expect(result).toEqual(output)

        expect(Shipment.getAllForUserByStatus).toHaveBeenCalledOnce()
        expect(Shipment.getAllForUserByStatus).toHaveBeenCalledWith(8, 2)
    }),

    test('Get a shipment based on id', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const output = { 
            id: 2,
            shipment_name: 'UnitTestShipment2',
            eta: eta,
            status: 2,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 3,
            ship_id: 2,
            destination_name: 'UnitTestDestination3',
            destination_lon: 50.00,
            destination_lat: 40.00,
            ship_name: 'UnitTestShip2',
            mmsi: '230000002',
            lon: 25.00,
            lat: 40.00,
            ship_updated_at: Date.now()
        }

        Shipment.getById.mockResolvedValue(output)

        const result = await ShipmentService.GetShipmentById('2', 8)

        expect(result).toEqual(output)

        expect(Shipment.getById).toHaveBeenCalledOnce()
        expect(Shipment.getById).toHaveBeenCalledWith('2', 8)
    }),

    test('Update shipment information', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const input = {
            shipment_name: 'UnitTestShipment1Edited',
            destination_id: 2,
            ship_id: 2
        }

        const existingShipment = {
            id: 1,
            shipment_name: 'UnitTestShipment1',
            eta: eta,
            status: 1,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 1,
            ship_id: 1,
            destination_name: 'UnitTestDestination1',
            destination_lon: 20.00,
            destination_lat: 40.00,
            ship_name: 'UnitTestShip1',
            mmsi: '230000001',
            lon: 10.00,
            lat: 40.00,
            ship_updated_at: Date.now()
        }

        const updatedShipment = {
            id: 1,
            shipment_name: 'UnitTestShipment1Edited',
            eta: eta,
            status: 1,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 2,
            ship_id: 2,
            destination_name: 'UnitTestDestination2',
            destination_lon: 25.00,
            destination_lat: 42.00,
            ship_name: 'UnitTestShip2',
            mmsi: '230000002',
            lon: 20.00,
            lat: 40.00,
            ship_updated_at: Date.now()
        }

        const updatedShipmentNonFull = {
            id: 1,
            shipment_name: 'UnitTestShipment1Edited',
            eta: eta,
            status: 1,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 1,
            ship_id: 1
        }

        const destination = {
            id: 2,
            destination_name: 'UnitTestDestination2',
            lon: 25.00,
            lat: 42.00,
            user_id: 8
        }

        Shipment.getById
            .mockResolvedValueOnce(existingShipment)
            .mockResolvedValueOnce(updatedShipment)

        Destination.getById.mockResolvedValue(destination)
        Shipment.updateShipmentInformation.mockResolvedValue(updatedShipmentNonFull)

        const result = await ShipmentService.UpdateShipmentInformation('1', 8, input)

        expect(result).toEqual(updatedShipment)

        expect(Shipment.getById).toHaveBeenCalledTimes(2)
        expect(Shipment.getById).toHaveBeenCalledWith('1', 8)

        expect(Destination.getById).toHaveBeenCalledOnce()
        expect(Destination.getById).toHaveBeenCalledWith(2, 8)

        expect(Shipment.updateShipmentInformation).toHaveBeenCalledOnce()
        expect(Shipment.updateShipmentInformation).toHaveBeenCalledWith('1', 8, input)
    })
})