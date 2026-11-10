import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type Ship from '../models/ship';
import { fetchUserShips } from '../services/api';
import { ShipContext } from './useShips';

export function ShipProvider({ children }: { children: ReactNode }) {
	const [ships, setShips] = useState<Ship[]>([]);
	const [shipFetchError, setShipFetchError] = useState('');

	const populateShips = useCallback(async () => {
		try {
			let shipData = await fetchUserShips();
			shipData = shipData.sort((a, b) => {
				return a.ship_nickname.localeCompare(b.ship_nickname, 'fi');
			});

			setShips(shipData);
			setShipFetchError('');
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Yhteysvirhe';

			setShipFetchError(message);
			throw error;
		}
	}, []);

	useEffect(() => {
		void Promise.resolve().then(populateShips);
	}, [populateShips]);

	return (
		<ShipContext.Provider value={{ populateShips, ships, shipFetchError }}>
			{children}
		</ShipContext.Provider>
	);
}
