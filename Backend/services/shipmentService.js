import Shipment from "../models/shipment.js"
import Destination from "../models/destination.js"
import ApiError from '../utils/ApiError.js'

const ShipmentService = {
    async AddShipment({shipment_name, ship_mmsi, eta}, user_id){
        return await Shipment.add({
            shipment_name,
            ship_mmsi,
            eta,
            status: 1,
            lon: 0,
            lat: 0,
            user_id
        })
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

    async UpdateShipmentInformation(id, user_id, {shipment_name, ship_mmsi, eta, destination_id}){
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
    },

    async UpdateShipmentStatus(id, user_id, { status }){
        const shipment = await Shipment.getById(id, user_id)

        if(!shipment){
            throw new ApiError('Shipment not found in UpdateShipmentStatus() for user', 404, 'Lähetystä ei löydetty')
        }

        return Shipment.updateShipmentStatus(id, user_id, { status })
    }
}

export default ShipmentService