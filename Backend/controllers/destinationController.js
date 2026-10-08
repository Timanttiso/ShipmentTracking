import express from 'express'
import DestinationService from '../services/destinationService.js'
import auth from '../utils/auth.js'

const DestinationRouter = express.Router()

//#region GET endpoints
DestinationRouter.get('/', auth.authenticationRequired, async (request, response, next) => {
    try{
        const destinations = await DestinationService.GetAllForUser(request.user.id)

        response.status(200).json(destinations)
    }
    catch(error){
        next(error)
    }
})

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
DestinationRouter.post('/add-destination', auth.authenticationRequired, async (request, response, next) => {
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
DestinationRouter.patch('/destination/:id', auth.authenticationRequired, async (request, response, next) => {
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

export default DestinationRouter