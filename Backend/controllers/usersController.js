import express from 'express'
import UserService from '../services/userService.js';
import DestinationService from '../services/destinationService.js';
import RefreshTokenService from '../services/refreshTokenService.js';
import auth from '../utils/auth.js'
import { generateAccessToken, hashToken, createRefreshToken, refreshCookieOptions } from '../utils/tokens.js';
import { loginLimiter } from '../utils/LoginLimiter.js';
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
        next(error)
    }

})

usersRouter.post('/login', loginLimiter, auth.authenticationNotRequired, async (request, response, next) => {
    try{
        const {username, password} = request.body
        const user = await UserService.checkCredentials({ username, password })

        if(!user){
            return response.status(401).json({ error: 'Väärä käyttäjänimi tai salasana'})
        }

        const accessToken = await generateAccessToken(user)
        const refreshToken = createRefreshToken()

        await RefreshTokenService.create({
            token_hash: await hashToken(refreshToken.token),
            expires_at: refreshToken.expires_at,
            user_id: user.id
        })

        response.cookie('refreshToken', refreshToken.token, refreshCookieOptions)
        response.status(200).json({ token: accessToken })
    }
    catch(error){
        next(error)
    }
})

usersRouter.post('/refresh', async (request, response, next) => {
    try{
        const refreshToken = request.cookies.refreshToken
        if(!refreshToken){
            return response.status(401).json({ error: 'Puuttuva refresh token'})
        }

        const tokenHash = await hashToken(refreshToken)
        const storedToken = await RefreshTokenService.findByHash(tokenHash)

        if(!storedToken || storedToken.expires_at < new Date()){
            if (storedToken){
                await RefreshTokenService.deleteByHash(tokenHash)
            }
            response.clearCookie('refreshToken', { path: refreshCookieOptions.path })
            return response.status(401).json({error: 'Virheellinen refresh token'})
        }

        const user = await UserService.getById(storedToken.user_id)
        if(!user){
            await RefreshTokenService.deleteByHash(tokenHash)
            response.clearCookie('refreshToken', { path: refreshCookieOptions.path })
            return response.status(401).json({error: 'Käyttäjää ei löytynyt'})
        }

        await RefreshTokenService.deleteByHash(tokenHash)
        const newRefreshToken = createRefreshToken()
        const newAccessToken = await generateAccessToken(user)
        await RefreshTokenService.create({
            token_hash: await hashToken(newRefreshToken.token),
            expires_at: newRefreshToken.expires_at,
            user_id: user.id
        })

        response.cookie('refreshToken', newRefreshToken.token, refreshCookieOptions)
        response.status(200).json({ token: newAccessToken })
    }
    catch(error){
        next(error)
    }
})

usersRouter.post('/logout', async(request, response, next) => {
    try{
        const refreshToken = request.cookies?.refreshToken
        if(refreshToken){
            await RefreshTokenService.deleteByHash(await hashToken(refreshToken))
        }
        response.clearCookie('refreshToken', { path: refreshCookieOptions.path })
        response.status(204).end()
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
            return response.status(400).json({error: 'Syötä uusi salasana'})
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
        response.clearCookie('refreshToken', { path: refreshCookieOptions.path })

        response.status(204).json()
    }
    catch(error){
        next(error)
    }
})

//#endregion

export default usersRouter