import { test, describe, expect, beforeEach, afterAll } from 'vitest'
import supertest from 'supertest'
import app from '../../app.js'
import db from '../../db/db.js'
import bcrypt from 'bcrypt'

const api = supertest(app)

beforeEach(async () => {
    await db.raw('TRUNCATE users, destinations, shipments, refresh_tokens RESTART IDENTITY CASCADE')
})

afterAll(async () => {
    await db.destroy()
})

describe('User integration tests', () => {
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
    })
})