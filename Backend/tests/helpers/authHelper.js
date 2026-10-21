import supertest from "supertest"
import app from "../../app.js"
import UserService from "../../services/userService.js"
import { generateAccessToken } from "../../utils/tokens.js"

let counter = 0

export async function createTestUser(){
    counter++   
    const credentials = {
        username: `testuser${counter}`,
        password: `testPassword2!`,
        email: `testuser${counter}@test.com`
    }

    const Registereduser = await UserService.register(credentials) // Returns an array
    const user = Registereduser[0]
    const token = await generateAccessToken(user)

    return { user, token }
}