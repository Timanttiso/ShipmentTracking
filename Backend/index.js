import config from './utils/config.js'
import app from './app.js'
import logger from './utils/logger.js'
import RefreshTokenService from './services/refreshTokenService.js'

const cleanUpInterval = 60 * 60 * 1000 //hour in ms

app.listen(config.PORT, () => {
    logger.info(`API running on port: ${config.PORT}`)
})

const cleanup = async() => {
    try{
        let count = await RefreshTokenService.deleteExpired()
        logger.info(`Cleanup: deleted ${count} expired refresh tokens from the database`)
    }
    catch (error){
        logger.error('Refresh token cleanup failed: ', error)
    }
}

cleanup()
const timer = setInterval(cleanup, cleanUpInterval)
timer.unref()