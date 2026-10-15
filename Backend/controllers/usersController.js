import express from 'express'
import UserService from '../services/userService.js';
import DestinationService from '../services/destinationService.js';
import jwt from 'jsonwebtoken'
import auth from '../utils/auth.js'
import 'dotenv/config'

const usersRouter = express.Router()
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

//#region GET endpoints
usersRouter.get('/me', auth.authenticationRequired, async (request, response, next) => {
    try{
        const user = await UserService.getById(request.user.id)
        const default_destination = await DestinationService.GetDefault(user.default_destination_id, request.user.id)
        if(default_destination){
            response.json({
            id: request.user.id,
            username: user.username,
            email: user.email,
            default_destination_id: user.default_destination_id,
            default_destination_name: default_destination.destination_name
            })
        }
        else{
            response.json({
            id: request.user.id,
            username: user.username,
            email: user.email,
            })
        }
        
    }catch(error){
        next(error)
    }
    
})
//#endregion

//#region POST endpoints
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
//#endregion

//#region PATCH endpoints
usersRouter.patch('/settings', auth.authenticationRequired, async (request, response, next) => {
    try{
        const { username, email, default_destination_id } = request.body
        
        const updatedUser = await UserService.UpdateUserSettings(request.user.id, { username, email, default_destination_id })

        response.status(200).json(updatedUser)
    }
    catch(error){
        next(error)
    }
})

usersRouter.patch('/settings/change-password', auth.authenticationRequired, async (request, response, next) => {
    try{
        const { old_password, new_password } = request.body
        
        if(old_password == new_password){
            return response.status(400).json({error: 'Syötä eri salasana vaihtaaksesi salasanan'})
        }

        if(!passwordRegex.test(new_password)){
            return response.status(400).json({error: 'Salasanan täytyy täyttää seuraavat vaatimukset: 1 isokirjain, 1 pienikirjain, 1 numero, 1 erikoiskirjain ja vähintään kahdeksan kirjainta pitkä.'})
        }
        
        await UserService.ChangePassword(request.user.id, { old_password, new_password})

        response.status(204).json()
    }
    catch(error){
        next(error)
    }
})
//#endregion

//#region DELETE endpoints

usersRouter.delete('/settings/delete-account', auth.authenticationRequired, async (request, response, next) => {
    try{
        await UserService.DeleteUser(request.user.id)

        response.status(204).json()
    }
    catch(error){
        next(error)
    }
})

//#endregion

export default usersRouter