import express from 'express'

const shipmentsRouter = express.Router()

shipmentsRouter.get('/', async (request, response) => {
    response.status(200).json("Not implemented yet");
})

export default shipmentsRouter;