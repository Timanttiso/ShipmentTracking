import db from '../db/db.js'

// Calculates the distance between two lon/lat points in km
const Haversine_km = `
        6371 * 2 * asin(sqrt(
            power(sin(radians(d.lat - sh.lat) / 2), 2) + 
            cos(radians(sh.lat))* cos(radians(d.lat)) * 
            power(sin(radians(d.lon - sh.lon) / 2), 2)
        ))`

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
                'sh.updated_at as ship_updated_at'
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
                'sh.updated_at as ship_updated_at'
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
                'sh.updated_at as ship_updated_at'
            )
            .first()
    },
    async updateShipmentInformation(id, user_id, {shipment_name, eta, destination_id, ship_id}, dbConn = db){
        return dbConn('shipments')
            .where({ id, user_id })
            .update({ shipment_name: shipment_name, eta: eta, destination_id: destination_id, ship_id, updated_at: dbConn.fn.now()})
            .returning('*')
    },
    async updateShipmentStatus(id, user_id, { status }, dbConn = db){
        return dbConn('shipments')
            .where({ id, user_id })
            .update({ status: status, updated_at: dbConn.fn.now() })
            .returning('*')
    },
    async removeShipment(id, dbConn = db){
        return dbConn('shipments')
            .where({ id })
            .delete()
    },

    async getDistanceFromShipToDestination(dbConn = db){
        return dbConn('shipments as s')
            .join('ships as sh', 's.ship_id', 'sh.id')
            .join('destinations as d', 's.destination_id', 'd.id')
            .whereIn('s.status', [1, 3])
            .whereNotNull('sh.lat')
            .whereNotNull('sh.lon')
            .select(
                's.id as shipment_id',
                's.user_id',
                'sh.mmsi',
                dbConn.raw(`${Haversine_km} as distance_km`)
            )
    }
}

export default Shipment