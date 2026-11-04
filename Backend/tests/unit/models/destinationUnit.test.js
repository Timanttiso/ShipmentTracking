import { describe, test, expect, beforeEach, afterAll } from "vitest";
import db from "../../../db/db.js";
import Destination from "../../../models/destination.js";

let user

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments RESTART IDENTITY CASCADE');
    [user] = await db('users').insert({ username: 'UnitTestUser', password_hash: 'TestPass', email:'UnitTestUser@Test.com' }).returning('*')
})

afterAll(async () => {
    await db.destroy()
})

describe('Destination model unit tests', () => {
    test('Add destination', async () => {
        const result = await Destination.add(
            { 
                destination_name: 'TestDestination',
                lon: 10.00,
                lat: 20.00
            },
            user.id
        )

        expect(result[0].id).toBeDefined()
        expect(result[0].user_id).toBe(user.id)
        expect(result[0].destination_name).toBe('TestDestination')
    }),

    test('Get all destinations for user', async () => {
        await Destination.add(
            { 
                destination_name: 'TestDestination',
                lon: 10.00,
                lat: 20.00
            },
            user.id
        )
        await Destination.add(
            { 
                destination_name: 'TestDestination2',
                lon: 20.00,
                lat: 30.00
            },
            user.id
        )

        const result = await Destination.getAllForUser(user.id)

        expect(result[0].id).toBeDefined()
        expect(result[0].destination_name).toBe('TestDestination')
        expect(result[0].lon).toBe('10.00')
        expect(result[0].lat).toBe('20.00')
        expect(result[0].user_id).toBe(user.id)

        expect(result[1].id).toBeDefined()
        expect(result[1].destination_name).toBe('TestDestination2')
        expect(result[1].lon).toBe('20.00')
        expect(result[1].lat).toBe('30.00')
        expect(result[1].user_id).toBe(user.id)
    }),

    test('Get destination by id', async () => {
        await Destination.add(
            { 
                destination_name: 'TestDestination',
                lon: 10.00,
                lat: 20.00
            },
            user.id
        )
        const targetDestination = await Destination.add(
            { 
                destination_name: 'TestDestination2',
                lon: 20.00,
                lat: 30.00
            },
            user.id
        )
        await Destination.add(
            { 
                destination_name: 'TestDestination3',
                lon: 40.00,
                lat: 50.00
            },
            user.id
        )

        const result = await Destination.getById(targetDestination[0].id, user.id)

        expect(result.id).toBe(targetDestination[0].id)
        expect(result.destination_name).toBe('TestDestination2')
        expect(result.lon).toBe('20.00')
        expect(result.lat).toBe('30.00')
        expect(result.user_id).toBe(user.id)
    }),

    test('Get destination by name', async () => {
        await Destination.add(
            { 
                destination_name: 'TestDestination',
                lon: 10.00,
                lat: 20.00
            },
            user.id
        )
        const targetDestination = await Destination.add(
            { 
                destination_name: 'TestDestination2',
                lon: 20.00,
                lat: 30.00
            },
            user.id
        )
        await Destination.add(
            { 
                destination_name: 'TestDestination3',
                lon: 40.00,
                lat: 50.00
            },
            user.id
        )

        const result = await Destination.getByName(user.id, targetDestination[0].destination_name)

        expect(result.id).toBe(targetDestination[0].id)
        expect(result.destination_name).toBe('TestDestination2')
        expect(result.lon).toBe('20.00')
        expect(result.lat).toBe('30.00')
        expect(result.user_id).toBe(user.id)
    }),

    test('Update a destination', async () => {
        const destination = await Destination.add(
            { 
                destination_name: 'TestDestination',
                lon: 20.00,
                lat: 30.00
            },
            user.id
        )

        const result = await Destination.updateDestination(destination[0].id, { destination_name: 'TestDestinationEdited', lon: 30.00, lat: 40.00 })

        expect(result[0].id).toBe(result[0].id)
        expect(result[0].destination_name).toBe('TestDestinationEdited')
        expect(result[0].lon).toBe('30.00')
        expect(result[0].lat).toBe('40.00')
        expect(result[0].user_id).toBe(user.id)
    }),

    test('Delete a destination', async () => {
        const destination = await Destination.add(
            { 
                destination_name: 'TestDestination',
                lon: 20.00,
                lat: 30.00
            },
            user.id
        )

        const result = await Destination.getById(destination[0].id, user.id)

        expect(result.id).toBe(destination[0].id)
        expect(result.destination_name).toBe('TestDestination')
        expect(result.lon).toBe('20.00')
        expect(result.lat).toBe('30.00')
        expect(result.user_id).toBe(user.id)

        await Destination.deleteDestination(destination[0].id)

        const result2 = await Destination.getById(destination[0].id, user.id)

        expect(result2).toBeNull
    })
})