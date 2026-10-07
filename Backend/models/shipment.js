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
    },
    async updateShipmentInformation(id, user_id, {shipment_name, ship_mmsi, eta, destination_id}, dbConn = db){
        return dbConn('shipments')
            .where({ id, user_id })
            .update({ shipment_name: shipment_name, ship_mmsi: ship_mmsi, eta: eta, destination_id: destination_id})
            .returning('*')
    },
    async updateShipmentStatus(id, user_id, { status }, dbConn = db){
        return dbConn('shipments')
            .where({ id, user_id })
            .update({ status: status})
            .returning('*')
    }
}

export default Shipment