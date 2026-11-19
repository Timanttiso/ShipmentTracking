import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import middleware from '../../../utils/middleware.js'
import cookieParser from 'cookie-parser'

const healthRouter = (await import ('../../../controllers/healthController.js')).default
import middleware from '../../../utils/middleware.js'

const app = express()

app.use(cookieParser())
app.use(express.json())

app.use('/api/health', healthRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const api = supertest(app)

describe('Health controller unit tests', () => {
    test('Live endpoint returns status ok', async () => {
        const result = await api
            .get('/api/health/live')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ status: 'Ok' })
    }),

    test('Ready endpoint returns status ok and database up', async () => {
        const result = await api
            .get('/api/health/ready')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ status: 'Ok', database: 'up' })
    })
})