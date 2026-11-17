import { describe, test, expect, beforeEach, afterAll } from "vitest";
import db from "../../../db/db.js";
import User_Ship from '../../../models/user_ship.js'

let user, ship, ship2, ship3, link1, link2

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, ships, user_ships RESTART IDENTITY CASCADE');
    [user] = await db('users').insert({ username: 'UnitTestUser', password_hash: 'TestPass', email:'UnitTestUser@Test.com' }).returning('*');
    [ship] = await db('ships').insert({ mmsi: '210771000' }).returning('*');
    [ship2] = await db('ships').insert({ mmsi: '305665000' }).returning('*');
    [ship3] = await db('ships').insert({ mmsi: '230981710' }).returning('*');
    [link1] = await db('user_ships').insert({ user_id: user.id, ship_id: ship.id, ship_nickname: 'UnitTestShip1'}).returning('*');
    [link2] = await db('user_ships').insert({ user_id: user.id, ship_id: ship2.id, ship_nickname: 'UnitTestShip2'}).returning('*')
})

afterAll(async () => {
    await db.destroy()
})

describe('User ship model unit tests', () => {
    test('Add a ship link', async () => {
        const output = {
            user_id: user.id,
            ship_id: ship.id,
            ship_nickname: 'UnitTestShip'
        }

        const result = await User_Ship.Add(user.id, ship.id, 'UnitTestShip')

        expect(result[0].user_ship_id).toBeDefined()
        expect(result[0].user_id).toBe(output.user_id)
        expect(result[0].ship_id).toBe(output.ship_id)
        expect(result[0].ship_nickname).toBe(output.ship_nickname)
    }),

    test('Get user ships', async () => {
        const output = [
            {
                ship_nickname: link1.ship_nickname,
                id: ship.id,
                ship_name: null,
                mmsi: ship.mmsi,
                lon: null,
                lat: null,
                updated_at: null
            },
            {
                ship_nickname: link2.ship_nickname,
                id: ship2.id,
                ship_name: null,
                mmsi: ship2.mmsi,
                lon: null,
                lat: null,
                updated_at: null
            }
        ]

        const result = await User_Ship.GetUserShips(user.id)

        expect(result).toEqual(output)
    }),

    test('Get ship for user by ship id', async () => {
        const output = {
            ship_nickname: link1.ship_nickname,
            id: ship.id,
            ship_name: null,
            mmsi: ship.mmsi,
            lon: null,
            lat: null,
            updated_at: null
        }

        const result = await User_Ship.GetUserShipByShipId(user.id, ship.id)

        expect(result).toEqual(output)
    }),

    test('Update ship link nickname', async () => {
        const output = {
            ship_nickname: 'UnitTestShip1Edited',
            id: ship.id,
            ship_name: null,
            mmsi: ship.mmsi,
            lon: null,
            lat: null,
            updated_at: null
        }

        await User_Ship.UpdateShipNickname(user.id, ship.id, 'UnitTestShip1Edited')

        const updatedShipLink = await User_Ship.GetUserShipByShipId(user.id, ship.id)

        expect(updatedShipLink).toEqual(output)
    }),

    test('Update ship connection with mmsi', async () => {
        const output = {
            ship_nickname: 'UnitTestShip1',
            id: ship3.id,
            ship_name: null,
            mmsi: ship3.mmsi,
            lon: null,
            lat: null,
            updated_at: null
        }

        await User_Ship.UpdateConnection(user.id, ship3.id, ship.id)

        const updatedShipLink = await User_Ship.GetUserShipByShipId(user.id, ship3.id)

        expect(updatedShipLink).toEqual(output)
    }),

    test('Unfollow a ship', async () => {
        let shipLink = await User_Ship.GetUserShipByShipId(user.id, ship.id)

        expect(shipLink.id).toBeDefined()

        await User_Ship.UnfollowShip(user.id, ship.id)

        shipLink = await User_Ship.GetUserShipByShipId(user.id, ship.id)
        
        expect(shipLink).toBeUndefined()
    })
})