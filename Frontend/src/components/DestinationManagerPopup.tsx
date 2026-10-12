import { useState } from 'react'
import LocationPicker from './LocationPicker'
import { addDestination, updateDestination } from '../services/api'
import { updateSettings } from '../services/auth'
import type { Destination } from '../types/destination'
import type { Dispatch, SetStateAction } from 'react'
import './styles/DestinationManagerPopup.css'

type DestinationManagerPopupProps = {
    onClose: () => void
    onNewDestination: () => void
    destinations: Destination[]
    selectedDestination: Destination | null
    setSelectedDestination: Dispatch<SetStateAction<Destination | null>>
    initialCoordinates: { lat: number, lng: number }
}

const tabs = ['Lisää', 'Muokkaa'] as const

export default function DestinationManagerPopup({
    onClose,
    onNewDestination,
    destinations,
    selectedDestination,
    setSelectedDestination,
    initialCoordinates
}: DestinationManagerPopupProps) {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Lisää')
    const [destinationToEdit, setDestinationToEdit] = useState<Destination | null>(null)
    const [destinationToEditName, setDestinationToEditName] = useState('')
    const [destinationName, setDestinationName] = useState('')
    const [coordinates, setCoordinates] = useState(initialCoordinates)
    const [mapCenter, setMapCenter] = useState(initialCoordinates)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSelectLocation = (lat: number, lng: number) => {
        setCoordinates({ lat, lng })
    }

    const handleDestinationSelect = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
        if (activeTab === 'Lisää') return
        
        const destination = destinations.find(
            (item) => item.id === Number(e.target.value)
        )

        if (!destination) return

        setDestinationToEdit(destination)
        setDestinationToEditName(destination.destination_name)
        const newCoordinates = {
            lat: Number(destination.lat),
            lng: Number(destination.lon)
        }
        setCoordinates(newCoordinates)
        setMapCenter(newCoordinates)
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const newDestination = {
            destination_name: '',
            lon: coordinates.lng,
            lat: coordinates.lat
        }

        if (activeTab === 'Lisää') {
            newDestination.destination_name = destinationName.trim()
            try {
                const [addedDestination] = await addDestination(newDestination)
                setSelectedDestination(addedDestination)
                // Waiting for a fix to the settings endpoint, currently causes the request to fail.
                //await updateSettings({ default_destination_id: addedDestination.id })

                setDestinationName('')
                setCoordinates(initialCoordinates)
                setSubmitting(false)
                onClose()
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Yhteysvirhe'

                setError(message)
                setSubmitting(false)
            } finally {
                onNewDestination()
            }
        } else {
            newDestination.destination_name = destinationToEditName.trim()
            if (destinationToEdit === null || (destinationToEdit.destination_name === newDestination.destination_name
                && Number(destinationToEdit.lat) === coordinates.lat
                && Number(destinationToEdit.lon) === coordinates.lng)) {
                    setSubmitting(false)
                    onClose()
                    return
                }

            try {
                const [updatedDestination] = await updateDestination(destinationToEdit.id, newDestination)

                if (selectedDestination?.id === destinationToEdit.id) setSelectedDestination(updatedDestination)
                
                setDestinationToEditName('')
                setCoordinates(initialCoordinates)
                setSubmitting(false)
                onClose()
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Yhteysvirhe'

                setError(message)
                setSubmitting(false)
            } finally {
                onNewDestination()
            }
        }
    }

    return (
        <>
            <div
                className='popup-backdrop popup-backdrop--compact'
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose()
                }}
                role='presentation'
            >
                <section
                    className='popup-dialog'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='add-destination-title'
                >
                    <header className='popup-dialog__header'>
                        <div>
                            {activeTab === 'Lisää'
                                ? <h2 id='add-destination-title'>Lisää määränpää</h2>
                                : <h2 id='add-destination-title'>Muokkaa määränpäätä</h2>
                            }
                        </div>
                        <button
                            className='popup-dialog__close'
                            onClick={onClose}
                            type='button'
                            aria-label='Sulje ikkuna'
                        >
                            ×
                        </button>
                    </header>

                    <div className='destination-manager__tabs' role='group' aria-label='Määränpään toiminnot'>
                        {tabs.map((tab) => (
                            <button
                                className={`destination-manager__tab${activeTab === tab ? ' destination-manager__tab--active' : ''}`}
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                type='button'
                                aria-pressed={activeTab === tab}
                            >
                                <span>{tab}</span>
                            </button>
                        )
                        )}
                    </div>
                    <form onSubmit={handleSubmit}>
                        {activeTab === 'Muokkaa' && (
                            <label className='popup-form__field'>
                                <span>Valitse määränpää</span>
                                <select
                                    className='destination-manager__select'
                                    name='selected_destination'
                                    value={destinationToEdit?.id ?? ''}
                                    onChange={handleDestinationSelect}
                                    required
                                >
                                    <option value='' disabled>Valitse muokattava määränpää</option>
                                    {destinations.map((option) => (
                                        <option key={option.id} value={option.id}
                                            className={`dropdown__option destination-dropdown__option${destinationToEdit?.id === option.id ? ' dropdown__option--selected' : ''}`}
                                        >
                                            {option.destination_name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        <label className='popup-form__field'>
                            <span>Uusi määränpään nimi</span>
                            <input
                                autoFocus
                                name='destination_name'
                                type='text'
                                value={activeTab === 'Lisää' ? destinationName : destinationToEditName}
                                onChange={activeTab === 'Lisää' ? (
                                    (e) => setDestinationName(e.target.value)
                                ) : (
                                    (e) => setDestinationToEditName(e.target.value)
                                )}
                                placeholder='Esim. Kokkolan kantasatama'
                                required
                                maxLength={120}
                            />
                        </label>
                        <LocationPicker
                            center={mapCenter}
                            coordinates={coordinates}
                            onSelect={handleSelectLocation}
                        />
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
                                {activeTab === 'Lisää'
                                    ? submitting ? 'Lisätään...' : 'Lisää määränpää'
                                    : submitting ? 'Tallennetaan...' : 'Tallenna muutokset'
                                }
                            </button>
                        </footer>
                    </form>
                </section>
            </div>
        </>
    )
}