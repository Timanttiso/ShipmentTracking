import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import middleware from '../../../utils/middleware.js'
import cookieParser from 'cookie-parser'

// Mocks the authentication middleware with relevant values
vi.doMock('../../../utils/auth.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            authenticationRequired: (request, response, next) => {
                request.user = { id: 8 }
                next()
            },
            authenticationNotRequired: (request, response, next) => {
                next()
            }
        }
    }
})

vi.doMock('../../../services/shipmentService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            AddShipment: vi.fn(),
            GetAllShipmentsForUser: vi.fn(),
            GetAllShipmentsForUserByStatus: vi.fn(),
            GetShipmentById: vi.fn(),
            UpdateShipmentInformation: vi.fn(),
            UpdateShipmentStatus: vi.fn(),
            RemoveShipment: vi.fn()
        }
    }
})

const ShipmentService = (await import('../../../services/shipmentService.js')).default
const shipmentsRouter = (await import ('../../../controllers/shipmentsController.js')).default

import middleware from '../../../utils/middleware.js'

const app = express()

app.use(cookieParser())
app.use(express.json())

app.use('/api/shipments', shipmentsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const api = supertest(app)

beforeEach(() => {
    vi.resetAllMocks()
})

describe('Shipments controller unit tests', () => {
    test('Add a shipment', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const input = {
            shipment_name: 'UnitTestShipment',
            eta: eta,
            destination_id: 1,
            ship_id: 1
        }

        const output = {
            id: 1,
            shipment_name: 'UnitTestShipment',
            eta: input.eta,
            status: 1,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 1,
            ship_id: 1
        }

        ShipmentService.AddShipment.mockResolvedValue(output)

        const response = await api
            .post('/api/shipments/add-shipment')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(ShipmentService.AddShipment).toHaveBeenCalledOnce()
        expect(ShipmentService.AddShipment).toHaveBeenCalledWith(input, 8)
    }),

    test('Get all shipments', async () => {
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
                lon: 40.00,
                lat: 30.00,
                ship_updated_at: null
            },
            {
                id: 2,
                shipment_name: 'UnitTestShipment2',
                eta: eta,
                status: 1,
                user_id: 8,
                created_at: Date.now(),
                updated_at: null,
                destination_id: 2,
                ship_id: 1,
                destination_name: 'UnitTestDestination2',
                destination_lon: 30.00,
                destination_lat: 40.00,
                lon: 40.00,
                lat: 30.00,
                ship_updated_at: null
            }
        ]

        ShipmentService.GetAllShipmentsForUser.mockResolvedValue(output)

        const response = await api
            .get('/api/shipments/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(ShipmentService.GetAllShipmentsForUser).toHaveBeenCalledOnce()
        expect(ShipmentService.GetAllShipmentsForUser).toHaveBeenCalledWith(8)
    }),

    test('Get shipments based on status 2', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const output = [
            {
                id: 1,
                shipment_name: 'UnitTestShipment1',
                eta: eta,
                status: 2,
                user_id: 8,
                created_at: Date.now(),
                updated_at: null,
                destination_id: 1,
                ship_id: 1,
                destination_name: 'UnitTestDestination1',
                destination_lon: 20.00,
                destination_lat: 40.00,
                lon: 40.00,
                lat: 30.00,
                ship_updated_at: null
            },
            {
                id: 3,
                shipment_name: 'UnitTestShipment3',
                eta: eta,
                status: 2,
                user_id: 8,
                created_at: Date.now(),
                updated_at: null,
                destination_id: 2,
                ship_id: 1,
                destination_name: 'UnitTestDestination2',
                destination_lon: 30.00,
                destination_lat: 40.00,
                lon: 40.00,
                lat: 30.00,
                ship_updated_at: null
            }
        ]

        ShipmentService.GetAllShipmentsForUserByStatus.mockResolvedValue(output)

        const response = await api
            .get('/api/shipments/status/2')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)
        
        expect(ShipmentService.GetAllShipmentsForUserByStatus).toHaveBeenCalledOnce()
        expect(ShipmentService.GetAllShipmentsForUserByStatus).toHaveBeenCalledWith(8, '2')
    }),

    test('Get a shipment based on id', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const output = {
            id: 3,
            shipment_name: 'UnitTestShipment3',
            eta: eta,
            status: 2,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 2,
            ship_id: 1,
            destination_name: 'UnitTestDestination2',
            destination_lon: 30.00,
            destination_lat: 40.00,
            lon: 40.00,
            lat: 30.00,
            ship_updated_at: null
        }

        ShipmentService.GetShipmentById.mockResolvedValue(output)

        const response = await api
            .get('/api/shipments/shipment/3')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(ShipmentService.GetShipmentById).toHaveBeenCalledOnce()
        expect(ShipmentService.GetShipmentById).toHaveBeenCalledWith('3', 8)
    }),

    test('Update shipment information', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const input = {
            shipment_name: 'UnitTestShipment3Edited',
            destination_id: 3
        }

        const output = {
            id: 3,
            shipment_name: 'UnitTestShipment3Edited',
            eta: eta,
            status: 2,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 3,
            ship_id: 1,
            destination_name: 'UnitTestDestination3',
            destination_lon: 34.00,
            destination_lat: 42.00,
            lon: 40.00,
            lat: 30.00,
            ship_updated_at: null
        }

        ShipmentService.UpdateShipmentInformation.mockResolvedValue(output)

        const response = await api
            .patch('/api/shipments/shipment/3')
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(ShipmentService.UpdateShipmentInformation).toHaveBeenCalledOnce()
        expect(ShipmentService.UpdateShipmentInformation).toHaveBeenCalledWith('3', 8, input)
    }),

    test('Update shipment status', async () => {
        const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const output = {
            id: 1,
            shipment_name: 'UnitTestShipment1',
            eta: eta,
            status: 2,
            user_id: 8,
            created_at: Date.now(),
            updated_at: null,
            destination_id: 1,
            ship_id: 1
        }

        ShipmentService.UpdateShipmentStatus.mockResolvedValue(output)

        const response = await api
            .patch('/api/shipments/shipment/status/1')
            .send({ status: 2 })
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(ShipmentService.UpdateShipmentStatus).toHaveBeenCalledOnce()
        expect(ShipmentService.UpdateShipmentStatus).toHaveBeenCalledWith('1', 8, { status: 2 })
    }),

    test('Delete a shipment', async () => {
        await api
            .delete('/api/shipments/shipment/3')
            .expect(204)

        expect(ShipmentService.RemoveShipment).toHaveBeenCalledOnce()
        expect(ShipmentService.RemoveShipment).toHaveBeenCalledWith('3', 8)
    })
})