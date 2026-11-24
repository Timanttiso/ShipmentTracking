import express from 'express'
import DestinationService from '../services/destinationService.js'
import auth from '../utils/auth.js'
import { z } from 'zod'
import { validate } from '../utils/validate.js'

const DestinationRouter = express.Router()

const destinationSchema = z.object({
    destination_name: z
        .string({ error: 'Määränpään nimi vaaditaan' })
        .min(3, { error: 'Määränpään nimen täytyy olla vähintään 3 merkkiä' })
        .max(100, { error: 'Määränpään nimi ei saa olla yli 100 merkkiä' }),
    lon: z
        .number({ error: 'Määränpään pituusaste vaaditaan' }),
    lat: z
        .number({ error: 'Määränpään leveysaste vaaditaan' })
})

const updateDestinationSchema = destinationSchema
    .partial()

//#region GET endpoints
// Gets all of destinations linked to the currently logged in user
DestinationRouter.get('/', auth.authenticationRequired, async (request, response, next) => {
    try{
        const destinations = await DestinationService.GetAllForUser(request.user.id)

        response.status(200).json(destinations)
    }
    catch(error){
        next(error)
    }
})

// Gets a specific destination with the id given in the route. Though the destination needs to be linked to the user.
DestinationRouter.get('/destination/:id', auth.authenticationRequired, async (request, response, next) => {
    try{
        const { id } = request.params

        const destination = await DestinationService.GetById(id, request.user.id)

        response.status(200).json(destination)
    }
    catch(error){
        next(error)
    }
})
//#endregion

//#region POST endpoints
// Adds a destination for the current user
DestinationRouter.post('/add-destination', auth.authenticationRequired, validate(destinationSchema), async (request, response, next) => {
    try{
        const { destination_name, lon, lat } = request.body

        const newDestination = await DestinationService.AddDestination({ destination_name, lon, lat}, request.user.id)

        response.status(201).json(newDestination)
    }
    catch(error){
        next(error)
    }
})
//#endregion

//#region PATCH endpoints
// Updates a specific destination
DestinationRouter.patch('/destination/:id', auth.authenticationRequired, validate(updateDestinationSchema), async (request, response, next) => {
    try{
        const { id } = request.params
        const { destination_name, lon, lat } = request.body

        const updatedDestination = await DestinationService.UpdateDestinationInfo(id, request.user.id, {destination_name, lon, lat})

        response.status(200).json(updatedDestination)
    }
    catch(error){
        next(error)
    }
})

//#endregion

//#region DELETE endpoints
// Deletes a destination with the id given in the route
DestinationRouter.delete('/destination/:id', auth.authenticationRequired, async (request, response, next) => {
    try{
        const { id } = request.params

        await DestinationService.DeleteDestination(id, request.user.id)

        response.status(204).end()
    }
    catch(error){
        next(error)
    }
})


//#endregion
export default DestinationRouter