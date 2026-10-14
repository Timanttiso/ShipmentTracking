import db from '../db/db.js'

const RefreshToken = {
    async add({ token_hash, expires_at, user_id }, dbConn = db){
        return dbConn('refresh_tokens')
            .insert({ token_hash, expires_at, user_id })
            .returning('*')
    },

    async findByHash(token_hash, dbConn = db){
        return dbConn('refresh_tokens')
            .select('*')
            .where({token_hash: token_hash})
            .first()
    },

    async deleteByHash(token_hash, dbConn = db){
        return dbConn('refresh_tokens')
            .where({token_hash:token_hash})
            .delete()
    },

    async deleteAllForUser(user_id, dbConn = db){
        return dbConn('refresh_tokens')
            .where({user_id})
            .delete()
    },

    async deleteExpired(dbConn = db){
        return dbConn('refresh_tokens')
            .where('expires_at', '<', db.fn.now())
            .delete()
    }
}

export default RefreshToken