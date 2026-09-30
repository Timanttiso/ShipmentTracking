import jwt from 'jsonwebtoken'

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: "Missing authentication token"})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            return res.status(403)
        }
        req.user = user
        next()
    })
}

export default authenticate