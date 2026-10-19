import RefreshToken from "../models/refreshToken.js"
import ApiError from "../utils/ApiError.js"

const RefreshTokenService = {
    async create({ token_hash, expires_at, user_id }){
        return await RefreshToken.add({ token_hash, expires_at, user_id })
    },

    async findByHash(token_hash){
        const refreshToken = await RefreshToken.findByHash(token_hash)

        if(!refreshToken){
            throw new ApiError('Refresh token not found in findByHash()', 404, 'Refresh tokenia ei löydetty tietokannasta')
        }

        return refreshToken
    },

    async deleteByHash(token_hash){
        const refreshToken = await RefreshToken.findByHash(token_hash)

        if(!refreshToken){
            throw new ApiError('Refresh token not found in deleteByHash()', 404, 'Refresh tokenia ei löydetty tietokannasta')
        }

        await RefreshToken.deleteByHash(token_hash)

        return 
    },

    async deleteExpired(){
        return await RefreshToken.deleteExpired()
    }
}

export default RefreshTokenService