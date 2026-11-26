import { describe, test, expect, beforeEach, afterAll } from "vitest";
import db from "../../../db/db.js";
import Shipment from "../../../models/shipment.js";

let user, user2, destination, ship, ship2, user_ship, user_ship2

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, ships, user_ships RESTART IDENTITY CASCADE');
    [user] = await db('users').insert({ username: 'UnitTestUser', password_hash: 'TestPass', email:'UnitTestUser@Test.com' }).returning('*');
    [user2] = await db('users').insert({ username: 'UnitTestUser2', password_hash: 'TestPass2', email:'UnitTestUser2@Test.com' }).returning('*');
    [destination] = await db('destinations').insert({ destination_name: 'UnitTestDestination', lon: 20.00, lat: 40.00, user_id: user.id }).returning('*');
    [ship] = await db('ships').insert({ ship_name: 'UNITTESTSHIP', mmsi: '230000001', lon: 20.00, lat: 60.00 }).returning('*');
    [ship2] = await db('ships').insert({ ship_name: 'UNITTESTSHIP2', mmsi: '230000002', lon: 20.00, lat: 30.00 }).returning('*');
    [user_ship] = await db('user_ships').insert({ user_id: user.id, ship_id: ship.id, ship_nickname: 'UnitTestShip'}).returning('*');
    [user_ship2] = await db('user_ships').insert({ user_id: user.id, ship_id: ship2.id, ship_nickname: 'UnitTestShip2'}).returning('*')
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
    }),

    test('Get all shipments for the user', async () => {
        const input1 = {
            shipment_name: 'UnitTestShipment1',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }
        const input2 = {
            shipment_name: 'UnitTestShipment2',
            eta: eta,
            status: 1,
            user_id: user2.id,
            destination_id: destination.id,
            ship_id: ship.id
        }
        const input3 = {
            shipment_name: 'UnitTestShipment3',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }

        await Shipment.add(input1)
        await Shipment.add(input2)
        await Shipment.add(input3)

        const result = await Shipment.getAllForUser(user.id)

        expect(result[0].id).toBeDefined()
        expect(result[0].shipment_name).toEqual(input1.shipment_name)
        expect(result[0].eta).toBeDefined()
        expect(result[0].status).toEqual(input1.status)
        expect(result[0].user_id).toEqual(input1.user_id)
        expect(result[0].ship_id).toEqual(input1.ship_id)
        expect(result[0].destination_name).toEqual(destination.destination_name)
        expect(result[0].destination_lon).toEqual(destination.lon)
        expect(result[0].destination_lat).toEqual(destination.lat)
        expect(result[0].ship_name).toEqual(ship.ship_name)
        expect(result[0].mmsi).toEqual(ship.mmsi)
        expect(result[0].lon).toEqual(ship.lon)
        expect(result[0].lat).toEqual(ship.lat)

        expect(result[1].id).toBeDefined()
        expect(result[1].shipment_name).toEqual(input3.shipment_name)
        expect(result[1].eta).toBeDefined()
        expect(result[1].status).toEqual(input3.status)
        expect(result[1].user_id).toEqual(input3.user_id)
        expect(result[1].ship_id).toEqual(input3.ship_id)
        expect(result[1].destination_name).toEqual(destination.destination_name)
        expect(result[1].destination_lon).toEqual(destination.lon)
        expect(result[1].destination_lat).toEqual(destination.lat)
        expect(result[1].ship_name).toEqual(ship.ship_name)
        expect(result[1].mmsi).toEqual(ship.mmsi)
        expect(result[1].lon).toEqual(ship.lon)
        expect(result[1].lat).toEqual(ship.lat)
    }),

    test('Get all shipments for the user sorted by arrived status (2)', async () => {
        const input1 = {
            shipment_name: 'UnitTestShipment1',
            eta: eta,
            status: 2,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }
        const input2 = {
            shipment_name: 'UnitTestShipment2',
            eta: eta,
            status: 1,
            user_id: user2.id,
            destination_id: destination.id,
            ship_id: ship.id
        }
        const input3 = {
            shipment_name: 'UnitTestShipment3',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }
        const input4 = {
            shipment_name: 'UnitTestShipment4',
            eta: eta,
            status: 2,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }

        await Shipment.add(input1)
        await Shipment.add(input2)
        await Shipment.add(input3)
        await Shipment.add(input4)

        const result = await Shipment.getAllForUserByStatus(user.id, 2)

        expect(result[0].id).toBeDefined()
        expect(result[0].shipment_name).toEqual(input1.shipment_name)
        expect(result[0].eta).toBeDefined()
        expect(result[0].status).toEqual(input1.status)
        expect(result[0].user_id).toEqual(input1.user_id)
        expect(result[0].ship_id).toEqual(input1.ship_id)
        expect(result[0].destination_name).toEqual(destination.destination_name)
        expect(result[0].destination_lon).toEqual(destination.lon)
        expect(result[0].destination_lat).toEqual(destination.lat)
        expect(result[0].ship_name).toEqual(ship.ship_name)
        expect(result[0].mmsi).toEqual(ship.mmsi)
        expect(result[0].lon).toEqual(ship.lon)
        expect(result[0].lat).toEqual(ship.lat)

        expect(result[1].id).toBeDefined()
        expect(result[1].shipment_name).toEqual(input4.shipment_name)
        expect(result[1].eta).toBeDefined()
        expect(result[1].status).toEqual(input4.status)
        expect(result[1].user_id).toEqual(input4.user_id)
        expect(result[1].ship_id).toEqual(input4.ship_id)
        expect(result[1].destination_name).toEqual(destination.destination_name)
        expect(result[1].destination_lon).toEqual(destination.lon)
        expect(result[1].destination_lat).toEqual(destination.lat)
        expect(result[1].ship_name).toEqual(ship.ship_name)
        expect(result[1].mmsi).toEqual(ship.mmsi)
        expect(result[1].lon).toEqual(ship.lon)
        expect(result[1].lat).toEqual(ship.lat)
    }),

    test('Get shipment based on id', async () => {
        const input1 = {
            shipment_name: 'UnitTestShipment1',
            eta: eta,
            status: 2,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }
        const input2 = {
            shipment_name: 'UnitTestShipment2',
            eta: eta,
            status: 1,
            user_id: user2.id,
            destination_id: destination.id,
            ship_id: ship.id
        }
        const input3 = {
            shipment_name: 'UnitTestShipment3',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }

        await Shipment.add(input1)
        const wantedShipment = await Shipment.add(input2)
        await Shipment.add(input3)

        const result = await Shipment.getById(wantedShipment[0].id, user2.id)

        expect(result.id).toBeDefined()
        expect(result.shipment_name).toEqual(input2.shipment_name)
        expect(result.eta).toBeDefined()
        expect(result.status).toEqual(input2.status)
        expect(result.user_id).toEqual(input2.user_id)
        expect(result.ship_id).toEqual(input2.ship_id)
        expect(result.destination_name).toEqual(destination.destination_name)
        expect(result.destination_lon).toEqual(destination.lon)
        expect(result.destination_lat).toEqual(destination.lat)
        expect(result.ship_name).toEqual(ship.ship_name)
        expect(result.mmsi).toEqual(ship.mmsi)
        expect(result.lon).toEqual(ship.lon)
        expect(result.lat).toEqual(ship.lat)
    }),

    test('Update shipment information', async () => {
        const input = {
            shipment_name: 'UnitTestShipment',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }

        const updateInput = {
            shipment_name: 'UnitTestShipmentEdited',
            ship_id: ship2.id
        }

        const shipmentToUpdate = await Shipment.add(input)

        await Shipment.updateShipmentInformation(shipmentToUpdate[0].id, user.id, updateInput)

        const updatedShipment = await Shipment.getById(shipmentToUpdate[0].id, user.id)

        expect(updatedShipment.id).toBeDefined()
        expect(updatedShipment.shipment_name).toEqual(updateInput.shipment_name)
        expect(updatedShipment.eta).toBeDefined()
        expect(updatedShipment.status).toEqual(input.status)
        expect(updatedShipment.user_id).toEqual(input.user_id)
        expect(updatedShipment.ship_id).toEqual(updateInput.ship_id)
        expect(updatedShipment.destination_name).toEqual(destination.destination_name)
        expect(updatedShipment.destination_lon).toEqual(destination.lon)
        expect(updatedShipment.destination_lat).toEqual(destination.lat)
        expect(updatedShipment.ship_name).toEqual(ship2.ship_name)
        expect(updatedShipment.mmsi).toEqual(ship2.mmsi)
        expect(updatedShipment.lon).toEqual(ship2.lon)
        expect(updatedShipment.lat).toEqual(ship2.lat)
    }),

    test('Update shipment status', async () => {
        const input = {
            shipment_name: 'UnitTestShipment',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }

        const updateInput = {
            status: 2
        }

        const shipmentToUpdate = await Shipment.add(input)

        await Shipment.updateShipmentStatus(shipmentToUpdate[0].id, user.id, updateInput)

        const updatedShipment = await Shipment.getById(shipmentToUpdate[0].id, user.id)

        expect(updatedShipment.id).toBeDefined()
        expect(updatedShipment.shipment_name).toEqual(input.shipment_name)
        expect(updatedShipment.eta).toBeDefined()
        expect(updatedShipment.status).toEqual(updateInput.status)
        expect(updatedShipment.user_id).toEqual(input.user_id)
        expect(updatedShipment.ship_id).toEqual(input.ship_id)
        expect(updatedShipment.destination_name).toEqual(destination.destination_name)
        expect(updatedShipment.destination_lon).toEqual(destination.lon)
        expect(updatedShipment.destination_lat).toEqual(destination.lat)
        expect(updatedShipment.ship_name).toEqual(ship.ship_name)
        expect(updatedShipment.mmsi).toEqual(ship.mmsi)
        expect(updatedShipment.lon).toEqual(ship.lon)
        expect(updatedShipment.lat).toEqual(ship.lat)
    }),

    test('Remove shipment', async () => {
        const input = {
            shipment_name: 'UnitTestShipment',
            eta: eta,
            status: 1,
            user_id: user.id,
            destination_id: destination.id,
            ship_id: ship.id
        }

        const addedShipment = await Shipment.add(input)

        let existingShipment = await Shipment.getById(addedShipment[0].id, user.id)

        expect(existingShipment).toBeDefined()

        await Shipment.removeShipment(addedShipment[0].id)

        existingShipment = await Shipment.getById(addedShipment[0].id, user.id)

        expect(existingShipment).toBeUndefined()
    })
})