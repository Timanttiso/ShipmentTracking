import { test, describe, expect, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../app.js'
import db from '../../db/db.js'
import { createTestUser } from '../helpers/authHelper.js'

const api = supertest(app)

afterAll(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, refresh_tokens, ships, user_ships RESTART IDENTITY CASCADE')
    await db.destroy()
})

describe('Shipment integration tests', async () => {
    const { user, token } = await createTestUser();

    const [shipInDb] = await db('ships').insert({
        mmsi: '210771000'
    }).returning('*');

    const [shipLinkInDb] = await db('user_ships').insert({
        user_id: user.id,
        ship_id: shipInDb.id,
        ship_nickname: 'IntegrationTestShip'
    }).returning('*');

    const [destinationInDb] = await db('destinations').insert({
        destination_name: 'IntegrationDestination',
        lon: 40.00,
        lat: 60.00,
        user_id: user.id
    }).returning('*') 

    const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const shipment1 = {
        shipment_name: 'IntegrationTestShipment1',
        eta: eta,
        destination_id: destinationInDb.id,
        ship_id: shipInDb.id
    }
    const shipment2 = {
        shipment_name: 'IntegrationTestShipment2',
        eta: eta,
        destination_id: destinationInDb.id,
        ship_id: shipInDb.id
    } 
    
    test('Add two shipments', async () => {
        const response = await api
            .post('/api/shipments/add-shipment')
            .set('Authorization', `Bearer ${token}`)
            .send(shipment1)
            .expect('Content-Type', /application\/json/)
            .expect(201)
        
        await api
            .post('/api/shipments/add-shipment')
            .set('Authorization', `Bearer ${token}`)
            .send(shipment2)
            .expect('Content-Type', /application\/json/)
            .expect(201)

        expect(response.body[0].shipment_name).toBe(shipment1.shipment_name)
        expect(response.body[0].eta).toBe(shipment1.eta)
        expect(response.body[0].destination_id).toBe(shipment1.destination_id)
        expect(response.body[0].ship_id).toBe(shipment1.ship_id)
        expect(response.body[0].user_id).toBe(user.id)
    }),

    test('Get the added shipments', async () => {
        const response = await api
            .get('/api/shipments')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)
        
        expect(response.body[0].shipment_name).toBe(shipment1.shipment_name)
        expect(response.body[0].eta).toBe(shipment1.eta)
        expect(response.body[0].destination_id).toBe(shipment1.destination_id)
        expect(response.body[0].ship_id).toBe(shipment1.ship_id)
        expect(response.body[0].user_id).toBe(user.id)

        expect(response.body[1].shipment_name).toBe(shipment2.shipment_name)
        expect(response.body[1].eta).toBe(shipment2.eta)
        expect(response.body[1].destination_id).toBe(shipment2.destination_id)
        expect(response.body[1].ship_id).toBe(shipment2.ship_id)
        expect(response.body[1].user_id).toBe(user.id)
    })
})