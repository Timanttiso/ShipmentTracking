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
    }
}

export default Ship