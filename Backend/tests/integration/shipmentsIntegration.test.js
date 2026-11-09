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

    const [destinationInDb2] = await db('destinations').insert({
        destination_name: 'IntegrationDestination2',
        lon: 50.00,
        lat: 50.00,
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
    const shipment3 = {
        shipment_name: 'IntegrationTestShipment3',
        eta: eta,
        destination_id: destinationInDb.id,
        ship_id: shipInDb.id
    } 

    const shipment2Edited = {
        shipment_name: 'IntegrationTestShipment2Edited',
        eta: eta,
        destination_id: destinationInDb2.id,
        ship_id: shipInDb.id
    }
    
    test('Add three shipments', async () => {
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

        await api
            .post('/api/shipments/add-shipment')
            .set('Authorization', `Bearer ${token}`)
            .send(shipment3)
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

        expect(response.body[2].shipment_name).toBe(shipment3.shipment_name)
        expect(response.body[2].eta).toBe(shipment3.eta)
        expect(response.body[2].destination_id).toBe(shipment3.destination_id)
        expect(response.body[2].ship_id).toBe(shipment3.ship_id)
        expect(response.body[2].user_id).toBe(user.id)
    }),

    test('Get a shipment by id', async () => {
        const shipmentInDb = await db('shipments').where({shipment_name: shipment2.shipment_name}).first()

        const response = await api
            .get(`/api/shipments/shipment/${shipmentInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body.shipment_name).toBe(shipment2.shipment_name)
        expect(response.body.eta).toBe(shipment2.eta)
        expect(response.body.destination_id).toBe(shipment2.destination_id)
        expect(response.body.ship_id).toBe(shipment2.ship_id)
        expect(response.body.user_id).toBe(user.id)
    }),

    test('Update shipment status', async () => {
        const shipmentInDb = await db('shipments').where({shipment_name: shipment2.shipment_name}).first()

        const response = await api
            .patch(`/api/shipments/shipment/status/${shipmentInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status:2 })
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body[0].shipment_name).toBe(shipment2.shipment_name)
        expect(response.body[0].eta).toBe(shipment2.eta)
        expect(response.body[0].destination_id).toBe(shipment2.destination_id)
        expect(response.body[0].status).toBe(2)
        expect(response.body[0].ship_id).toBe(shipment2.ship_id)
        expect(response.body[0].user_id).toBe(user.id)
    }),

    test('Get shipments by in transit status (1)', async () => {
        const response = await api
            .get(`/api/shipments/status/1`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body[0].shipment_name).toBe(shipment1.shipment_name)
        expect(response.body[0].eta).toBe(shipment1.eta)
        expect(response.body[0].destination_id).toBe(shipment1.destination_id)
        expect(response.body[0].ship_id).toBe(shipment1.ship_id)
        expect(response.body[0].user_id).toBe(user.id)

        expect(response.body[1].shipment_name).toBe(shipment3.shipment_name)
        expect(response.body[1].eta).toBe(shipment3.eta)
        expect(response.body[1].destination_id).toBe(shipment3.destination_id)
        expect(response.body[1].ship_id).toBe(shipment3.ship_id)
        expect(response.body[1].user_id).toBe(user.id)
    }),

    test('Get shipments with arrived status (2)', async () => {
        const response = await api
            .get(`/api/shipments/status/2`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body[0].shipment_name).toBe(shipment2.shipment_name)
        expect(response.body[0].eta).toBe(shipment2.eta)
        expect(response.body[0].destination_id).toBe(shipment2.destination_id)
        expect(response.body[0].ship_id).toBe(shipment2.ship_id)
        expect(response.body[0].user_id).toBe(user.id)
    }),

    test('Update shipment information', async () => {
        const shipmentInDb = await db('shipments').where({shipment_name: shipment2.shipment_name}).first()

        const response = await api
            .patch(`/api/shipments/shipment/${shipmentInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(shipment2Edited)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body[0].shipment_name).toBe(shipment2Edited.shipment_name)
        expect(response.body[0].eta).toBe(shipment2Edited.eta)
        expect(response.body[0].destination_id).toBe(shipment2Edited.destination_id)
        expect(response.body[0].ship_id).toBe(shipment2Edited.ship_id)
        expect(response.body[0].user_id).toBe(user.id)
    }),

    test('Delete a shipment', async () => {
        let shipmentInDb = await db('shipments').where({shipment_name: shipment2Edited.shipment_name}).first()

        await api
            .delete(`/api/shipments/shipment/${shipmentInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        shipmentInDb = await db('shipments').where({shipment_name: shipment2Edited.shipment_name}).first()

        expect(shipmentInDb).not.toBeDefined()
    })
})