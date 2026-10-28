import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import middleware from '../../../utils/middleware.js'
import cookieParser from 'cookie-parser'

vi.doMock('../../../services/userService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            register: vi.fn()
        }
    }
})

const userService = (await import('../../../services/userService.js')).default
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
    })
})