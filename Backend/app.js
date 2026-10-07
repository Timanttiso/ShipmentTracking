import logger from './utils/logger.js';
import middleware from './utils/middleware.js';
import express from 'express'
import shipmentsRouter from './controllers/shipmentsController.js'
import usersRouter from './controllers/usersController.js';
import DestinationRouter from './controllers/destinationController.js';

const app = express()

logger.info('Connecting...')

app.use(express.json())

app.use('/api/shipments', shipmentsRouter)
app.use('/api/destinations', DestinationRouter)
app.use('/api/auth', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app