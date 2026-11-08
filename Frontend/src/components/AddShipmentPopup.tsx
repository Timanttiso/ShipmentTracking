import { useEffect, useState, type JSX } from 'react'
import type Destination from '../models/destination'
import type Ship from '../models/ship'
import { addShipment } from '../services/api'
import Dropdown from './Dropdown'
import DestinationManagerPopup from './DestinationManagerPopup'
import ShipManagerPopup from './ShipManagerPopup'
import useDestinations from '../contexts/useDestinations'
import useShips from '../contexts/useShips'

interface AddShipmentPopupProps {
    onClose: () => void
    onAdd: () => void
}

export default function AddShipmentPopup({ onClose, onAdd }: AddShipmentPopupProps): JSX.Element {
    const { destinations, defaultDestination, destinationFetchError } = useDestinations()
    const { ships, shipFetchError } = useShips()

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(destinationFetchError || shipFetchError)
    const [isDestinationManagerOpen, setIsDestinationManagerOpen] = useState(false)
    const [isShipManagerOpen, setIsShipManagerOpen] = useState(false)
    const [shipmentName, setShipmentName] = useState('')
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null)
    const [eta, setEta] = useState('')
    const [selectedDestinationOverride, setSelectedDestinationOverride] = useState<Destination | null>(null)
    const selectedDestination = selectedDestinationOverride ?? defaultDestination

    useEffect(() => {
        const previousDocumentOverflow = document.documentElement.style.overflow
        const closeOnEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        document.documentElement.style.overflow = 'hidden'
        window.addEventListener('keydown', closeOnEscape)

        return () => {
            document.documentElement.style.overflow = previousDocumentOverflow
            window.removeEventListener('keydown', closeOnEscape)
        }
    }, [onClose, onAdd])

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!selectedDestination) {
            setError('Valitse määränpää.')
            return
        }

        if (!selectedShip) {
            setError('Valitse Laiva.')
            return
        }

        setError('')
        setSubmitting(true)

        const newShipment = {
            shipment_name: shipmentName.trim(),
            ship_id: selectedShip.id,
            eta: eta ? new Date(eta).toISOString() : null,
            destination_id: selectedDestination.id
        }

        try {
            await addShipment(newShipment)

            setShipmentName('')
            setEta('')
            setSubmitting(false)
            onAdd()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setError(message)
            setSubmitting(false)
        }
    }

    if (isDestinationManagerOpen) {
        return (
            <DestinationManagerPopup
                onClose={() => setIsDestinationManagerOpen(false)}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestinationOverride}
                initialCoordinates={
                    // Opens the location of the currently selected destination by default
                    selectedDestination
                        ? { lat: selectedDestination.lat, lng: selectedDestination.lon }
                        : { lat: 63.859577, lng: 23.037560 }
                }
            />
        )
    } else if (isShipManagerOpen) {
        return (
            <ShipManagerPopup
                onClose={() => setIsShipManagerOpen(false)}
                selectedShip={selectedShip}
                setSelectedShip={setSelectedShip}
            />
        )
    } else {
        return (
            <div
                className='popup-backdrop popup-backdrop--compact'
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose()
                }}
                role='presentation'
            >
                <section
                    className='popup-dialog add-shipment-dialog'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='add-shipment-title'
                >
                    <header className='popup-dialog__header'>
                        <div>
                            <p className='popup-dialog__eyebrow'>UUSI LÄHETYS</p>
                            <h2 id='add-shipment-title'>Lisää lähetys</h2>
                        </div>
                        <button
                            className='popup-dialog__close'
                            onClick={onClose}
                            type='button'
                            aria-label='Sulje lisäysikkuna'
                        >
                            ×
                        </button>
                    </header>

                    <form className='popup-form' onSubmit={handleSubmit}>
                        <label className='popup-form__field'>
                            <span>Lähetyksen nimi</span>
                            <input
                                autoFocus
                                name='shipment_name'
                                type='text'
                                value={shipmentName}
                                onChange={(e) => setShipmentName(e.target.value)}
                                placeholder='Esim. Maalit'
                                required
                                maxLength={120}
                            />
                        </label>

                        <label className='popup-form__field'>
                            <span>Arvioitu saapumisaika</span>
                            <input
                                name='eta'
                                type='datetime-local'
                                value={eta}
                                onChange={(e) => setEta(e.target.value)}
                            />
                        </label>

                        <label className='popup-form__field'>
                            <span>Laiva</span>
                            <Dropdown
                                getOptionLabel={(ship) => ship?.ship_nickname ?? null}
                                label='Laiva'
                                options={ships}
                                selectedOption={selectedShip}
                                onChange={option => setSelectedShip(option)}
                                onAdd={() => setIsShipManagerOpen(true)}
                            />
                        </label>

                        <div className='popup-form__field'>
                            <span>Määränpää</span>
                            <Dropdown
                                getOptionLabel={(destination) => destination?.destination_name ?? null}
                                label='Määränpää'
                                options={destinations}
                                selectedOption={selectedDestination ?? defaultDestination}
                                onChange={option => setSelectedDestinationOverride(option)}
                                onAdd={() => setIsDestinationManagerOpen(true)}
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <footer className='popup-form__actions'>
                            <button
                                className='popup-form__cancel'
                                onClick={onClose}
                                type='button'
                            >
                                Peruuta
                            </button>
                            <button className='popup-form__submit' type='submit'>
                                {submitting ? 'Lisätään...' : 'Lisää lähetys'}
                            </button>
                        </footer>
                    </form>
                </section>
            </div>
        )
    }
}