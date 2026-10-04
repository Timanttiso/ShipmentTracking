import { useEffect, type JSX, type Dispatch, type SetStateAction } from 'react'
import { shipmentStatusLabels, type Shipment } from '../types/shipment'
import './ShipmentInfoPopup.css'

type shipmentInfoPopupProps = {
    setActiveMap: Dispatch<SetStateAction<Shipment | null>>
    activeMap: Shipment
    formatDateTime: (value: string | null, fallback: string) => string
}

const mapEmbedUrl = (shipment: Shipment, zoom = 6) =>
    `https://maps.google.com/maps?q=${shipment.lat},${shipment.lon}&z=${zoom}&output=embed`

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
    }, [activeMap])
    
    return (
        <div
            className='map-dialog-backdrop'
            onClick={(e) => {
                if (e.target === e.currentTarget) setActiveMap(null)
            }}
            role='presentation'
        >
            <section className='map-dialog' role='dialog' aria-modal='true' aria-labelledby='map-dialog-title'>
                <header className='map-dialog__header'>
                    <div>
                        <h2 id='map-dialog-title'>{activeMap.shipment_name}</h2>
                    </div>
                    <button
                        className='map-dialog__close'
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
                    <div><dt>Viimeksi päivitetty</dt><dd>{formatDateTime(activeMap.updated_at, 'Ei päivitystietoa')}</dd></div>
                    <div><dt>MMSI</dt><dd>{activeMap.ship_mmsi}</dd></div>
                    <div>
                        <dt>Tila</dt>
                        <dd>
                            <span className={`status-badge status-badge--${shipmentStatusLabels[activeMap.status] === 'Matkalla' ? 'transit' : shipmentStatusLabels[activeMap.status] === 'Toimitettu' ? 'delivered' : 'delayed'}`}>
                                <span className='status-badge__dot' aria-hidden='true'></span>
                                {shipmentStatusLabels[activeMap.status]}
                            </span>
                        </dd>
                    </div>
                </dl>
                <iframe
                    src={mapEmbedUrl(activeMap, 6)}
                    title={`Kartta: ${activeMap.shipment_name}`}
                    allowFullScreen
                />
            </section>
        </div>
    )
}