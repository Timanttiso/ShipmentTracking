import db from '../db/db.js'

const Shipment = {
    async add({ shipment_name, ship_mmsi, eta, status, lon, lat, user_id, destination_id }, dbConn = db){
        return dbConn('shipments')
            .insert({ shipment_name, ship_mmsi, eta, status, lon, lat, user_id, created_at: dbConn.fn.now(), destination_id: destination_id })
            .returning('*')
    },
    async getAllForUser(user_id, dbConn = db){
        return dbConn('shipments as s')
            .join('destinations as d', 's.destination_id', 'd.id')
            .where('s.user_id', user_id)
            .select(
                's.*',
                'd.destination_name',
                'd.lon',
                'd.lat'
            )
    },
    async getAllForUserByStatus(user_id, status, dbConn = db){
        return dbConn('shipments as s')
            .join('destinations as d', 's.destination_id', 'd.id')
            .where('s.user_id', user_id)
            .where('s.status', status)
            .select(
                's.*',
                'd.destination_name',
                'd.lon',
                'd.lat'
            )
    },
    async getById(id, user_id, dbConn = db){
        return dbConn('shipments as s')
            .join('destinations as d', 's.destination_id', 'd.id')
            .where('s.user_id', user_id)
            .where('s.id', id)
            .select(
                's.*',
                'd.destination_name',
                'd.lon',
                'd.lat'
            )
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
    },
    async removeShipment(id, dbConn = db){
        return dbConn('shipments')
            .where({ id })
            .delete()
    }
}

export default Shipment