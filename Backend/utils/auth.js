import jwt from 'jsonwebtoken'
import 'dotenv/config'

const verifyToken = (request) => {
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(!token) return null

    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })

    return payload.userId ? payload : null
}

function authenticationRequired(request, response, next) {
    try{
        const payload = verifyToken(request)
        if(!payload){
            return response.status(401).json({ error: 'Puuttuva token' })
        }
        request.user = { id: payload.userId }
        next()
    } catch(error){
        return response.status(401).json({ error: 'Virheellinen tai vanhentunut token' })
    }
}

function authenticationNotRequired(request, response, next){
   try{
        if(verifyToken(request)){
            return response.status(403).json({ error: 'Olet jo kirjautunut sisään' })
        }
    } catch{

    }
    next()
}

export default {authenticationRequired, authenticationNotRequired}