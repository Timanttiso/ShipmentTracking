import express from 'express'
import ShipmentService from '../services/shipmentService.js'
import auth from '../utils/auth.js'
import { z } from 'zod'
import { validate } from '../utils/validate.js'

const shipmentsRouter = express.Router()

const shipmentSchema = z.object({
    shipment_name: z
        .string({ error: 'Kuljetuksen nimi vaaditaan' })
        .max(200, 'Kuljetuksen nimi ei saa olla yli 200 merkkiä'),
    eta: z.iso
        .datetime({ error: 'Odotettu saapumis aika vaaditaan'}),
    destination_id: z
        .number({ error: 'Kuljetuksen päämäärä vaaditaan' })
        .positive({ error: 'Virheellinen päämäärä' }),
    ship_id: z
        .number({ error: 'Alus vaaditaan' })
        .positive({ error: 'Virheellinen alus' })
})

const shipmentUpdateSchema = shipmentSchema
    .partial()

const shipmentStatusUpdateSchema = z.object({
    status: z
        .number({ error: 'Päivitetty tila vaaditaan' })
        .positive({ error: 'Virheellinen tila' })
})

//#region GET endpoints
// Gets all shipments for the current user. This also includes the destination and ship information linked to the shipments
shipmentsRouter.get('/', auth.authenticationRequired, async (request, response, next) => {
    try{
        const shipments = await ShipmentService.GetAllShipmentsForUser(request.user.id)

        response.status(200).json(shipments)
    }
    catch(error){
        next(error)
    }
})

// Filters the shipments based on the status of the shipment. The wanted status is given in the route
shipmentsRouter.get('/status/:status', auth.authenticationRequired, async(request, response, next) => {
    try{
        const { status } = request.params

        if(status != 1 && status != 2 && status != 3){
            return response.status(400).json({ error: 'Väärä tila'})
        } 
        const shipments = await ShipmentService.GetAllShipmentsForUserByStatus(request.user.id, status)

        response.status(200).json(shipments)
    }
    catch(error){
        next(error)
    }
})

// Gets a specific shipment based on it's id
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

// Gets the distance between ships and destinations for all shipments (not user specific atm)
shipmentsRouter.get('/distance', auth.authenticationRequired, async (request, response, next) => {
    try{
        const arrivingShipments = await ShipmentService.getDistanceFromShipToDestination()

        response.status(200).json(arrivingShipments)
    }
    catch(error){
        next(error)
    }
})
//#endregion

//#region POST endpoints
// Adds a new shipment for the current user
shipmentsRouter.post('/add-shipment',auth.authenticationRequired, validate(shipmentSchema), async (request, response, next) => {
    try{
        const { shipment_name, eta, destination_id, ship_id } = request.body
        
        const etaDate = new Date(eta);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        if (etaDate < startOfToday) {
            return response.status(400).json({ error: 'Odotettu saapumisaika ei voi olla menneisyydessä' });
        }

        const newShipment = await ShipmentService.AddShipment({ shipment_name, eta, destination_id, ship_id}, request.user.id)

        response.status(201).json(newShipment)
    }catch(error){
        next(error)
    }
})
//#endregion

//#region PATCH endpoints
// Updates a specific shipment with the given id in the route
shipmentsRouter.patch('/shipment/:id', auth.authenticationRequired, validate(shipmentUpdateSchema), async(request, response, next) => {
    try{
        const { id } = request.params

        const { shipment_name, eta, destination_id, ship_id } = request.body

        const etaDate = new Date(eta);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        if (etaDate < startOfToday) {
            return response.status(400).json({ error: 'Odotettu saapumisaika ei voi olla menneisyydessä' });
        }

        const updatedShipment = await ShipmentService.UpdateShipmentInformation(id, request.user.id, {shipment_name, eta, destination_id, ship_id})

        response.status(200).json(updatedShipment)
    }
    catch(error){
        next(error)
    }
})

// Not 100% sure if required, since this could also be done in the MQTT listener service
// Updates the status of the shipment
shipmentsRouter.patch('/shipment/status/:id', auth.authenticationRequired, validate(shipmentStatusUpdateSchema), async(request, response, next) => {
    try{
        const { id } = request.params

        const { status } = request.body

        if(status != 1 && status != 2 && status != 3){
            return response.status(400).json({ error: 'Väärä tila' })
        } 
        const updatedShipment = await ShipmentService.UpdateShipmentStatus(id, request.user.id, { status })

        response.status(200).json(updatedShipment)
    }
    catch(error){
        next(error)
    }
})
//#endregion

//#region DELETE endpoints
// Deletes a shipment with the given id in the route
shipmentsRouter.delete('/shipment/:id', auth.authenticationRequired, async(request, response, next) => {
    try{
        const { id } = request.params

        await ShipmentService.RemoveShipment(id, request.user.id)

        response.status(204).json()
    }
    catch(error){
        next(error)
    }
})

//#endregion

export default shipmentsRouter;