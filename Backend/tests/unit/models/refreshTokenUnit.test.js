import { describe, test, expect, beforeEach, afterAll } from "vitest";
import { hashToken } from '../../../utils/tokens.js'
import db from "../../../db/db.js";
import RefreshToken from "../../../models/refreshToken.js";

let user

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, ships, user_ships, refresh_tokens RESTART IDENTITY CASCADE');
    [user] = await db('users').insert({ username: 'UnitTestUser', password_hash: 'TestPass', email:'UnitTestUser@Test.com' }).returning('*')
})

afterAll(async () => {
    await db.destroy()
})

describe('Refresh token model unit tests', () => {
    test('Create refresh token', async () => {
        const input = {
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b624d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: user.id
        }

        const result = await RefreshToken.add(input)

        expect(result[0].id).toBeDefined()
        expect(result[0].token_hash).toEqual(input.token_hash)
        expect(result[0].expires_at).toEqual(input.expires_at)
        expect(result[0].user_id).toEqual(input.user_id)
    }),

    test('Find refresh token by hash', async () => {
        const input1 = {
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b624d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: user.id
        }
        const input2 = {
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b614d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: user.id
        }

        await RefreshToken.add(input1)

        const refreshTokenToFind = await RefreshToken.add(input2)

        const result = await RefreshToken.findByHash(refreshTokenToFind[0].token_hash)

        expect(result).toEqual(refreshTokenToFind[0])
    }),

    test('Delete refresh token by hash', async () => {
        const input = {
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b624d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: user.id
        }

        const addedRefreshToken = await RefreshToken.add(input)

        let existingRefreshToken = await RefreshToken.findByHash(addedRefreshToken[0].token_hash)

        expect(existingRefreshToken).toEqual(addedRefreshToken[0])

        await RefreshToken.deleteByHash(addedRefreshToken[0].token_hash)

        existingRefreshToken = await RefreshToken.findByHash(addedRefreshToken[0].token_hash)

        expect(existingRefreshToken).toBeUndefined()
    }),

    test('Delete all tokens for user', async () => {
        const input1 = {
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b624d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: user.id
        }
        const input2 = {
            token_hash: await hashToken('71c549b44b09becbd848f25fcc09a73e5a1dd9b40619b292717753c2b614d9623deac29718a4bc6da3f720ea466fee67'),
            expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            user_id: user.id
        }

        const addedRefreshToken1 = await RefreshToken.add(input1)
        const addedRefreshToken2 = await RefreshToken.add(input2)

        let existingRefreshToken1 = await RefreshToken.findByHash(addedRefreshToken1[0].token_hash)
        let existingRefreshToken2 = await RefreshToken.findByHash(addedRefreshToken2[0].token_hash)

        expect(existingRefreshToken1).toEqual(addedRefreshToken1[0])
        expect(existingRefreshToken2).toEqual(addedRefreshToken2[0])

        await RefreshToken.deleteAllForUser(user.id)

        existingRefreshToken1 = await RefreshToken.findByHash(addedRefreshToken1[0].token_hash)
        existingRefreshToken2 = await RefreshToken.findByHash(addedRefreshToken2[0].token_hash)

        expect(existingRefreshToken1).toBeUndefined()
        expect(existingRefreshToken2).toBeUndefined()
    })
})