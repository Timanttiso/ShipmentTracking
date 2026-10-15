import Shipment from "../models/shipment.js"
import Destination from "../models/destination.js"
import ApiError from '../utils/ApiError.js'

const ShipmentService = {
    async AddShipment({shipment_name, ship_mmsi, eta, destination_id}, user_id){
        try{
            const existingDestination = await Destination.getById(destination_id, user_id)
            if(!existingDestination){
                throw new ApiError('Destination not found in AddShipment() for user', 404, 'Päämäärää ei löydetty')
            }

            return await Shipment.add({
                shipment_name,
                ship_mmsi,
                eta,
                status: 1,
                lon: 0,
                lat: 0,
                user_id,
                destination_id
            })
        }
        catch{
            throw new ApiError('Failed to add a new shipment in AddShipment()', 500, 'Lähetyksen lisäys epäonnistui')
        }
    },
    async GetAllShipmentsForUser(user_id){
        try{
           return await Shipment.getAllForUser(user_id) 
        }
        catch{
            throw new ApiError('Failed to get all shipments for the current user in GetAllShipmentsForUser()', 500, 'Lähetyksien haku epäonnistui')
        }
    },

    async GetAllShipmentsForUserByStatus(user_id, status){
        try{
            return await Shipment.getAllForUserByStatus(user_id, status)
        }
        catch{
            throw new ApiError('Failed to get all shipments for the current user by status in GetAllShipmentsForUserByStatus()', 500, 'Lähetyksien haku tilan mukaan epäonnistui')
        }
        
    },

    async GetShipmentById(id, user_id){
        try{
            const shipment = await Shipment.getById(id, user_id)

            if(!shipment){
                throw new ApiError('Shipment not found in GetShipmentById() for user', 404, 'Lähetystä ei löydetty')
            }

            return shipment
        }
        catch{
            throw new ApiError('Failed to get shipments by id in GetShipmentById()', 500, 'Lähetyksen haku epäonnistui')
        }
        
    },

    async UpdateShipmentInformation(id, user_id, {shipment_name, ship_mmsi, eta, destination_id}){
        try{
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

            return Shipment.updateShipmentInformation(id, user_id, {shipment_name, ship_mmsi, eta, destination_id})
        }
        catch{
            throw new ApiError('Failed to update shipment information in UpdateShipmentInformation()', 500, 'Lähetyksen päivitys epäonnistui')
        }
        
    },

    async UpdateShipmentStatus(id, user_id, { status }){
        try{
            const shipment = await Shipment.getById(id, user_id)

            if(!shipment){
                throw new ApiError('Shipment not found in UpdateShipmentStatus() for user', 404, 'Lähetystä ei löydetty')
            }

            return Shipment.updateShipmentStatus(id, user_id, { status })
        }
        catch{
            throw new ApiError('Failed to update shipment status in UpdateShipmentStatus()', 500, 'Lähetyksen tilan päivitys epäonnistui')
        }
    },

    async RemoveShipment(id, user_id){
        try{
            const shipment = await Shipment.getById(id, user_id)

            if(!shipment){
                throw new ApiError('Shipment not found in RemoveShipment() for user', 404, 'Lähetystä ei löydetty')
            }

            return await Shipment.removeShipment(id)
        }
        catch{
            throw new ApiError('Failed to remove shipment in RemoveShipment()', 500, 'Lähetyksen poisto epäonnistui')
        }
        
    }
}

export default ShipmentService