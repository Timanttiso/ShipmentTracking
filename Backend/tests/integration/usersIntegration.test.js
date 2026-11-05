import { test, describe, expect, beforeEach, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../app.js'
import db from '../../db/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createTestUser } from '../helpers/authHelper.js'

const api = supertest(app)

const credentials = { username: 'IntegrationTestUser', password: 'testPassword2!'}

let user, token, tempCredentials

const getRefreshCookie = (response) => {
    const cookie = response.headers['set-cookie'].find((c) => c.startsWith('refreshToken='))
    return cookie.split(';')[0].split('=')[1]
}


beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, refresh_tokens RESTART IDENTITY CASCADE');
    ({ user, token, tempCredentials } = await createTestUser())
})

afterAll(async () => {
    await db.destroy()
})

describe('User integration tests', async () => {
    test('Fail to register user with bad password', async () => {
        const input = {
            username: 'integration user',
            password: 'badpassword',
            email: 'integrationUser@integration.com'
        }

        const response = await api
            .post('/api/auth/register')
            .send(input)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(response.body.error).toBe('Salasanan täytyy täyttää seuraavat vaatimukset: 1 isokirjain, 1 pienikirjain, 1 numero, 1 erikoiskirjain ja vähintään kahdeksan kirjainta pitkä.')
    }),

    test('Successfully register a user', async () => {
        const input = {
            username: 'integration user',
            password: 'testPassword2!',
            email: 'integrationUser@integration.com'
        }

        const response = await api
            .post('/api/auth/register')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const passwordMatch = await bcrypt.compare(input.password, response.body[0].password_hash)

        expect(response.body[0].username).toBe(input.username)
        expect(passwordMatch).toBe(true)
        expect(response.body[0].email).toBe(input.email)
    }),

    test('Successfully login user and sets refresh token and store the hash', async () => {
        const [userInDb] = await db('users').insert({
            username: credentials.username,
            email: 'IntegrationTestUser@test.com',
            password_hash: await bcrypt.hash(credentials.password, 4)
        }).returning('*')

        const response = await api
            .post('/api/auth/login')
            .send(credentials)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const payload = jwt.verify(response.body.token, process.env.JWT_SECRET)
        const cookie = response.headers['set-cookie'].find((c) => c.startsWith('refreshToken='))
        const rawToken = cookie.split(';')[0].split('=')[1]
        const refreshTokens = await db('refresh_tokens').where({ user_id: userInDb.id })

        expect(payload.userId).toBe(userInDb.id)

        expect(refreshTokens).toHaveLength(1)
        expect(refreshTokens[0].token_hash).not.toBe(rawToken)
    }),

    test('Retrieve user info through the me endpoint', async () => {
        const response = await api
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.id).toBe(user.id)
        expect(response.body.username).toBe(user.username)
        expect(response.body.email).toBe(user.email)
    })
    // Not working yet :D
    /*,
    
    test('Refresh the token through the refresh endpoint', async () => {
        const [userInDb] = await db('users').insert({
            username: credentials.username,
            email: 'IntegrationTestUser@test.com',
            password_hash: await bcrypt.hash(credentials.password, 4)
        }).returning('*')

        const agent = supertest.agent(app)
        const login = await agent
            .post('/api/auth/login')
            .send(credentials)
            .expect(200)
        const oldToken = getRefreshCookie(login)

        const response = await agent
            .post('/api/auth/refresh')
            .expect(200)

        const payload = jwt.verify(response.body.token, process.env.JWT_SECRET)

        expect(payload.userId).toBe(userInDb.id)

        const newRefreshToken = getRefreshCookie(response)
        expect(newRefreshToken).toBeDefined()
        expect(newRefreshToken).not.toBe(oldToken)

        const RefreshTokens = await db('refresh_tokens').where({ user_id: user.id})
        expect(RefreshTokens).toHaveLength(1)
    })
        */
})