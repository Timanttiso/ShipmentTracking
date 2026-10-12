import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import './styles/LocationPicker.css'

type LocationCoordinates = {
    lat: number
    lng: number
}

type LocationPickerProps = {
    center: LocationCoordinates // Updates when editable destination is changed.
    coordinates: LocationCoordinates // Updates when map is clicked
    onSelect: (lat: number, lng: number) => void
}

type MapClickHandlerProps = {
    onSelect: (position: LocationCoordinates) => void
}

function MapClickHandler({ onSelect }: MapClickHandlerProps) {
    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
        },
    })

    return null
}

function MapViewUpdater({ center }: { center: LocationCoordinates }) {
    const map = useMap()
    
    useEffect(() => {
        map.setView([center.lat, center.lng])
    }, [center])

    return null
}

export default function LocationPicker({ center, coordinates, onSelect }: LocationPickerProps) {
    const handleSelect = ({ lat, lng }: LocationCoordinates) => {
        onSelect(lat, lng)
    }

    return (
        <div className='location-picker'>
            <p className='location-picker__instructions'>
                Valitse määränpään sijainti klikkaamalla karttaa. Määränpään tulisi olla sinua lähin satama, johon oletat lähetyksesi saapuvan. Tämän avulla merkitään milloin lähetyksesi on saapunut satamaan.
            </p>
            <MapContainer
                center={[coordinates.lat, coordinates.lng]}
                zoom={12}
                className='location-picker__map'
                aria-label='Valitse määränpään sijainti kartalta'
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <MapViewUpdater center={center} />
                <MapClickHandler onSelect={handleSelect} />
                <Marker position={[coordinates.lat, coordinates.lng]} />
            </MapContainer>
        </div>
    )
}
