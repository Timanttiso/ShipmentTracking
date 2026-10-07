import db from '../db/db.js'

const Destination = {
    async getById(id, user_id, dbConn = db){
        return dbConn('destinations')
            .select('*')
            .where({id, user_id})
            .first()
    }
}

export default Destination