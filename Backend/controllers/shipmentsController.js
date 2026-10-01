import express from 'express'
import ShipmentService from '../services/shipmentService.js'
import auth from '../utils/auth.js'

const shipmentsRouter = express.Router()

shipmentsRouter.get('/', auth.authenticationRequired, async (request, response, next) => {
    try{
        const shipments = await ShipmentService.GetAllShipmentsForUser(request.user.id)

        response.status(200).json(shipments)
    }
    catch(error){
        next(error)
    }
})

shipmentsRouter.get('/status/:status', auth.authenticationRequired, async(request, response, next) => {
    try{
        const { status } = request.params

        if(status != 1 && status != 2 && status != 3){
            return response.status(400).json({ error: 'Bad status'})
        } 
        const shipments = await ShipmentService.GetAllShipmentsForUserByStatus(request.user.id, status)

        response.status(200).json(shipments)
    }
    catch(error){
        next(error)
    }
})

shipmentsRouter.get('/shipment/:id', auth.authenticationRequired, async(request, response, next) => {
    try{
        const { id } = request.params

        const shipment = await ShipmentService.GetShipmentById(id, request.user.id)
        
        response.status(200).json(shipment)
    }
    catch(error){
        next(error)
    }
})

shipmentsRouter.post('/add-shipment',auth.authenticationRequired, async (request, response, next) => {
    try{
        const { shipment_name, ship_mmsi, eta } = request.body
        
        const etaDate = new Date(eta);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        if (etaDate < startOfToday) {
            return response.status(400).json({ error: 'Odotettu saapumisaika ei voi olla menneisyydessä' });
        }

        const newShipment = await ShipmentService.AddShipment({ shipment_name, ship_mmsi, eta}, request.user.id)

        response.status(201).json(newShipment)
    }catch(error){
        next(error)
    }
})

export default shipmentsRouter;