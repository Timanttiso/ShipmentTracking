import Shipment from "../models/shipment.js"
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
    }
}

export default ShipmentService