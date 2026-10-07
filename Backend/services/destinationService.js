import Destination from '../models/destination.js'
import ApiError from '../utils/ApiError.js'

const DestinationService = {
    async AddDestination({ destination_name, lon, lat }, user_id ){
        const existing = await Destination.getByName(user_id, destination_name)

        if(existing){
            throw new ApiError('Destination already exists for this user', 409, 'Tämä sijainti on jo olemassa')
        }

        return await Destination.add({ destination_name, lon, lat }, user_id)
    },

    async GetAllForUser(user_id){
        return await Destination.getAllForUser(user_id)
    }
}

export default DestinationService