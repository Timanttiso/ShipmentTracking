import express from 'express'
import shipmentsRouter from './controllers/shipmentsController.js'
import usersRouter from './controllers/usersController.js';

const app = express()

app.use(express.json())

app.use('/api/shipments', shipmentsRouter);
app.use('/api/auth', usersRouter);

export default app