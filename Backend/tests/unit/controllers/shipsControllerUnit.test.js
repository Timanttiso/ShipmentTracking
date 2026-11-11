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
            AddShip: vi.fn()
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
    })
})