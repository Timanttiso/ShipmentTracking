import { describe, test, expect, beforeEach, afterAll } from "vitest";
import db from "../../../db/db.js";
import Ship from "../../../models/ship.js";

let user

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, ships, user_ships RESTART IDENTITY CASCADE');
    [user] = await db('users').insert({ username: 'UnitTestUser', password_hash: 'TestPass', email:'UnitTestUser@Test.com' }).returning('*')
})

afterAll(async () => {
    await db.destroy()
})

describe('Ship model unit tests', () => {
    test('Add a ship', async () => {
        const result = await Ship.Add('210771000')

        expect(result.id).toBeDefined()
        expect(result.mmsi).toBe('210771000')
    }),

    test('Get ship by mmsi', async () => {
        const addedShip = await Ship.Add('210771000')

        const output = {
            id: addedShip.id,
            ship_name: null,
            mmsi: '210771000',
            lon: null,
            lat: null,
            updated_at: null
        }

        const result = await Ship.GetByMMSI('210771000')

        expect(result).toEqual(output)
    }),

    test('Get ship by id', async () => {
        const addedShip = await Ship.Add('210771000')

        const output = {
            id: addedShip.id,
            ship_name: null,
            mmsi: '210771000',
            lon: null,
            lat: null,
            updated_at: null
        }

        const result = await Ship.GetById(addedShip.id)

        expect(result).toEqual(output)
    })
    
    test('Update ship information', async () => {
        const ship = await Ship.Add('210771000')

        const updates = {
            ship_name: 'UnitTestShipOgName',
            lon: 20.00,
            lat: 30.00,
        }

        await Ship.UpdateShipInformation('210771000', updates)

        const updatedShip = await Ship.GetById(ship.id)

        expect(updatedShip.ship_name).toBe(updates.ship_name)
        expect(updatedShip.lon).toBe(updates.lon)
        expect(updatedShip.lat).toBe(updates.lat)
    }),

    test('Update ship lon and lat using dynamic update', async () => {
        const ship = await Ship.Add('210771000')

        const updates = {
            lon: 50.00,
            lat: 20.00,
        }

        await Ship.dynamicUpdateShipInformation('210771000', updates)

        const updatedShip = await Ship.GetById(ship.id)

        expect(updatedShip.lon).toBe(updates.lon)
        expect(updatedShip.lat).toBe(updates.lat)
    }),

    test('Get MMSIs', async () => {
        const ship = await Ship.Add('210771000')
        const ship2 = await Ship.Add('305665000')

        await db('user_ships').insert({ user_id: user.id, ship_id: ship.id, ship_nickname: 'UnitTestShip1' })
        await db('user_ships').insert({ user_id: user.id, ship_id: ship2.id, ship_nickname: 'UnitTestShip2' })

        const destination1 = await db('destinations').insert({ destination_name: 'UnitTestDestination1', lon: 20.00, lat: 20.00 }).returning('*')
        const destination2 = await db('destinations').insert({ destination_name: 'UnitTestDestination2', lon: 20.00, lat: 20.00 }).returning('*')
        
        await db('shipments').insert({ shipment_name: 'UnitTestShipment1', eta: '2026-12-24 14:34:56.789+02', status: 1, user_id: user.id, created_at: '2026-12-24 14:34:56.789+02', updated_at: null, destination_id: destination1.id, ship_id: ship.id })
        await db('shipments').insert({ shipment_name: 'UnitTestShipment2', eta: '2026-12-24 14:34:56.789+02', status: 1, user_id: user.id, created_at: '2026-12-24 14:34:56.789+02', updated_at: null, destination_id: destination2.id, ship_id: ship2.id })

        const output = [
            {
                mmsi: '210771000'
            },
            {
                mmsi: '305665000'
            }
        ]

        const result = await Ship.getMMSIs()

        expect(result).toEqual(output)
    }),

    test('Delete depricated ships', async () => {
        const ship = await Ship.Add('210771000')
        await Ship.Add('305665000')

        await db('user_ships').insert({ user_id: user.id, ship_id: ship.id, ship_nickname: 'UnitTestShip1' })

        const result = await Ship.DeleteDeprecated()

        expect(result).toBe(1)
    })
})