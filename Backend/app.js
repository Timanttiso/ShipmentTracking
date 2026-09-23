import express from 'express'
import shipmentsRouter from './controllers/shipments.js'

const app = express()

app.use("/shipments", shipmentsRouter);

export default app