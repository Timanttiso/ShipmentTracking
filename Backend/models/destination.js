import db from '../db/db.js'

const Destination = {
    async add({ destination_name, lon, lat }, user_id, dbConn = db){
        return dbConn('destinations')
            .insert({ destination_name, lon, lat, user_id })
            .returning('*')
    },
    async getAllForUser(user_id, dbConn = db){
        return dbConn('destinations')
            .select('*')
            .where({ user_id: user_id })
    },
    async getById(id, user_id, dbConn = db){
        return dbConn('destinations')
            .select('*')
            .where({id, user_id})
            .first()
    },
    async getByName(user_id, destination_name, dbConn = db){
        return dbConn('destinations')
            .select('*')
            .where({user_id, destination_name})
            .first()
    }
}

export default Destination