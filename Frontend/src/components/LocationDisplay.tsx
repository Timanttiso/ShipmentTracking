import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';
import anchorIcon from '../assets/anchor.svg';
import packageIcon from '../assets/package.svg';
import 'leaflet/dist/leaflet.css';
import './styles/LocationMap.css';

interface LocationCoordinates {
	lat: number;
	lng: number;
}

interface LocationDisplayProps {
	shipCoordinates: LocationCoordinates;
	destinationCoordinates: LocationCoordinates;
}

const iconComposition = (icon: string) => {
	return `
			<svg viewBox='0 -2 40 48' aria-hidden='true'>
				<path d='M20 46C16.3 40.2 3 27.1 3 17a17 17 0 1 1 34 0c0 10.1-13.3 23.2-17 29Z' />
			</svg>
			<img class='marker-icon' src=${icon} alt='' />
	`;
};

const shipmentIcon = divIcon({
	className: 'marker-pin shipment-marker',
	html: iconComposition(packageIcon),
	iconSize: [36, 36],
	iconAnchor: [19, 42],
});

const destinationIcon = divIcon({
	className: 'marker-pin destination-marker',
	html: iconComposition(anchorIcon),
	iconSize: [36, 36],
	iconAnchor: [19, 42],
});

export default function LocationDisplay({ shipCoordinates, destinationCoordinates }: LocationDisplayProps) {
	return (
		<div className='location-picker'>
			<MapContainer center={[shipCoordinates.lat, shipCoordinates.lng]} zoom={6} className='location-picker__map'>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				<Marker position={[shipCoordinates.lat, shipCoordinates.lng]} icon={shipmentIcon}>
					<Tooltip direction='bottom'>Lähetystäsi kuljettava laiva</Tooltip>
				</Marker>
				<Marker position={[destinationCoordinates.lat, destinationCoordinates.lng]} icon={destinationIcon}>
					<Tooltip direction='bottom'>Määränpää satama</Tooltip>
				</Marker>
			</MapContainer>
		</div>
	);
}
