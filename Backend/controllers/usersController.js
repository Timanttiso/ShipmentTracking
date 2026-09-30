import express from 'express'
import UserService from '../services/userService.js';
import jwt from 'jsonwebtoken'

const usersRouter = express.Router()
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

usersRouter.post('/register', async (request, response, next) => {
    try {
        const { username, password, email} = request.body

        if(!username || !password){
            return response.status(400).json({error: 'Käyttäjänimi ja salasana vaaditaan.'})
        }
        if(!passwordRegex.test(password)){
            return response.status(400).json({error: 'Salasanan täytyy täyttää seuraavat vaatimukset: 1 isokirjain, 1 pienikirjain, 1 numero, 1 erikoiskirjain ja vähintään kahdeksan kirjainta pitkä.'})
        }

        const newUser = await UserService.register({ username, password, email })

        response.status(201).json(newUser)
    }
    catch(error){
        next(error);
    }

})

usersRouter.post('/login', async (request, response, next) => {
    try{
        const {username, password} = request.body
        const user = await UserService.checkCredentials({ username, password })

        if(!user){
            return response.status(401).json({ error: 'Väärä käyttäjänimi tai salasana'})
        }

        const token = jwt.sign(
            {userId: user.id},
            process.env.JWT_SECRET,
            { expiresIn: "60m" }
        )

        response.json({ token })
    }
    catch(error){
        next(error)
    }
})

export default usersRouter