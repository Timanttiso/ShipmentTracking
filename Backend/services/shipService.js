import Ship from "../models/ship.js";
import User_Ship from "../models/user_ship.js";
import ApiError from "../utils/ApiError.js";

const ShipService = {
    async AddShip(user_id, ship_nickname, mmsi){
        let AddedShip = await Ship.GetByMMSI(mmsi)
        if(!AddedShip){
            AddedShip = await Ship.Add(mmsi)
        }
        const ExistingUserShipConnection = await User_Ship.GetUserShipByShipId(user_id, AddedShip.id)
        if(ExistingUserShipConnection){
            throw new ApiError('User already has a connection to this ship In AddShip()', 409, 'Seuraat jo tätä alusta')
        }
        const newShipConnection = await User_Ship.Add(user_id, AddedShip.id, ship_nickname)
        return newShipConnection
    },

    async GetAllUserShips(user_id){
        return await User_Ship.GetUserShips(user_id)
    },

    async GetSpecificShip(user_id, ship_id){
        const UserShip = await User_Ship.GetUserShipByShipId(user_id, ship_id)
        
        if(!UserShip){
            throw new ApiError('Ship not found for user in GetSpecificShip()', 404, 'Laivaa ei löytynyt')
        }

        return UserShip
    },

    async UnFollowShip(user_id, ship_id){
        const existingShipLink = await User_Ship.GetUserShipByShipId(user_id, ship_id)

        if(!existingShipLink){
            throw new ApiError('Ship link not found for user in UnFollowShip()', 404, 'Laivaa ei löytynyt')
        }

        return await User_Ship.UnfollowShip(user_id, ship_id)
    }
}

export default ShipService