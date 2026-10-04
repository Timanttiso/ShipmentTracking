import { useEffect, useState, type JSX } from 'react'
import { addShipment } from '../services/api'
import './AddShipmentPopup.css'

type AddShipmentPopupProps = {
    onClose: () => void
}

export default function AddShipmentPopup({ onClose }: AddShipmentPopupProps): JSX.Element {
    const [shipmentName, setShipmentName] = useState('')
    const [shipMmsi, setShipMmsi] = useState('')
    const [eta, setEta] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

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

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const newShipment = {
            shipment_name: shipmentName.trim(),
            ship_mmsi: shipMmsi.trim(),
            eta: eta ? new Date(eta).toISOString() : null,
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

    return (
        <div
            className='add-shipment-backdrop'
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
            role='presentation'
        >
            <section
                className='add-shipment-dialog'
                role='dialog'
                aria-modal='true'
                aria-labelledby='add-shipment-title'
            >
                <header className='add-shipment-dialog__header'>
                    <div>
                        <p className='add-shipment-dialog__eyebrow'>UUSI LÄHETYS</p>
                        <h2 id='add-shipment-title'>Lisää lähetys</h2>
                    </div>
                    <button
                        className='add-shipment-dialog__close'
                        onClick={onClose}
                        type='button'
                        aria-label='Sulje lisäysikkuna'
                    >
                        ×
                    </button>
                </header>

                <form className='add-shipment-form' onSubmit={handleSubmit}>
                    <label className='add-shipment-form__field add-shipment-form__field--wide'>
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

                    <label className='add-shipment-form__field'>
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

                    <label className='add-shipment-form__field'>
                        <span>Arvioitu saapumisaika</span>
                        <input
                            name='eta'
                            type='datetime-local'
                            value={eta}
                            onChange={(e) => setEta(e.target.value)}
                        />
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    <footer className='add-shipment-form__actions'>
                        <button
                            className='add-shipment-form__cancel'
                            onClick={onClose}
                            type='button'
                        >
                            Peruuta
                        </button>
                        <button className='add-shipment-form__submit' type='submit'>
                            {submitting ? 'Lisätään...' : 'Lisää lähetys'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    )
}