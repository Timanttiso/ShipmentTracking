import db from '../db/db.js'

const Shipment = {
    async add({ shipment_name, eta, status, user_id, destination_id, ship_id }, dbConn = db){
        return dbConn('shipments')
            .insert({ shipment_name, eta, status, user_id, created_at: dbConn.fn.now(), destination_id: destination_id, ship_id })
            .returning('*')
    },
    async getAllForUser(user_id, dbConn = db){
        return dbConn('shipments as s')
            .join('destinations as d', 's.destination_id', 'd.id')
            .join('ships as sh', 's.ship_id','sh.id')
            .where('s.user_id', user_id)
            .select(
                's.*',
                'd.destination_name',
                'd.lon as destination_lon',
                'd.lat as destination_lat',
                'sh.ship_name',
                'sh.mmsi',
                'sh.lon',
                'sh.lat',
                'sh.updated_at'
            )
    },
    async getAllForUserByStatus(user_id, status, dbConn = db){
        return dbConn('shipments as s')
            .join('destinations as d', 's.destination_id', 'd.id')
            .join('ships as sh', 's.ship_id','sh.id')
            .where('s.user_id', user_id)
            .where('s.status', status)
            .select(
                's.*',
                'd.destination_name',
                'd.lon as destination_lon',
                'd.lat as destination_lat',
                'sh.ship_name',
                'sh.mmsi',
                'sh.lon',
                'sh.lat',
                'sh.updated_at'
            )
    },
    async getById(id, user_id, dbConn = db){
        return dbConn('shipments as s')
            .join('destinations as d', 's.destination_id', 'd.id')
            .join('ships as sh', 's.ship_id','sh.id')
            .where('s.user_id', user_id)
            .where('s.id', id)
            .select(
                's.*',
                'd.destination_name',
                'd.lon as destination_lon',
                'd.lat as destination_lat',
                'sh.ship_name',
                'sh.mmsi',
                'sh.lon',
                'sh.lat',
                'sh.updated_at'
            )
            .first()
    },
    async updateShipmentInformation(id, user_id, {shipment_name, eta, destination_id, ship_id}, dbConn = db){
        return dbConn('shipments')
            .where({ id, user_id })
            .update({ shipment_name: shipment_name, eta: eta, destination_id: destination_id, ship_id})
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