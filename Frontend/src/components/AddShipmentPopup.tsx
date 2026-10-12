import { useEffect, useState, type JSX } from 'react'
import { addShipment, fetchDestinations } from '../services/api'
import DestinationDropdown from './DestinationDropdown'
import DestinationManagerPopup from './DestinationManagerPopup'
import type { Destination } from '../types/destination'
import { useAuth } from '../contexts/AuthContext'

type AddShipmentPopupProps = {
    onClose: () => void
}

export default function AddShipmentPopup({ onClose }: AddShipmentPopupProps): JSX.Element {
    const [shipmentName, setShipmentName] = useState('')
    const [shipMmsi, setShipMmsi] = useState('')
    const [destinations, setDestinations] = useState<Destination[]>([])
    const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
    const [eta, setEta] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [isDestinationManagerOpen, setIsDestinationManagerOpen] = useState(false)

    const { user } = useAuth()

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
    }, [onClose])

    useEffect(() => {
        populateDestinations()
    }, [])

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const newShipment = {
            shipment_name: shipmentName.trim(),
            ship_mmsi: shipMmsi.trim(),
            eta: eta ? new Date(eta).toISOString() : null,
            destination_id: selectedDestination?.id ?? null
        }

        try {
            await addShipment(newShipment)

            setShipmentName('')
            setShipMmsi('')
            setEta('')
            setSubmitting(false)
            onClose()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setError(message)
            setSubmitting(false)
        }
    }

    const populateDestinations = async () => {
        try {
            let destinationData = await fetchDestinations()
            destinationData = destinationData.sort((a, b) => {
                return a.destination_name.localeCompare(b.destination_name, 'fi')
            })

            setDestinations(destinationData)

            if (user?.default_destination_id) {
                const defaultDestination = destinationData.find(d => d.id === user?.default_destination_id) ?? null
                setSelectedDestination(defaultDestination)
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'
            setError(message)
        }
    }

    if (isDestinationManagerOpen) {
        return (
            <DestinationManagerPopup
                onClose={() => setIsDestinationManagerOpen(false)}
                onNewDestination={() => populateDestinations()}
                destinations={destinations}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestination}
                initialCoordinates={
                    // Opens the location of the currently selected destination by default
                    selectedDestination
                        ? { lat: Number(selectedDestination.lat), lng: Number(selectedDestination.lon) }
                        : { lat: 63.859577, lng: 23.037560 }
                }
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
                            <span>Laivan MMSI</span>
                            <input
                                name='ship_mmsi'
                                type='text'
                                inputMode='numeric'
                                value={shipMmsi}
                                onChange={(e) => setShipMmsi(e.target.value)}
                                placeholder='Esim. 123456789'
                                required
                                maxLength={20}
                            />
                        </label>

                        <div className='popup-form__field'>
                            <span>Määränpää</span>
                            <DestinationDropdown
                                options={destinations}
                                selectedOption={selectedDestination}
                                onChange={(value) => setSelectedDestination(value)}
                                onOpenManager={() => setIsDestinationManagerOpen(true)}
                            />
                        </div>

                        <label className='popup-form__field'>
                            <span>Arvioitu saapumisaika</span>
                            <input
                                name='eta'
                                type='datetime-local'
                                value={eta}
                                onChange={(e) => setEta(e.target.value)}
                            />
                        </label>

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