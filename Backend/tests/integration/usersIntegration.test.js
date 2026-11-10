import { test, describe, expect, beforeEach, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../app.js'
import db from '../../db/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createTestUser } from '../helpers/authHelper.js'

const api = supertest(app)

const credentials = { username: 'IntegrationTestUser', password: 'testPassword2!'}

let user, token

const getRefreshCookie = (response) => {
    const cookie = response.headers['set-cookie'].find((c) => c.startsWith('refreshToken='))
    return cookie.split(';')[0].split('=')[1]
}


beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, refresh_tokens RESTART IDENTITY CASCADE');
    ({ user, token } = await createTestUser())
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


        expect(response.body[0].username).toBe(input.username)
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
    }),
    
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

        const RefreshTokens = await db('refresh_tokens').where({ user_id: userInDb.id})
        expect(RefreshTokens).toHaveLength(1)
    }),

    test('Logout and check that the token was deleted', async () => {
        const [userInDb] = await db('users').insert({
            username: credentials.username,
            email: 'IntegrationTestUser@test.com',
            password_hash: await bcrypt.hash(credentials.password, 4)
        }).returning('*')

        const agent = supertest.agent(app)
        await agent
            .post('/api/auth/login')
            .send(credentials)
            .expect(200)

        let RefreshTokens = await db('refresh_tokens').where({ user_id: userInDb.id})
        expect(RefreshTokens).toHaveLength(1)

        await agent
            .post('/api/auth/logout')
            .expect(204)

        RefreshTokens = await db('refresh_tokens').where({ user_id: userInDb.id})
        expect(RefreshTokens).toHaveLength(0)
    }),

    test('Update user settings', async () => {
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

        let userInfo = await agent
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${login.body.token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(userInfo.body.id).toBe(userInDb.id)
        expect(userInfo.body.username).toBe(userInDb.username)
        expect(userInfo.body.email).toBe(userInDb.email)

        const editedUserSettings = {
            username: 'IntegrationTestUserEdited',
            email: 'IntegrationTestUserEdited@test.com'
        }

        await agent
            .patch('/api/auth/settings')
            .set('Authorization', `Bearer ${login.body.token}`)
            .send(editedUserSettings)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        userInfo = await agent
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${login.body.token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        expect(userInfo.body.id).toBe(userInDb.id)
        expect(userInfo.body.username).toBe(editedUserSettings.username)
        expect(userInfo.body.email).toBe(editedUserSettings.email)
    }),

    test('Change password', async () => {
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
        
        await agent
            .patch('/api/auth/settings/change-password')
            .set('Authorization', `Bearer ${login.body.token}`)
            .send({ old_password: 'testPassword2!', new_password: 'testPassword3!'})
            .expect(204)

        const editedPassUser = await db('users').select('*').where({id: userInDb.id}).first()

        expect(editedPassUser.password_hash).toBeDefined()
        expect(editedPassUser.password_hash).not.toBe(userInDb.password_hash)
    }),

    test('Delete user', async () => {
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

        let testUser = await db('users').select('*').where({ id: userInDb.id }).first()
        expect(testUser.id).toBe(userInDb.id)
        expect(testUser.username).toBe(userInDb.username)
        expect(testUser.email).toBe(userInDb.email)
        
        await agent
            .delete('/api/auth/settings/delete-account')
            .set('Authorization', `Bearer ${login.body.token}`)
            .expect(204)
        
        testUser = await db('users').select('*').where({ id: userInDb.id }).first()

        expect(testUser).not.toBeDefined()
    })
})