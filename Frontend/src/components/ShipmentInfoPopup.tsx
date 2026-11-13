import { useEffect, type JSX, type Dispatch, type SetStateAction } from 'react'
import type Shipment from '../models/shipment'
import { shipmentStatusLabels } from '../models/shipment'
import LocationDisplay from './LocationDisplay'
import Icon from '../constants/Icons'
import './styles/ShipmentInfoPopup.css'

interface shipmentInfoPopupProps {
    setActiveMap: Dispatch<SetStateAction<Shipment | null>>
    activeMap: Shipment
    formatDateTime: (value: string | null, fallback: string) => string
}

export default function ShipmentInfoPopup({ setActiveMap, activeMap, formatDateTime }: shipmentInfoPopupProps): JSX.Element {
    useEffect(() => {
        if (!activeMap) return

        const previousDocumentOverflow = document.documentElement.style.overflow
        const closeOnEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveMap(null)
        }

        document.documentElement.style.overflow = 'hidden'
        window.addEventListener('keydown', closeOnEscape)

        return () => {
            document.documentElement.style.overflow = previousDocumentOverflow
            window.removeEventListener('keydown', closeOnEscape)
        }
    }, [activeMap, setActiveMap])
    
    return (
        <div
            className='popup-backdrop popup-backdrop--map'
            onClick={(e) => {
                if (e.target === e.currentTarget) setActiveMap(null)
            }}
            role='presentation'
        >
            <section className='popup-dialog map-dialog' role='dialog' aria-modal='true' aria-labelledby='map-dialog-title'>
                <header className='popup-dialog__header'>
                    <div>
                        <h2 id='map-dialog-title'>{activeMap.shipment_name}</h2>
                    </div>
                    <button
                        className='popup-dialog__close'
                        onClick={() => setActiveMap(null)}
                        type='button'
                        aria-label='Sulje kartta'
                        autoFocus
                    >
                        ×
                    </button>
                </header>
                <dl className='map-dialog__details'>
                    <div><dt>Arvioitu saapumisaika</dt><dd>{formatDateTime(activeMap.eta, 'Ei arvioitua saapumisaikaa')}</dd></div>
                    <div><dt>Viimeksi päivitetty</dt><dd>{formatDateTime(activeMap.ship_updated_at, 'Ei päivitystietoa')}</dd></div>
                    <div><dt>Määränpää</dt><dd>{activeMap.destination_name}</dd></div>
                    <div><dt>MMSI</dt><dd>{activeMap.mmsi}</dd></div>
                    <div>
                        <dt>Tila</dt>
                        <dd>
                            <span className={`status-badge status-badge--${shipmentStatusLabels[activeMap.status] === 'Matkalla' ? 'in-transit' : shipmentStatusLabels[activeMap.status] === 'Saapunut' ? 'arrived' : 'delayed'}`}>
                                <span className='status-badge__dot' aria-hidden='true'></span>
                                {shipmentStatusLabels[activeMap.status]}
                            </span>
                        </dd>
                    </div>
                </dl>
                {activeMap.lat !== null && activeMap.lon !== null ? (
                    <LocationDisplay
                        destinationCoordinates={{ lat: activeMap.destination_lat, lng: activeMap.destination_lon }}
                        shipCoordinates={{ lat: activeMap.lat, lng: activeMap.lon }}
                    />
                ) : (
                    <div className='map-empty-state' role='status'>
                        <div className='map-empty-state__icon' aria-hidden='true'>
                            <Icon icon='location' size={30} viewbox='0 0 24 24' color='none' stroke='#527c67' />
                        </div>
                        <div className='map-empty-state__copy'>
                            <h3>Sijainti ei ole vielä saatavilla</h3>
                            <p>Lähetystäsi kuljettavan laivan sijainti näytetään tässä, kun se on havaittu.</p>
                        </div>
                        <span className='map-empty-state__status'>
                            <span aria-hidden='true'></span>
                            Odottaa sijaintitietoa
                        </span>
                    </div>
                )}
            </section>
        </div>
    )
}