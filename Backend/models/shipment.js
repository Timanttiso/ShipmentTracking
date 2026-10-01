import db from '../db/db.js'

const Shipment = {
    async add({ shipment_name, ship_mmsi, eta, status, lon, lat, user_id }, dbConn = db){
        return dbConn('shipments')
            .insert({ shipment_name, ship_mmsi, eta, status, lon, lat, user_id, created_at: dbConn.fn.now() })
            .returning('*')
    },
    async getAllForUser(user_id, dbConn = db){
        return dbConn('shipments')
            .select('*')
            .where({ user_id })
    },
    async getAllForUserByStatus(user_id, status, dbConn = db){
        return dbConn('shipments')
            .select('*')
            .where({ user_id, status })
    },
    async getById(id, user_id, dbConn = db){
        return dbConn('shipments')
            .select('*')
            .where({id, user_id})
            .first()
    }
}

export default Shipment