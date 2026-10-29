import logger from './utils/logger.js'
import middleware from './utils/middleware.js'
import express from 'express'
import cookieParser from 'cookie-parser'
import shipmentsRouter from './controllers/shipmentsController.js'
import usersRouter from './controllers/usersController.js'
import DestinationRouter from './controllers/destinationController.js'
import shipsRouter from './controllers/shipsController.js'

const app = express()

if(process.env.NODE_ENV != 'test'){
    logger.info('Connecting...')
}


app.use(cookieParser())
app.use(express.json())

app.use('/api/shipments', shipmentsRouter)
app.use('/api/destinations', DestinationRouter)
app.use('/api/ships', shipsRouter)
app.use('/api/auth', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


export default app