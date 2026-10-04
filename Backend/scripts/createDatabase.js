import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import pg from 'pg'
import { fileURLToPath } from 'url'
import logger from '../utils/logger'
import crypto from 'crypto'

const { Client } = pg

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

if (process.env?.NODE_ENV !== 'production' && !fs.existsSync(envPath)) {
    const generatedJWTSecret = crypto.randomBytes(64).toString('hex');
    const defaultEnv = [
        `PORT=3001`,
        `DB_USER=postgres`,
        `DB_PASSWORD=`,
        `DB_HOST=localhost`,
        `DB_PORT=5432`,
        `DB_NAME=shipmenttracking`,
        `JWT_SECRET=${generatedJWTSecret}`
    ]
        .filter(Boolean)
        .join('\n');

    fs.writeFileSync(envPath, defaultEnv);
    logger.info(`Created missing .env file at: ${envPath}`);
    logger.info(`Please fill in the empty values! And modify any default values if necessary!`);
}

let PORT

try {
    PORT = process.env.PORT
    const DB_PASSWORD = process.env.DB_PASSWORD
    const JWT_SECRET = process.env.JWT_SECRET

    const envVariables = {
        PORT: PORT,
        DB_PASSWORD: DB_PASSWORD,
        JWT_SECRET: JWT_SECRET
    }

    const entries = Object.entries(envVariables)
    const values = Object.values(envVariables)

    if (values.includes(undefined) || values.includes('')) {
        logger.error(`Missing env variables`)
        throw new Error(`>>> Missing env variables:${entries.reduce((res, e) => {
            if (!e[1]) {
                res.push(` ${e[0]}`)
            }
            return res
        }, [])
            }\n`)
    }
} catch (err) {
    logger.info(err)
    logger.info(`To solve this, create a file with the name .env to backend/ and add the required variables to it, variables can be found in GitHub at https://github.com/Timanttiso/ShipmentTracking#backend`)
    process.exit(1)
}

async function createDatabase() {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres'
    })

    await client.connect()
    const dbName = process.env.DB_NAME || 'shipmenttracking'

    const result = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
    )

    if (result.rowCount === 0) {
        logger.info(`Database "${dbName}" does not exist. Creating...`)
        await client.query(`CREATE DATABASE ${dbName}`)
        logger.info(`Database "${dbName}" created.`)
    } else {
        logger.info(`Database "${dbName}" already exists.`)
    }

    await client.end()
}

await createDatabase().catch((err) => {
    logger.error(err)
    process.exit(1)
})