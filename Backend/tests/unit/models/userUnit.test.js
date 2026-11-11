import { describe, test, expect, beforeEach, afterAll } from "vitest";
import db from "../../../db/db.js";
import User from "../../../models/user.js";

let user, destination

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments RESTART IDENTITY CASCADE');
    [user] = await db('users').insert({ username: 'UnitTestUser', password_hash: 'TestPass', email:'UnitTestUser@Test.com' }).returning('*');
    [destination] = await db('destinations').insert({ destination_name: 'UnitTestDestination', lon: 40.00, lat: 40.00, user_id: user.id }).returning('*')
})

afterAll(async () => {
    await db.destroy()
})

describe('User model unit tests', () => {
    test('Register a user', async () => {
        const result = await User.register({
            username: 'UnitTestUser2',
            password_hash: 'TestPass',
            email: 'UnitTestUser2@Test.com'
        })

        expect(result[0].id).toBeDefined()
        expect(result[0].username).toBe('UnitTestUser2')
        expect(result[0].password_hash).not.toBeDefined()
        expect(result[0].email).toBe('UnitTestUser2@Test.com')
    }),

    test('Find user by name', async () => {
        const result = await User.findByName('UnitTestUser')

        expect(result.id).toBe(user.id)
        expect(result.username).toBe(user.username)
        expect(result.password_hash).toBeDefined()
        expect(result.email).toBe(user.email)
    }),

    test('Find user by email', async () => {
        const result = await User.findByEmail('UnitTestUser@Test.com')

        expect(result.id).toBe(user.id)
        expect(result.username).toBe(user.username)
        expect(result.password_hash).toBeDefined()
        expect(result.email).toBe(user.email)
    }),

    test('Find user by id', async () => {
        const result = await User.findById(user.id)

        expect(result.id).toBe(user.id)
        expect(result.username).toBe(user.username)
        expect(result.password_hash).toBeDefined()
        expect(result.email).toBe(user.email)
    }),

    test('Update user settings', async () => {
        const result = await User.updateUserSettings(user.id, {
            username: 'UnitTestUserEdited',
            email: 'UnitTestUser@Test.com',
            default_destination_id: destination.id
        })

        expect(result[0].id).toBe(user.id),
        expect(result[0].username).toBe('UnitTestUserEdited')
        expect(result[0].email).toBe('UnitTestUser@Test.com')
        expect(result[0].password_hash).not.toBeDefined()
    }),

    test('Remove user from database', async () => {
        await User.RemoveUser(user.id)

        const nonExistantUser = await db('users').select('*').where({id: user.id})
        
        expect(nonExistantUser).not.toBeDefined
    })
})