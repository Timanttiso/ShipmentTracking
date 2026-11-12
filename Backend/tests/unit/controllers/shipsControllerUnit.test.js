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

vi.doMock('../../../services/shipService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            AddShip: vi.fn(),
            GetAllUserShips: vi.fn(),
            GetSpecificShip: vi.fn(),
            UpdateShip: vi.fn(),
            UnFollowShip: vi.fn()
        }
    }
})

const shipService = (await import('../../../services/shipService.js')).default
const shipsRouter = (await import ('../../../controllers/shipsController.js')).default

import middleware from '../../../utils/middleware.js'

const app = express()

app.use(cookieParser())
app.use(express.json())

app.use('/api/ships', shipsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const api = supertest(app)

beforeEach(() => {
    vi.resetAllMocks()
})

describe('Ships controller unit tests', async () => {
    test('Add a ship', async () => {
        const input = {
            ship_nickname: 'UnitTestShip',
            mmsi: '210771000'
        }

        const output = {
            id: 1,
            ship_nickname: 'UnitTestShip',
            ship_name: null,
            mmsi: '210771000',
            lon: null,
            lat: null,
            updated_at: null
        }

        shipService.AddShip.mockResolvedValue(output)

        const response = await api
            .post('/api/ships/add-ship')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        expect(shipService.AddShip).toHaveBeenCalledOnce()
        expect(shipService.AddShip).toHaveBeenCalledWith(8, input.ship_nickname, input.mmsi)

        expect(response.body).toEqual(output)
    }),

    test('Get all ships for the user', async () => {
        const output = [
            {
                id: 1,
                ship_nickname: 'UnitTestShip',
                ship_name: null,
                mmsi: '210771000',
                lon: null,
                lat: null,
                updated_at: null
            },
            {
                id: 2,
                ship_nickname: 'UnitTestShip2',
                ship_name: null,
                mmsi: '230981710',
                lon: null,
                lat: null,
                updated_at: null
            }
        ]

        shipService.GetAllUserShips.mockResolvedValue(output)

        const response = await api
            .get('/api/ships/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(shipService.GetAllUserShips).toHaveBeenCalledOnce()
        expect(shipService.GetAllUserShips).toHaveBeenCalledWith(8)
        expect(response.body).toEqual(output)
    }),

    test('Get a specific ship by id', async () => {
        const output = {
            id: 2,
            ship_nickname: 'UnitTestShip2',
            ship_name: null,
            mmsi: '230981710',
            lon: null,
            lat: null,
            updated_at: null
        }

        shipService.GetSpecificShip.mockResolvedValue(output)

        const response = await api
            .get('/api/ships/ship/2')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        expect(shipService.GetSpecificShip).toHaveBeenCalledOnce()
        expect(shipService.GetSpecificShip).toHaveBeenCalledWith(8, '2')
        expect(response.body).toEqual(output)
    }),

    test('Update ship', async () => {
        const input = {
            ship_nickname: 'UnitTestShip2Edited',
            mmsi: '305665000'
        }

        const output = {
            id: 3,
            ship_nickname: 'UnitTestShip2Edited',
            ship_name: null,
            mmsi: '305665000',
            lon: null,
            lat: null,
            updated_at: null
        }

        shipService.UpdateShip.mockResolvedValue(output)

        const response = await api
            .patch('/api/ships/ship/2')
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(shipService.UpdateShip).toHaveBeenCalledOnce()
        expect(shipService.UpdateShip).toHaveBeenCalledWith(8, '2', input)
        expect(response.body).toEqual(output)

    }),

    test('Unfollow a ship', async () => {
        await api
            .delete('/api/ships/unfollow/3')
            .expect(204)
        
        expect(shipService.UnFollowShip).toHaveBeenCalledOnce()
        expect(shipService.UnFollowShip).toHaveBeenCalledWith(8, '3')
    })
})