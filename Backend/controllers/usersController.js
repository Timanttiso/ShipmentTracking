import express from 'express'
import UserService from '../services/userService.js';
import jwt from 'jsonwebtoken'
import auth from '../utils/auth.js'
import 'dotenv/config'

const usersRouter = express.Router()
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

usersRouter.post('/register', auth.authenticationNotRequired, async (request, response, next) => {
    try {
        const { username, password, email} = request.body

        if(!username || !password || !email){
            return response.status(400).json({error: 'Käyttäjänimi, sähköposti ja salasana vaaditaan.'})
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

usersRouter.post('/login', auth.authenticationNotRequired, async (request, response, next) => {
    try{
        const {username, password} = request.body
        const user = await UserService.checkCredentials({ username, password })

        if(!user){
            return response.status(401).json({ error: 'Väärä käyttäjänimi tai salasana'})
        }

        const token = jwt.sign(
            {userId: user.id, username: user.username, email: user.email},
            process.env.JWT_SECRET,
            { 
                algorithm: 'HS256',
                expiresIn: "60m"
            }
        )

        response.status(200).json({ token })
    }
    catch(error){
        next(error)
    }
})

usersRouter.get('/me', auth.authenticationRequired, async (request, response, next) => {
    try{
        const user = await UserService.getById(request.user.id)
        response.json({
            id: request.user.id,
            username: user.username,
            email: user.email
        })
    }catch(error){
        next(error)
    }
    
})

usersRouter.patch('/settings', auth.authenticationRequired, async (request, response, next) => {
    try{
        const { username, email, default_destination_id } = request.body

        if(!username){
            return response.status(400).json({ error: "Käyttäjänimi ei saa olla tyhjä" })
        }
        else if(!email){
            return response.status(400).json({ error: "Sähköposti ei saa olla tyhjä" })
        }

        const updatedUser = await UserService.UpdateUserSettings(request.user.id, { username, email, default_destination_id })

        response.status(200).json(updatedUser)
    }
    catch(error){
        next(error)
    }
})

export default usersRouter