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

vi.doMock('../../../services/destinationService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            AddDestination: vi.fn(),
            GetAllForUser: vi.fn(),
            GetById: vi.fn(),
            UpdateDestinationInfo: vi.fn(),
            DeleteDestination: vi.fn()
        }
    }
})

const destinationService = (await import('../../../services/destinationService.js')).default
const destinationRouter = (await import ('../../../controllers/destinationController.js')).default
import middleware from '../../../utils/middleware.js'

const app = express()

app.use(cookieParser())
app.use(express.json())

app.use('/api/destinations', destinationRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const api = supertest(app)

beforeEach(() => {
    vi.resetAllMocks()
})

describe('destinationsController unit tests', () => {
    test('Add a destination', async () => {
        const input = {
            destination_name: 'TestDestination',
            lon: 0.00,
            lat: 0.00
        }
        const output = {
            destination_name: 'TestDestination',
            lon: 0.00,
            lat: 0.00,
            user_id: 8
        }

        destinationService.AddDestination.mockResolvedValue(output)

        const response = await api
            .post('/api/destinations/add-destination')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        

        expect(response.body).toEqual(output)

        expect(destinationService.AddDestination).toHaveBeenCalledTimes(1)
        expect(destinationService.AddDestination).toHaveBeenCalledWith(input, 8)
    }),
    test('Get destinations', async() => {
        const output = [{
            id: 1,
            destination_name: 'TestDestination',
            lon: 0.00,
            lat: 0.00,
            user_id: 8
        }]

        destinationService.GetAllForUser.mockResolvedValue(output)

        const response = await api
            .get('/api/destinations')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(destinationService.GetAllForUser).toHaveBeenCalledTimes(1)
        expect(destinationService.GetAllForUser).toHaveBeenCalledWith(8)
    }),
    test('Get a single destination', async() => {
        const output = {
            id: 1,
            destination_name: 'TestDestination',
            lon: 0.00,
            lat: 0.00,
            user_id: 8
        }

        destinationService.GetById.mockResolvedValue(output)

        const response = await api
            .get('/api/destinations/destination/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(destinationService.GetById).toHaveBeenCalledTimes(1)
        expect(destinationService.GetById).toHaveBeenCalledWith('1', 8)
    }),
    test('Patch a single destination', async() => {
        const input = {
            destination_name: 'TestDestinationEdited',
            lon: 0.00,
            lat: 0.00
        }

        const output = {
            id: 1,
            destination_name: 'TestDestinationEdited',
            lon: 0.00,
            lat: 0.00,
            user_id: 8
        }

        destinationService.UpdateDestinationInfo.mockResolvedValue(output)

        const response = await api
            .patch('/api/destinations/destination/1')
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(destinationService.UpdateDestinationInfo).toHaveBeenCalledTimes(1)
        expect(destinationService.UpdateDestinationInfo).toHaveBeenCalledWith('1', 8, input)
    }),
    test('Delete a destination', async() => {
        await api
            .delete('/api/destinations/destination/1')
            .expect(204)

        expect(destinationService.DeleteDestination).toHaveBeenCalledTimes(1)
        expect(destinationService.DeleteDestination).toHaveBeenCalledWith('1', 8)
    })
})