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
    },

    async GetById(id, user_id){
        const destination = await Destination.getById(id, user_id)

        if(!destination){
            throw new ApiError('Destination not found in GetById()', 404, 'Sijaintia ei löytynyt')
        }

        return destination
    },

    async UpdateDestinationInfo(id, user_id, {destination_name, lon, lat}){
        const destination = await Destination.getById(id, user_id)

        if(!destination){
            throw new ApiError('Destination not found in UpdateDestinationInfo()', 404, 'Sijaintia ei löytynyt')
        }

        return await Destination.updateDestination(id, {destination_name, lon, lat})
    }
}

export default DestinationService