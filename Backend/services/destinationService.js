import Destination from '../models/destination.js'
import ApiError from '../utils/ApiError.js'

const DestinationService = {
    async AddDestination({ destination_name, lon, lat }, user_id ){
        try{
            const existing = await Destination.getByName(user_id, destination_name)

            if(existing){
                throw new ApiError('Destination already exists for this user in AddDestination()', 409, 'Tämä sijainti on jo olemassa')
            }

            return await Destination.add({ destination_name, lon, lat }, user_id)
        }
        catch{
            throw new ApiError('Failed to create a destination in AddDestination()', 500, 'Sijainnin luonti epäonnistui')
        }
        
    },

    async GetAllForUser(user_id){
        try{
            return await Destination.getAllForUser(user_id)
        }
        catch{
            throw new ApiError('Get all destinations for user in GetAllForUser() failed', 500, 'Sijaintien haku epäonnistui')
        }
        
    },

    async GetById(id, user_id){
        try{
            const destination = await Destination.getById(id, user_id)

            if(!destination){
                throw new ApiError('Destination not found in GetById()', 404, 'Sijaintia ei löytynyt')
            }

            return destination
        }
        catch{
            throw new ApiError('Getting destinations by id failed in GetById()', 500, 'Sijainnin haku epäonnistui')
        }
        
    },

    async GetDefault(id, user_id){
        try{
            return await Destination.getById(id, user_id) 
        }
        catch{
           throw new ApiError('Getting destinations by id for default failed in GetDefault()', 500, 'Sijainnin haku epäonnistui')
        }
        
    },

    async UpdateDestinationInfo(id, user_id, {destination_name, lon, lat}){
        try{
            const destination = await Destination.getById(id, user_id)

            if(!destination){
                throw new ApiError('Destination not found in UpdateDestinationInfo()', 404, 'Sijaintia ei löytynyt')
            }

            return await Destination.updateDestination(id, {destination_name, lon, lat})
        }
        catch{
            throw new ApiError('Updating a destination failed in UpdateDestinationInfo()', 500, 'Sijainnin päivitys epäonnistui')
        }
        
    },

    async DeleteDestination(id, user_id){
        try{
            const destination = await Destination.getById(id, user_id)

            if(!destination){
                throw new ApiError('Destination not found in DeleteDestination()', 404, 'Sijaintia ei löytynyt')
            }

            await Destination.deleteDestination(id)

            return
        }
        catch{
            throw new ApiError('Destination deletion failed in DeleteDestination()', 500, 'Sijainnin poisto epäonnistui')
        }
    }
}

export default DestinationService