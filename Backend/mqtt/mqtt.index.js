import logger from '../utils/logger.js';
import { createMqttClient, closeMqttClient } from './mqtt.client.js';
import { reloadSubscriptions } from './mqtt.subscriptionManager.js';
import { handleMqttMessage } from './mqtt.messageHandler.js';

let currentMMSIs = new Set();
let client = null;

let reloadTimer = null;
let maxReloadTimer = null;

/**
 * Starts the MQTT worker and returns a function for stopping the MQTT worker.
 * 
 * Before stopping the server, call the returned function to gracefully close the MQTT connection.
 */
async function startMqttWorker() {
    client = createMqttClient();

    client.on('connect', () => {
        requestSubscriptionReload();
    });

    client.on('message', (topic, payload) => {
        handleMqttMessage(topic, payload);
    });

    const stopMqttWorker = async () => {
        clearTimeout(reloadTimer);
        clearTimeout(maxReloadTimer);
        await closeMqttClient(client);
    };

    return stopMqttWorker;
};

/**
 * Schedules a reload of the MQTT topics based on the MMSIs in the database.
 * 
 * Call this from outside of the MQTT service whenever a ship is added or removed from the database.
 */
export function requestSubscriptionReload() {
    // reloadTimer makes sure there is at least 5 second of delay between subscription requests.
    // If for some reason there are many requests that cause the delay to constantly reset,
    // maxReloadTimer makes sure the request runs after 30 seconds at the latest.
    clearTimeout(reloadTimer);

    reloadTimer = setTimeout(runReload, 5000);

    if (!maxReloadTimer) {
        maxReloadTimer = setTimeout(runReload, 30000);
    };
};

let reloadInProgress = false;
let reloadRequestedDuringRun = false;

async function runReload() {
    clearTimeout(reloadTimer);
    clearTimeout(maxReloadTimer);
    reloadTimer = null;
    maxReloadTimer = null;

    if (reloadInProgress) {
        reloadRequestedDuringRun = true;
        return;
    };

    reloadInProgress = true;

    try {
        do {
            reloadRequestedDuringRun = false;
            currentMMSIs = await reloadSubscriptions({ client, currentMMSIs });
        } while (reloadRequestedDuringRun);
    } catch (error) {
        logger.error('Failed to reload MQTT subscriptions', error);
    } finally {
        reloadInProgress = false;

        // If another request is made while the previous one is still in progress,
        // queues up 1 more request after it.
        if (reloadRequestedDuringRun) {
            void runReload();
        };
    };
};

export default startMqttWorker;