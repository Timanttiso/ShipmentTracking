import { describe, test, expect, beforeEach, afterAll } from "vitest";
import db from "../../../db/db.js";
import Shipment from "../../../models/shipment.js";

let user, destination, ship, user_ship

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, ships, user_ships RESTART IDENTITY CASCADE');
    [user] = await db('users').insert({ username: 'UnitTestUser', password_hash: 'TestPass', email:'UnitTestUser@Test.com' }).returning('*');
    [destination] = await db('destinations').insert({ destination_name: 'UnitTestDestination', lon: 20.00, lat: 40.00, user_id: user.id }).returning('*');
    [ship] = await db('ships').insert({ ship_name: 'UNITTESTSHIP', mmsi: '230000001', lon: 20.00, lat: 60.00 }).returning('*');
    [user_ship] = await db('user_ships').insert({ user_id: user.id, ship_id: ship.id, ship_nickname: 'UnitTestShip'}).returning('*')
})

afterAll(async () => {
    await db.destroy()
})

describe('Shipment model unit tests', () => {
    const eta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    test('Add shipment', async () => {
        const input = {
            shipment_name: 'UnitTestShipment',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }

        const result = await Shipment.add(input)

        expect(result[0].id).toBeDefined()
        expect(result[0].shipment_name).toEqual(input.shipment_name)
        expect(result[0].eta).toBeDefined()
        expect(result[0].status).toEqual(input.status)
        expect(result[0].user_id).toEqual(input.user_id)
        expect(result[0].ship_id).toEqual(input.ship_id)
    })
})