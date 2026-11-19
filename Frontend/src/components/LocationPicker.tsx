import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useEffect } from 'react';
import anchorIcon from '../assets/anchor.svg';
import 'leaflet/dist/leaflet.css';
import './styles/LocationMap.css';

interface LocationCoordinates {
	lat: number;
	lng: number;
}

interface LocationPickerProps {
	center: LocationCoordinates; // Updates when editable destination is changed.
	coordinates: LocationCoordinates; // Updates when map is clicked
	onSelect: (lat: number, lng: number) => void;
}

interface MapClickHandlerProps {
	onSelect: (position: LocationCoordinates) => void;
}

/*const markerIcon = divIcon({
	className: 'marker-pin default-marker-pin',
	html: `
		<svg viewBox='0 0 24 24' aria-hidden='true'>
			<path d='M20 10.2c0 5.2-8 11.3-8 11.3S4 15.4 4 10.2a8 8 0 1 1 16 0Z' fill='black' />
			<circle cx='12' cy='10' r='2.5' fill='white' />
		</svg>
	`,
	iconSize: [30, 30],
	iconAnchor: [15, 27.5],
});*/

const destinationIcon = divIcon({
	className: 'marker-pin destination-marker',
	html: `
		<svg viewBox='0 -2 40 48' aria-hidden='true'>
			<path d='M20 46C16.3 40.2 3 27.1 3 17a17 17 0 1 1 34 0c0 10.1-13.3 23.2-17 29Z' />
		</svg>
		<img class='marker-icon' src=${anchorIcon} alt='' />
	`,
	iconSize: [36, 36],
	iconAnchor: [19, 42],
});

function MapClickHandler({ onSelect }: MapClickHandlerProps) {
	useMapEvents({
		click(e) {
			onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
		},
	});

	return null;
}

function MapViewUpdater({ center }: { center: LocationCoordinates }) {
	const map = useMap();

	useEffect(() => {
		map.setView([center.lat, center.lng]);
	}, [center, map]);

	return null;
}

export default function LocationPicker({ center, coordinates, onSelect }: LocationPickerProps) {
	const handleSelect = ({ lat, lng }: LocationCoordinates) => {
		onSelect(lat, lng);
	};

	return (
		<>
			<p className='location-picker__instructions'>
				Valitse määränpään sijainti klikkaamalla karttaa. Määränpään tulisi olla sinua lähin satama, johon
				oletat lähetyksesi saapuvan. Tämän avulla merkitään milloin lähetyksesi on saapunut satamaan.
			</p>
			<MapContainer
				center={[coordinates.lat, coordinates.lng]}
				zoom={12}
				className='location-map'
				aria-label='Valitse määränpään sijainti kartalta'
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>
				<MapViewUpdater center={center} />
				<MapClickHandler onSelect={handleSelect} />
				<Marker position={[coordinates.lat, coordinates.lng]} icon={destinationIcon} />
			</MapContainer>
		</>
	);
}
