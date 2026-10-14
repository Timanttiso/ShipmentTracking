import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const refreshTokenDaysValid = 7

export async function hashToken(token){
    return crypto.createHash('sha256').update(token).digest('hex')
}

export async function generateAccessToken(user){
    return jwt.sign(
        {userId: user.id},
        process.env.JWT_SECRET,
        { 
            algorithm: 'HS256',
            expiresIn: "30m"
        }
    )
}

export const createRefreshToken = () => ({
  token: crypto.randomBytes(48).toString('hex'),
  expires_at: new Date(Date.now() + (refreshTokenDaysValid * 24 * 60 * 60 * 1000))  
})

export const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: refreshTokenDaysValid * 24 * 60 * 60 * 1000
}
