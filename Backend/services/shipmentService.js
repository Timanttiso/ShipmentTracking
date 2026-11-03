import Shipment from "../models/shipment.js"
import Destination from "../models/destination.js"
import Ship from '../models/ship.js'
import User_Ship from '../models/user_ship.js'
import ApiError from '../utils/ApiError.js'

const ShipmentService = {
    async AddShipment({shipment_name, eta, destination_id, ship_id}, user_id){
        const existingDestination = await Destination.getById(destination_id, user_id)
        if(!existingDestination){
            throw new ApiError('Destination not found in AddShipment() for user', 404, 'Päämäärää ei löydetty')
        }
        const existingShip = await Ship.GetById(ship_id)
        const existingConnection = await User_Ship.GetUserShipByShipId(user_id, ship_id)
        if(!existingShip || !existingConnection){
            throw new ApiError('Ship or ship link not found in AddShipment()', 404, 'Laivaa ei löydetty')
        }

        const newShipment = await Shipment.add({
            shipment_name: shipment_name,
            eta: eta,
            status: 1,
            user_id: user_id,
            destination_id,
            ship_id
        })

        return newShipment
    },
    async GetAllShipmentsForUser(user_id){
        return await Shipment.getAllForUser(user_id) 
    },

    async GetAllShipmentsForUserByStatus(user_id, status){
        return await Shipment.getAllForUserByStatus(user_id, status)
    },

    async GetShipmentById(id, user_id){
        const shipment = await Shipment.getById(id, user_id)

        if(!shipment){
            throw new ApiError('Shipment not found in GetShipmentById() for user', 404, 'Lähetystä ei löydetty')
        }

        return shipment
        
    },

    async UpdateShipmentInformation(id, user_id, {shipment_name, eta, destination_id, ship_id}){
        const shipment = await Shipment.getById(id, user_id)

        if(!shipment){
            throw new ApiError('Shipment not found in UpdateShipmentInformation() for user', 404, 'Lähetystä ei löydetty')
        }

        if(destination_id){
            const destination = await Destination.getById(destination_id, user_id)
            if(!destination){
                throw new ApiError('Destination not found in UpdateShipmentInformation() for user', 404, 'Päämäärää ei löydetty')
            }
        }

        return Shipment.updateShipmentInformation(id, user_id, {shipment_name, eta, destination_id, ship_id})
    },

    async UpdateShipmentStatus(id, user_id, { status }){
        const shipment = await Shipment.getById(id, user_id)

        if(!shipment){
            throw new ApiError('Shipment not found in UpdateShipmentStatus() for user', 404, 'Lähetystä ei löydetty')
        }

        return Shipment.updateShipmentStatus(id, user_id, { status })
    },

    async RemoveShipment(id, user_id){
        const shipment = await Shipment.getById(id, user_id)

        if(!shipment){
            throw new ApiError('Shipment not found in RemoveShipment() for user', 404, 'Lähetystä ei löydetty')
        }

        return await Shipment.removeShipment(id)
    }
}

export default ShipmentService