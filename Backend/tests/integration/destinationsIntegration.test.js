import { test, describe, expect, beforeEach, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../app.js'
import db from '../../db/db.js'
import { createTestUser } from '../helpers/authHelper.js'

const api = supertest(app)

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, refresh_tokens RESTART IDENTITY CASCADE')
})

afterAll(async () => {
    await db.destroy()
})

describe('Destinations integration tests', () => {
    test('add a destination', async () => {
        const input = {
            destination_name: "TestDestination",
            lon: 0.00,
            lat: 0.00
        }

        const { user, token } = await createTestUser()

        const response = await api
            .post('/api/destinations/add-destination')
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        expect(response.body[0].destination_name).toBe(input.destination_name)
        expect(response.body[0].lon).toBe("0.00") //Would expect this to be in a numeric format, but apparently pg parses any "decimal" format value to a string
        expect(response.body[0].lat).toBe("0.00")
        expect(response.body[0].user_id).toBe(user.id)

    })
})