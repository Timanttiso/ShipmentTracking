import express from 'express';
import db from '../db/db.js'

const healthRouter = express.Router()

healthRouter.get('/live', async (request, response) => {
    response.status(200).json({ status: 'Ok' })
})

healthRouter.get('/ready', async (request, response) => {
    try{
        await Promise.race([
            db.raw('SELECT 1'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
        ])
        response.status(200).json({ status: 'Ok', database: 'up' })
    }
    catch(error){
        response.status(503).json({ status: 'unavailable', database: 'down'})
    }
})

export default healthRouter