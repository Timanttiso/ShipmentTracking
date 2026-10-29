import express from 'express'
import ShipService from '../services/shipService.js'
import auth from '../utils/auth.js'

const shipsRouter = express.Router()

//#region GET endpoints
shipsRouter.get('/', auth.authenticationRequired, async (request, response, next) => {
    try{
        const UserShips = await ShipService.GetAllUserShips(request.user.id)

        response.status(200).json(UserShips)
    }
    catch(error){
        next(error)
    }
})

shipsRouter.get('/ship/:id', auth.authenticationRequired, async (request, response, next) => {
    try{
        const { id } = request.params

        const UserShip = await ShipService.GetSpecificShip(request.user.id, id)

        response.status(200).json(UserShip)
    }
    catch(error){
        next(error)
    }
})
//#endregion

//#region POST endpoints
shipsRouter.post('/add-ship', auth.authenticationRequired, async (request, response, next)  => {
    try{
        const { ship_nickname, mmsi } = request.body

        const newShipLink = await ShipService.AddShip(request.user.id, ship_nickname, mmsi)

        response.status(201).json(newShipLink)
    }
    catch(error){
        next(error)
    }
})
//#endregion

//#region DELETE endpoints
shipsRouter.delete('/unfollow/:id', auth.authenticationRequired, async (request, response, next) => {
    try {
        const { id } = request.params

        await ShipService.UnFollowShip(request.user.id, id)

        response.status(204).end()
    }
    catch(error){
        next(error)
    }
})

//#endregion

export default shipsRouter