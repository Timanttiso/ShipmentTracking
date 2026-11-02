import db from '../db/db.js';

// Feel free to combine this with ship model later. Added this file for now to not disturb any ongoing changes in the ship model

const MqttModel = {
    async getMMSIs(dbConn = db) {
        return dbConn('ships')
            //.join('shipments', 'shipments.ship_id', 'ships.id') // ship_id not yet added
            .distinct('ships.mmsi');
            //.whereIn('shipments.status', [1, 3]);
    },
    async updateShipInformation(mmsi, { ship_name, lon, lat, updated_at }, dbConn = db) {
        return dbConn('ships')
            .where({ mmsi })
            .update({ ship_name, lon, lat, updated_at })
            .returning('*');
    }
};

export default MqttModel;