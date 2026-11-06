import express from 'express'
import ShipService from '../services/shipService.js'
import auth from '../utils/auth.js'

const shipsRouter = express.Router()

//#region GET endpoints
// Gets all ships that the current user has a link to in the user_ships table
shipsRouter.get('/', auth.authenticationRequired, async (request, response, next) => {
    try{
        const UserShips = await ShipService.GetAllUserShips(request.user.id)

        response.status(200).json(UserShips)
    }
    catch(error){
        next(error)
    }
})

// Returns the informations of a specific ship based on id. This is the id of the actual ship not the link
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
// Adds a ship connection for the current user based on the given MMSI. If the ship does not exist in the database it will also be added.
// Returns the connection information, if needed can be modified to return the ship information as well
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

//#region PATCH endpoints
// Updates the ship user link nickname if it is given. Also updates the followed ship's MMSI if it is given. The connection will swap to the other ship's id with that MMSI. 
// If the ship with that MMSI does not exist in the database it is created.
shipsRouter.patch('/ship/:id', auth.authenticationRequired, async(request, response, next) => {
    try{
        // Actual ship id, not the connection, though if this is too hard to use in the frontend it needs to be swapped to something more fitting
        // The ship id changes when updating this so updating the same connection feels a bit odd in postman, something to take into account
        const { id } = request.params
        const { ship_nickname, mmsi } = request.body
        
        const UpdatedShip = await ShipService.UpdateShip(request.user.id, id, { ship_nickname, mmsi })

        response.status(200).json(UpdatedShip)
    }
    catch(error){
        next(error)
    }
})

//#endregion

//#region DELETE endpoints
// Deletes a link between a ship and a user. You need to give the ship's id in the route, not the ship link's id.
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