import express from 'express'
import UserService from '../services/userService.js';

const usersRouter = express.Router()
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

usersRouter.post('/register', async (request, response, next) => {
    try {
        const { username, password, email} = request.body;

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

usersRouter.post('/login', async (request, response) => {
    response.json("Not implemented yet");
})

export default usersRouter;