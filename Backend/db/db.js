import knex from 'knex'
import config from '../knexfile.js'

const environment = process.env.NODE_ENV || 'development'
const dbConfig = config[environment]

if(!dbConfig){
    throw new Error('Missing a knex config for the current environment')
}

const db = knex(dbConfig)

export default db