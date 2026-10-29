import db from "../db/db.js";

const User_Ship = {
    async Add(user_id, ship_id, ship_nickname, dbConn = db){
        return dbConn('user_ships')
            .insert({user_id: user_id, ship_id: ship_id, ship_nickname: ship_nickname})
            .returning('*')
    },
    async GetUserShips(user_id, dbConn = db){
        return dbConn('user_ships as us')
            .join('ships as s', 's.id', 'us.ship_id')
            .where('us.user_id', user_id)
            .select('us.ship_nickname', 's.*')
    },
    async GetUserShipByShipId(user_id, ship_id, dbConn = db){
        return dbConn('user_ships as us')
            .join('ships as s', 's.id', 'us.ship_id')
            .where('us.user_id', user_id)
            .where('s.id', ship_id)
            .select('us.ship_nickname', 's.*')
            .first()
    },
    async UnfollowShip(user_id, ship_id, dbConn = db){
        return dbConn('user_ships')
            .where({user_id: user_id, ship_id:ship_id})
            .delete()
    }
}

export default User_Ship