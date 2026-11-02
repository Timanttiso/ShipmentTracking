import MqttModel from '../models/mqtt.js';
import logger from '../utils/logger.js';

export async function handleMqttMessage(topic, payload) {
    if (!topic || !payload) {
        logger.error(`Missing topic '${topic}' or paylod '${payload}' in MQTT message.`);
        return;
    };

    let messageBody;

    const [prefix, mmsi, messageType] = topic.split('/');
    if (prefix !== 'vessels-v2' || messageType !== 'location' || !mmsi) {
        logger.error(`Invalid MQTT prefix '${prefix}', messageType '${messageType}', or missing MMSI.`);
        return;
    };

    try {
        messageBody = JSON.parse(payload.toString('utf8'));
    } catch (error) {
        logger.error(`Invalid JSON on MQTT topic '${topic}'`, error);
        return;
    };

    if (!messageBody.lon || !messageBody.lat) {
        logger.error('Invalid coordinates in MQTT message.');
        return;
    };

    let shipBody = {
        ship_name: messageBody?.ship_name ?? null,
        lon: messageBody.lon,
        lat: messageBody.lat
    };

    const aisTime = Number(messageBody?.time);
    if (aisTime) shipBody.updated_at = new Date(aisTime * 1000);

    try {
        await MqttModel.updateShipInformation(mmsi, shipBody);
    } catch (error) {
        logger.error('MQTT Failed to update ship information', error);
    };
};
