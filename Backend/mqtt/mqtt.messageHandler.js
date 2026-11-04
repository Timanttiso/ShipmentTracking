import Ship from '../models/ship.js';
import logger from '../utils/logger.js';

const SHIP_UPDATE_INTERVAL_MS = 60_000;
const shipStates = new Map();

async function processPendingUpdate(mmsi, state) {
    if (state.processing) return;

    state.processing = true;

    try {
        while (state.pendingMessage) {
            const now = Date.now();
            if (now - state.lastUpdateStartedAt < SHIP_UPDATE_INTERVAL_MS) break;

            const shipBody = state.pendingMessage;
            state.pendingMessage = null;
            state.lastUpdateStartedAt = now;

            try {
                await Ship.updateShipInformation(mmsi, shipBody);
            } catch (error) {
                logger.error('MQTT Failed to update ship information', error);
                state.pendingMessage ??= shipBody;
                break;
            }
        }
    } finally {
        state.processing = false;
    }
}

export default async function handleMqttMessage(topic, payload) {
    if (!topic || !payload) {
        logger.error(`Missing topic '${topic}' or paylod '${payload}' in MQTT message.`);
        return;
    };

    let messageBody;

    const [prefix, mmsi, messageType] = topic.split('/');
    if (prefix !== 'vessels-v2' || !mmsi) {
        logger.error(`Invalid MQTT prefix '${prefix}' or missing MMSI.`);
        return;
    };

    try {
        messageBody = JSON.parse(payload.toString('utf8'));
    } catch (error) {
        logger.error(`Invalid JSON on MQTT topic '${topic}'`, error);
        return;
    };

    let shipBody = {};

    switch(messageType) {
        case 'location': {
            const lon = Number(messageBody?.lon);
            const lat = Number(messageBody?.lat);

            if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
                logger.error('Invalid coordinates in MQTT message.');
                return;
            }

            const aisTime = Number(messageBody?.time);

            shipBody = {
                lon,
                lat,
                ...(aisTime ? { updated_at: new Date(aisTime * 1000) } : {})
            };
            break;
        };
        default: {
            logger.error(`Unsupported MQTT message type '${messageType}'.`);
            return;
        };
    };

    let state = shipStates.get(mmsi);
    if (!state) {
        state = {
            lastUpdateStartedAt: 0,
            pendingMessage: null,
            processing: false
        };
        shipStates.set(mmsi, state);
    }

    state.pendingMessage = shipBody;
    await processPendingUpdate(mmsi, state);
};
