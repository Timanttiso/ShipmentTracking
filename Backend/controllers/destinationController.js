import express from 'express'
import DestinationService from '../services/destinationService.js'
import auth from '../utils/auth.js'

const DestinationRouter = express.Router()

DestinationRouter.get('/', auth.authenticationRequired, async (request, response, next) => {
    try{
        const destinations = await DestinationService.GetAllForUser(request.user.id)

        response.status(200).json(destinations)
    }
    catch(error){
        next(error)
    }
})

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

export default DestinationRouter