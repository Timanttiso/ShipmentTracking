import db from '../db/db.js'

const User = {
    async register({ username, password_hash, email }, dbConn = db) {
        return dbConn('users')
            .insert({ username, password_hash, email })
            .returning('*')
    },

    async findByName(username, dbConn = db){
        return dbConn('users')
            .select('*')
            .where({ username:username })
            .first()
    },

    async findByEmail(email, dbConn = db){
        return dbConn('users')
            .select('*')
            .where({ email:email})
            .first()
    },

    async findById(id, dbConn = db){
        return dbConn('users')
            .select('*')
            .where({ id: id})
            .first()
    },

    async updateUserSettings(id, { username, email, default_destination_id }, dbConn = db){
        return dbConn('users')
            .where({ id })
            .update({ username: username, email: email, default_destination_id, default_destination_id})
            .returning('*')
    },

    async UpdatePassword(id, password_hash, dbConn = db){
        return dbConn('users')
            .where({ id })
            .update({password_hash: password_hash})
            .returning('*')
    }
}

export default User