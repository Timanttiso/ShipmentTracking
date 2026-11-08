import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import middleware from '../../../utils/middleware.js'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

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

vi.doMock('../../../services/userService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            register: vi.fn(),
            getById: vi.fn(),
            checkCredentials: vi.fn()
        }
    }
})

vi.doMock('../../../services/refreshTokenService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            create: vi.fn()
        }
    }
})

vi.doMock('../../../services/destinationService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            GetDefault: vi.fn()
        }
    }
})

const userService = (await import('../../../services/userService.js')).default
const destinationService = (await import('../../../services/destinationService.js')).default
const refreshTokenService = (await import('../../../services/refreshTokenService.js')).default
const usersRouter = (await import ('../../../controllers/usersController.js')).default
import middleware from '../../../utils/middleware.js'

const app = express()

app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const api = supertest(app)

beforeEach(() => {
    vi.resetAllMocks()
})

describe('usersController unit tests', () => {
    test('Register a user', async() => {
        const input = {
            username: 'unitTestUser',
            password: 'testPassword2!',
            email: 'unitTestUser@test.com'
        }
        const output = {
            username: 'unitTestUser',
            password: 'testPassword2!',
            email: 'unitTestUser@test.com',
            user_id: 1
        }

        userService.register.mockResolvedValue(output)

        const response = await api
            .post('/api/auth/register')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(output)

        expect(userService.register).toHaveBeenCalledTimes(1)
        expect(userService.register).toHaveBeenCalledWith(input)
    }),

    test('Use the me endpoint to retrieve user information', async () => {
        const desiredResult = {
            id: 8,
            username: 'unitTestUser',
            email: 'unitTestUser@test.com',
            default_destination_id: 1,
            default_destination_name: 'UnitTestDestination'
        }

        const getbyIdResult = {
            id: 8,
            username: 'unitTestUser',
            password_hash: '123',
            email: 'unitTestUser@test.com',
            default_destination_id: 1
        }

        const getDefaultResult = {
            id: 1,
            destination_name: 'UnitTestDestination',
            lon: 20,
            lat: 30,
            user_id: 8
        }

        userService.getById.mockResolvedValue(getbyIdResult)
        destinationService.GetDefault.mockResolvedValue(getDefaultResult)

        const response = await api
            .get('/api/auth/me')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(desiredResult)
    }),

    test('Login the user, send a token and set refresh token cookie', async () => {
        const loginValues = {
            username: 'unitTestUser',
            password: 'testPassword1!'
        }

        userService.checkCredentials.mockResolvedValue({ id: 8, username: 'unitTestUser'})

        const response = await api
            .post('/api/auth/login')
            .send(loginValues)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const payload = jwt.verify(response.body.token, process.env.JWT_SECRET)
        expect(payload.userId).toBe(8)

        const cookie = response.headers['set-cookie'].find((c) => c.startsWith('refreshToken='))
        expect(cookie).toBeDefined()
    })
})