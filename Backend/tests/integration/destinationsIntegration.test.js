import { test, describe, expect, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../app.js'
import db from '../../db/db.js'
import { createTestUser } from '../helpers/authHelper.js'

const api = supertest(app)

afterAll(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, refresh_tokens RESTART IDENTITY CASCADE')
    await db.destroy()
})

describe('Destinations integration tests', async () => {
    const { user, token } = await createTestUser()
    test('add two destinations', async () => {
        const input = {
            destination_name: 'TestDestination',
            lon: 0.00,
            lat: 0.00
        }
        const input2 = {
            destination_name: 'TestDestination2',
            lon: 0.00,
            lat: 0.00
        }
        
        const response = await api
            .post('/api/destinations/add-destination')
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        await api
            .post('/api/destinations/add-destination')
            .set('Authorization', `Bearer ${token}`)
            .send(input2)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body[0].destination_name).toBe(input.destination_name)
        expect(response.body[0].lon).toBe('0.00') //Would expect this to be in a numeric format, but apparently pg parses any "decimal" format value to a string
        expect(response.body[0].lat).toBe('0.00')
        expect(response.body[0].user_id).toBe(user.id)

    }),

    test('Try to add a duplicate', async () => {
        const input = {
            destination_name: 'TestDestination',
            lon: 0.00,
            lat: 0.00
        }
        
        const response = await api
            .post('/api/destinations/add-destination')
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .expect(409)
            .expect('Content-Type', /application\/json/)
        
        expect(response.body.error).toBe('Tämä sijainti on jo olemassa')
        
    }),

    test('Get the destinations', async () => {
        const response = await api
            .get('/api/destinations')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body[0].destination_name).toBe('TestDestination')
        expect(response.body[1].destination_name).toBe('TestDestination2')
    }),

    test('Get one of the destinations', async () => {
        const destination = await db.select('id').from('destinations').where({destination_name: 'TestDestination2'}).first()

        const response = await api
            .get(`/api/destinations/destination/${destination.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.destination_name).toBe('TestDestination2')
    }),

    test('Patch a destination', async () => {
        const destination = await db.select('id').from('destinations').where({destination_name: 'TestDestination2'}).first()

        const input = {
            destination_name: 'TestDestination2Edited'
        }

        await api
            .patch(`/api/destinations/destination/${destination.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

    }),

    test('Get destination to check it was updated', async () => {
        const destination = await db.select('id').from('destinations').where({destination_name: 'TestDestination2Edited'}).first()

        const response = await api
            .get(`/api/destinations/destination/${destination.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.destination_name).toBe('TestDestination2Edited')
    }),

    test('Delete the destination', async () => {
        const destination = await db.select('id').from('destinations').where({destination_name: 'TestDestination2Edited'}).first()

        await api
            .delete(`/api/destinations/destination/${destination.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
    })
})