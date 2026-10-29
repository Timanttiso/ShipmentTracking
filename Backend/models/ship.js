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
    }
}

export default Ship