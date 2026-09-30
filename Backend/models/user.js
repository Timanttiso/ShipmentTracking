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
    }
}

export default User