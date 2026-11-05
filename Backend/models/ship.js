import db from '../db/db.js'

const Ship = {
    async Add(mmsi, dbConn = db){
        const [row] = await dbConn('ships')
            .insert({mmsi: mmsi})
            .returning('*')
        return row
    },

    async GetByMMSI(mmsi, dbConn = db){
        return dbConn('ships')
            .select('*')
            .where({mmsi:mmsi})
            .first()
    },

    async GetById(id, dbConn = db){
        return dbConn('ships')
            .select('*')
            .where({id:id})
            .first()
    },

    async UpdateShipInformation(mmsi, {ship_name, lon, lat}, dbConn = db){
        return dbConn('ships')
            .where({mmsi:mmsi})
            .update({ship_name: ship_name, lon:lon, lat:lat})
            .returning('*')
    },

    async dynamicUpdateShipInformation(mmsi, updates, dbConn = db) {
        return dbConn('ships')
            .where({ mmsi })
            .update(updates)
            .returning('*');
    },

    async getMMSIs(dbConn = db) {
        return dbConn('ships')
            .join('shipments', 'shipments.ship_id', 'ships.id')
            .distinct('ships.mmsi')
            .whereIn('shipments.status', [1, 3]);
    },

    async DeleteDeprecated(dbConn = db){
        return dbConn('ships')
            .whereNotExists(dbConn('user_ships').select(1).whereRaw('user_ships.ship_id = ships.id'))
            .whereNotExists(dbConn('shipments').select(1).whereRaw('shipments.ship_id = ships.id'))
            .delete()
    }
}

export default Ship