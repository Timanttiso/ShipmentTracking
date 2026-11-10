import { createContext, useContext } from 'react';
import type Ship from '../models/ship';

interface ShipContextValue {
	populateShips: () => Promise<void>;
	ships: Ship[];
	shipFetchError: string;
}

export const ShipContext = createContext<ShipContextValue | undefined>(undefined);

export default function useShips() {
	const context = useContext(ShipContext);
	if (!context) {
		throw new Error('useShips must be used within an AuthProvider');
	}
	return context;
}
