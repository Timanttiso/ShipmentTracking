import RefreshToken from "../models/refreshToken.js"
import ApiError from "../utils/ApiError.js"

const RefreshTokenService = {
    async create({ token_hash, expires_at, user_id }){
        try{
            return await RefreshToken.add({ token_hash, expires_at, user_id })
        }
        catch{
            throw new ApiError('Failed to create a refresh token for user in create()', 500, 'Refresh tokenin luonti epäonnistui')
        }
    },

    async findByHash(token_hash){
        const refreshToken = await RefreshToken.findByHash(token_hash)

        if(!refreshToken){
            throw new ApiError('Refresh token not found in findByHash()', 404, 'Refresh tokenia ei löydetty tietokannasta')
        }

        return refreshToken
    },

    async deleteByHash(token_hash){
        try{
           const refreshToken = await RefreshToken.findByHash(token_hash)

            if(!refreshToken){
                throw new ApiError('Refresh token not found in deleteByHash()', 404, 'Refresh tokenia ei löydetty tietokannasta')
            }

            await RefreshToken.deleteByHash(token_hash)

            return 
        }
        catch{
            throw new ApiError('Failed to delete a refresh token in deleteByHash()', 500, 'Refresh tokenin poisto epäonnistui')
        }
    }
}

export default RefreshTokenService