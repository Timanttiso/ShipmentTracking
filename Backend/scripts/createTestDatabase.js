import knex from "knex"
import { randomUUID } from 'node:crypto'
import 'dotenv/config'
import logger from "../utils/logger"

const connection = (database) => ({
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ?? 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database
})

export function createTestDatabase(prefix){
    return async function setup(project){
        const dbName = `${prefix}_${randomUUID().replace(/-/g, '')}`

        const admin = knex({ client: 'pg', connection: connection('postgres') })
        await admin.raw('CREATE DATABASE ??', [dbName])

        const dbConnection = knex({
            client: 'pg',
            connection: connection(dbName),
            migrations: {directory: './db/migrations'}
        })
        await dbConnection.migrate.latest()
        await dbConnection.destroy()
        logger.info(`Test database ${dbName} created successfully`)

        project.provide('dbName', dbName)

        return async () => {
            await admin.raw('DROP DATABASE IF EXISTS ?? WITH (FORCE)', [dbName])
            await admin.destroy()
            logger.info(`Dropped ${dbName}`)
        }
    }
}