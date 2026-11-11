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

describe('Ship integration tests', async () => {
    const { user, token } = await createTestUser();
    const { user: user2, token: token2 } = await createTestUser();

    test('Add two new ships', async () => {
        const input = {
            ship_nickname: 'IntegrationTestShip',
            mmsi: '305665000'
        }
        const input2 = {
            ship_nickname: 'IntegrationTestShip2',
            mmsi: '210771000'
        }

        const response = await api
            .post('/api/ships/add-ship')
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .expect('Content-Type', /application\/json/)
            .expect(201)

        await api
            .post('/api/ships/add-ship')
            .set('Authorization', `Bearer ${token}`)
            .send(input2)
            .expect('Content-Type', /application\/json/)
            .expect(201)

        expect(response.body.id).toBeDefined()
        expect(response.body.ship_nickname).toBe(input.ship_nickname)
        expect(response.body.mmsi).toBe(input.mmsi)

        const ships = await db('ships').select('*').where({ mmsi: input.mmsi })
        const shipLinks = await db('user_ships').select('*').where({ ship_id: response.body.id })

        expect(ships.length).toBe(1)
        expect(shipLinks.length).toBe(1)
    }),

    test('Add an existing ship', async () => {
        const input = {
            ship_nickname: 'IntegrationTestShip3',
            mmsi: '305665000'
        }

        const response = await api
            .post('/api/ships/add-ship')
            .set('Authorization', `Bearer ${token2}`)
            .send(input)
            .expect('Content-Type', /application\/json/)
            .expect(201)

        expect(response.body.id).toBeDefined()
        expect(response.body.ship_nickname).toBe(input.ship_nickname)
        expect(response.body.mmsi).toBe(input.mmsi)

        const ships = await db('ships').select('*').where({ mmsi: input.mmsi })
        const shipLinks = await db('user_ships').select('*').where({ ship_id: response.body.id })

        expect(ships.length).toBe(1)
        expect(shipLinks.length).toBe(2)
    }),

    test('Get all ships for the current user', async () => {
        const response = await api
            .get('/api/ships/')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body[0].id).toBeDefined()
        expect(response.body[0].ship_nickname).toBe('IntegrationTestShip')
        expect(response.body[0].mmsi).toBe('305665000')

        expect(response.body[1].id).toBeDefined()
        expect(response.body[1].ship_nickname).toBe('IntegrationTestShip2')
        expect(response.body[1].mmsi).toBe('210771000')
    }),

    test('Get a specific ship with the ship id', async () => {
        const shipInDb = await db('ships').select('*').where({ mmsi: '210771000'}).first()

        const response = await api
            .get(`/api/ships/ship/${shipInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body.id).toBeDefined()
        expect(response.body.ship_nickname).toBe('IntegrationTestShip2')
        expect(response.body.mmsi).toBe('210771000')
    }),

    test('Update ship nickname', async () => {
        const shipInDb = await db('ships').select('*').where({ mmsi: '210771000'}).first()

        const input = {
            ship_nickname: 'IntegrationTestShip2Edited',
            mmsi: null
        }

        const response = await api
            .patch(`/api/ships/ship/${shipInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        expect(response.body.id).toBe(shipInDb.id)
        expect(response.body.ship_nickname).toBe(input.ship_nickname)
        expect(response.body.mmsi).toBe('210771000')
    }),

    test('Update ship mmsi with a new ship', async () => {
        const shipInDb = await db('ships').select('*').where({ mmsi: '305665000'}).first()
        const shipLinkBefore = await db('user_ships').select('*').where({ user_id: user.id})

        const input = {
            ship_nickname: null,
            mmsi: '230981710'
        }

        const response = await api
            .patch(`/api/ships/ship/${shipInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(input)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        const shipInDb2 = await db('ships').select('*').where({ mmsi: '230981710'}).first()
        const shipsInDb = await db('ships').select('*')
        const shipLinkAfter = await db('user_ships').select('*').where({ user_id: user.id})

        expect(response.body.id).toBe(shipInDb2.id)
        expect(response.body.ship_nickname).toBe('IntegrationTestShip')
        expect(response.body.mmsi).toBe(input.mmsi)
        expect(shipsInDb.length).toBe(3)
        expect(shipLinkBefore.length).toBe(shipLinkAfter.length)
    }),

    test('Update ship mmsi with an already existing ship', async () => {
        const shipInDb = await db('ships').select('*').where({ mmsi: '305665000'}).first()
        const shipLinkBefore = await db('user_ships').select('*').where({ user_id: user.id})

        const input = {
            ship_nickname: null,
            mmsi: '210771000'
        }

        const response = await api
            .patch(`/api/ships/ship/${shipInDb.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .send(input)
            .expect('Content-Type', /application\/json/)
            .expect(200)

        const shipInDb2 = await db('ships').select('*').where({ mmsi: '210771000'}).first()
        const shipsInDb = await db('ships').select('*')
        const shipLinkAfter = await db('user_ships').select('*').where({ user_id: user.id})

        expect(response.body.id).toBe(shipInDb2.id)
        expect(response.body.ship_nickname).toBe('IntegrationTestShip3')
        expect(response.body.mmsi).toBe(input.mmsi)
        expect(shipsInDb.length).toBe(3)
        expect(shipLinkBefore.length).toBe(shipLinkAfter.length)
    }),

    test('Unfollow a ship', async () => {
        const shipInDb = await db('ships').select('*').where({ mmsi: '230981710'}).first()
        const shipLinkBefore = await db('user_ships').select('*').where({ user_id: user.id})

        await api
            .delete(`/api/ships/unfollow/${shipInDb.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const shipsInDb = await db('ships').select('*')
        const shipLinkAfter = await db('user_ships').select('*').where({ user_id: user.id})

        expect(shipsInDb.length).toBe(3)
        expect(shipLinkAfter.length).toBe(shipLinkBefore.length-1)
    })
})