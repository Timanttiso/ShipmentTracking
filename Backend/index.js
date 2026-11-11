import config from './utils/config.js';
import app from './app.js';
import logger from './utils/logger.js';
import RefreshTokenService from './services/refreshTokenService.js';
import startMqttWorker from './mqtt/mqtt.index.js';
import ShipService from './services/shipService.js';
import { requestSubscriptionReload } from './mqtt/mqtt.index.js';

const cleanUpInterval = 60 * 60 * 1000; //hour in ms
const shipCleanupInterval = 24 * 60 * 60 * 1000 // 24 hours, daily

const server = app.listen(config.PORT, () => {
    logger.info(`API running on port: ${config.PORT}`);
});

const stopMqttWorker = await startMqttWorker();

let shuttingDown = false;

const cleanup = async () => {
    try {
        let count = await RefreshTokenService.deleteExpired();
        logger.info(`Cleanup: deleted ${count} expired refresh tokens from the database`);
    } catch (error) {
        logger.error('Refresh token cleanup failed: ', error);
    };
};

cleanup();
const timer = setInterval(cleanup, cleanUpInterval);
timer.unref();

const cleanupShips = async () => {
    try{
        let count = await ShipService.DeleteDeprecatedShips()
        if(count > 0){
            requestSubscriptionReload()
        }
        logger.info(`Cleanup: deleted ${count} deprecated ships from the database`);
    }
    catch(error){
        logger.error('Ship cleanup failed: ', error);
    }
}

cleanupShips();
const shipTimer = setInterval(cleanupShips, shipCleanupInterval);
shipTimer.unref();

async function gracefulShutdown() {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info('Gracefully shutting down...');
    clearInterval(timer);

    try {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    } catch (error) {
        logger.error('Graceful shutdown failed. Failed to close HTTP server.', error);
        process.exitCode = 1;
    };

    try {
        await stopMqttWorker();
    } catch (error) {
        logger.error('Graceful shutdown failed. Failed to stop MQTT service.', error);
        process.exitCode = 1;
    };

    shuttingDown = false;
};

process.once('SIGINT', () => void gracefulShutdown());
process.once('SIGTERM', () => void gracefulShutdown());