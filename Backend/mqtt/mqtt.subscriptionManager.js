import Ship from '../models/ship.js';

export async function getDesiredMMSIs() {
    const rows = await Ship.getMMSIs();
    const desiredMMSIs = new Set(rows.map(({ mmsi }) => mmsi));

    return desiredMMSIs;
};

export async function reloadSubscriptions({ client, currentMMSIs }) {
    const newMMSIs = await getDesiredMMSIs();

    const added = checkDifference(newMMSIs, currentMMSIs);
    const removed = checkDifference(currentMMSIs, newMMSIs);
    const hasAdded = added.length > 0;
    const hasRemoved = removed.length > 0;

    if (!hasAdded && !hasRemoved) return newMMSIs;

    if (hasRemoved) {
        const topicsToRemove = removed.map((mmsi) => `vessels-v2/${mmsi}/location`);
        await client.unsubscribe(topicsToRemove);
    };

    if (hasAdded) {
        const topicsToAdd = added.map((mmsi) => `vessels-v2/${mmsi}/location`);
        await client.subscribe(topicsToAdd);
    };

    function checkDifference(setA, setB) {
        return [...setA].filter(mmsi => !setB.has(mmsi));
    };

    return newMMSIs;
};