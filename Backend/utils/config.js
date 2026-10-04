import 'dotenv/config'
import logger from './logger.js'

let PORT

try {
    PORT = process.env.PORT || 3001
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

export default { PORT }