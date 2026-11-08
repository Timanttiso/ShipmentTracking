export default interface Ship {
	ship_nickname: string;
	id: number;
	ship_name: string | null;
	mmsi: string;
	lon: number | null;
	lat: number | null;
	updated_at: string | null;
}

export interface CreatedShip {
	id: number;
	user_id: number;
	ship_id: number;
	ship_nickname: string;
}