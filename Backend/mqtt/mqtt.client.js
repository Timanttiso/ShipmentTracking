import logger from '../utils/logger.js';
import { connect } from 'mqtt';
// https://github.com/mqttjs/MQTT.js#readme

export function createMqttClient() {
    // Currently uses their test broker
    const client = connect('wss://meri-test.digitraffic.fi:443/mqtt', {
        clientId: 'ShipmentTracker student project',
        reconnectPeriod: 1000 * 60 * 10, // reconnect every 10 minutes, if disconnected
    });

    client.on('connect', () => logger.info('Connected to Digitraffic MQTT.'));
    client.on('reconnect', () => logger.info('Reconnecting to Digitraffic MQTT...'));
    client.on('disconnect', () => logger.info('Disconnecting Digitraffic MQTT client...'));
    client.on('error', (error) => logger.error('Digitraffic MQTT error', error));

    return client;
};

export async function closeMqttClient(client) {
    logger.info('Closing MQTT client connection...');

    try {
        await client.endAsync(true);
        logger.info('MQTT client connection Closed.');
    } catch (error) {
        logger.error(error);
    };
};
