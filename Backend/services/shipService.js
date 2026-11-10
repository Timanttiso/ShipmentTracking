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
        const AddedShipInDb = await User_Ship.GetUserShipByShipId(user_id, newShipConnection[0].ship_id)
        return AddedShipInDb
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

    async UpdateShip(user_id, ship_id, { ship_nickname, mmsi }){
        const ExistingShip = await Ship.GetById(ship_id)
        const ExistingConnection = await User_Ship.GetUserShipByShipId(user_id, ship_id)
        if(!ExistingShip || !ExistingConnection){
            throw new ApiError('Ship or ship connection not found for user in UpdateShip()', 404, 'Laivaa ei löytynyt')
        }

        if(ship_nickname){
            await User_Ship.UpdateShipNickname(user_id, ship_id, ship_nickname)
        }

        if(mmsi){
            let target = await Ship.GetByMMSI(mmsi)
            if(!target) {
                target = await Ship.Add(mmsi)
            }

            if(target.id != ship_id){
                const ExistingLink = await User_Ship.GetUserShipByShipId(user_id, target.id)
                if(ExistingLink){
                    throw new ApiError('User already follows the ship with the new MMSI in UpdateShip()', 409, 'Seuraat jo tätä laivaa')
                }
                await User_Ship.UpdateConnection(user_id, target.id, ship_id)
            } 

            return await User_Ship.GetUserShipByShipId(user_id, target.id)
        }
        return await User_Ship.GetUserShipByShipId(user_id, ship_id)
    },

    async UnFollowShip(user_id, ship_id){
        const existingShipLink = await User_Ship.GetUserShipByShipId(user_id, ship_id)

        if(!existingShipLink){
            throw new ApiError('Ship link not found for user in UnFollowShip()', 404, 'Laivaa ei löytynyt')
        }

        return await User_Ship.UnfollowShip(user_id, ship_id)
    },

    async DeleteDeprecatedShips(){
        return await Ship.DeleteDeprecated()
    }
}

export default ShipService