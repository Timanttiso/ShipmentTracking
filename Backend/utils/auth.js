import jwt from 'jsonwebtoken'
import 'dotenv/config'
import User from '../models/user.js'

const verifyToken = (request) => {
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(!token) return null

    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })

    return payload.userId ? payload : null
}

async function authenticationRequired(request, response, next) {
    try{
        const payload = verifyToken(request)
        if(!payload){
            return response.status(401).json({ error: 'Puuttuva token' })
        }

        const existingUser = await User.findById(payload.userId)
        if(!existingUser){
            return response.status(401).json({ error: 'Käyttäjää ei ole olemassa' })
        }

        request.user = { id: payload.userId }
        next()
    } catch(error){
        return response.status(401).json({ error: 'Virheellinen tai vanhentunut token' })
    }
}

async function authenticationNotRequired(request, response, next){
   try{
        if(verifyToken(request)){
            return response.status(403).json({ error: 'Olet jo kirjautunut sisään' })
        }
    } catch{

    }
    next()
}

export default {authenticationRequired, authenticationNotRequired}