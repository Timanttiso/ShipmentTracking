import { useState, useEffect, useCallback } from 'react'
import type Shipment from '../types/shipment'
import { shipmentStatusLabels } from '../types/shipment'
import AddShipmentPopup from '../components/AddShipmentPopup'
import ShipmentInfoPopup from '../components/ShipmentInfoPopup'
import SortDropdown, { type SortDirection } from '../components/SortDropdown'
import ToastMessage from '../components/ToastMessage'
import { fetchShipments } from '../services/api'
import useDestinations from '../contexts/useDestinations'
import '../components/styles/Dropdown.css'
import '../components/styles/Popup.css'
import './styles/Dashboard.css'

const filters = ['Kaikki', 'Matkalla', 'Toimitettu', 'Viivästynyt'] as const
const sortOptions = [
    { value: 'name', label: 'Nimi' },
    { value: 'eta', label: 'Saapumisaika' },
    { value: 'updated_at', label: 'Päivitetty' },
] as const

type SortOption = (typeof sortOptions)[number]['value']

const formatDateTime = (value: string | null, fallback: string) => {
    if (!value) return fallback

    const date = new Date(value)

    return date.toLocaleString('fi-FI', {
        dateStyle: 'short',
        timeStyle: 'short',
    })
}

export default function Dashboard() {
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('Kaikki')
    const [sortBy, setSortBy] = useState<SortOption>('name')
    const [activeMap, setActiveMap] = useState<Shipment | null>(null)
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const { destinations } = useDestinations()

    const destinationById = new Map(destinations.map((destination) => [destination.id, destination]))

    const visibleShipments = shipments.filter((shipment) => {
        const matchesSearch = `${shipment.shipment_name} ${shipment.ship_mmsi}`
            .toLocaleLowerCase('fi')
            .includes(search.toLocaleLowerCase('fi'))
        const matchesFilter = activeFilter === 'Kaikki' || shipmentStatusLabels[shipment.status] === activeFilter

        return matchesSearch && matchesFilter
    }).sort((a, b) => {
        let comparison: number

        if (sortBy === 'name') {
            comparison = a.shipment_name.localeCompare(b.shipment_name, 'fi')
        } else if (sortBy === 'eta') {
            if (!a.eta || !b.eta) {
                if (!a.eta && !b.eta) return 0
                return !a.eta ? 1 : -1
            }
            comparison = new Date(a.eta).getTime() - new Date(b.eta).getTime()
        } else {
            const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
            const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
            comparison = aTime - bTime
        }

        return sortDirection === 'asc' ? comparison : -comparison
    })

    const populateShipmentList = useCallback(async () => {
        try {
            const shipmentData = await fetchShipments()
            setShipments(shipmentData)
            setError('')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'
            setError(message)
        }
    }, [])

    const handleShipmentAdd = async () => {
        setIsAddPopupOpen(false)
        await populateShipmentList()
        setSuccessMessage('Lähetys lisätty.')
    }

    useEffect(() => {
        void Promise.resolve().then(populateShipmentList)
    }, [populateShipmentList])

    return (
        <main className='dashboard-page'>
            <div className='dashboard-main'>
                <ToastMessage message={successMessage} onAfterToast={() => setSuccessMessage('')} />
                <section className='dashboard-heading' aria-labelledby='page-title'>
                    <h1 id='page-title'>Lähetykset</h1>
                    <button className='add-shipment-button' onClick={() => setIsAddPopupOpen(true)}>Lisää Lähetys</button>
                </section>

                <section className='shipment-section' aria-label='Lähetyslista'>
                    <div className='shipment-toolbar'>
                        <div className='filter-tabs' role='group' aria-label='Suodata lähetyksiä'>
                            {filters.map((filter) => {
                                const count = filter === 'Kaikki'
                                    ? shipments.length
                                    : shipments.filter((shipment) => shipmentStatusLabels[shipment.status] === filter).length

                                return (
                                    <button
                                        className={`filter-tab${activeFilter === filter ? ' filter-tab--active' : ''}`}
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        type='button'
                                        aria-pressed={activeFilter === filter}
                                    >
                                        <span>{filter}</span>
                                        <span className='filter-count'>{count}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <div className='shipment-toolbar__actions'>
                            <SortDropdown
                                options={sortOptions}
                                value={sortBy}
                                onChange={setSortBy}
                                direction={sortDirection}
                                onDirectionChange={() =>
                                    setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')
                                }
                            />
                            <label className='shipment-search'>
                                <input
                                    name='search'
                                    type='search'
                                    placeholder='Hae lähetyksiä'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <span className='shipment-search__icon' aria-hidden='true'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        height='20px'
                                        viewBox='0 -960 960 760'
                                        width='20px'
                                        fill='#8b9498'
                                    >
                                        <path d='M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z' />
                                    </svg>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className='shipment-list'>
                        <div className='shipment-list__header' aria-hidden='true'>
                            <span className='shipment-list__header-name'>
                                <span>LÄHETYS</span>
                                <span>Viimeksi päivitetty</span>
                            </span>
                            <span>Määränpää</span>
                            <span>ARVIOITU SAAPUMISAIKA</span>
                            <span>TILANNE</span>
                        </div>

                        {error && <p className="error-message">{error}</p>}
                        {visibleShipments.map((shipment) => {
                            shipment.destination_name = destinationById.get(shipment.destination_id ?? -1)?.destination_name ?? 'Ei määritetty'
                            return (
                                <article
                                    className='shipment-row'
                                    key={shipment.id}
                                    onClick={() => setActiveMap(shipment)}
                                    onKeyDown={(e) => {
                                        if (e.target !== e.currentTarget) return
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setActiveMap(shipment)
                                        }
                                    }}
                                    role='button'
                                    tabIndex={0}
                                    aria-label={`Avaa lähetyksen ${shipment.shipment_name} tiedot.`}
                                >
                                    <div className='shipment-name'>
                                        <span className='mobile-field-label'>LÄHETYS</span>
                                        <h2>{shipment.shipment_name}</h2>
                                        <div className='shipment-updated-group'>
                                            <span className='mobile-field-label'>Viimeksi päivitetty</span>
                                            <span className='shipment-updated'>{formatDateTime(shipment.updated_at ?? shipment.created_at, 'Ei päivitystietoa')}</span>
                                        </div>
                                    </div>
                                    <div className='shipment-destination'>
                                        <span className='mobile-field-label'>Määränpää</span>
                                        <strong>{shipment.destination_name}</strong>
                                    </div>
                                    <div className='shipment-eta'>
                                        <span className='mobile-field-label'>ARVIOITU SAAPUMISAIKA</span>
                                        <strong>{formatDateTime(shipment.eta, 'Ei arvioitua saapumisaikaa')}</strong>
                                    </div>
                                    <div className='shipment-status'>
                                        <span className='mobile-field-label'>TILANNE</span>
                                        <span className={`status-badge status-badge--${shipmentStatusLabels[shipment.status] === 'Matkalla' ? 'transit' : shipmentStatusLabels[shipment.status] === 'Toimitettu' ? 'delivered' : 'delayed'}`}>
                                            <span className='status-badge__dot' aria-hidden='true'></span>
                                            {shipmentStatusLabels[shipment.status]}
                                        </span>
                                    </div>
                                    <span className='shipment-row__open' aria-hidden='true'>↗</span>
                                </article>
                            )
                        })}
                        {visibleShipments.length === 0 && (
                            <p className='empty-state'>Lähetyksiä ei löytynyt. Kokeile toista hakua tai suodatinta.</p>
                        )}
                    </div>
                </section>
            </div>
            {activeMap && (
                <ShipmentInfoPopup
                    setActiveMap={setActiveMap}
                    activeMap={activeMap}
                    formatDateTime={formatDateTime}
                />
            )}
            {isAddPopupOpen && (
                <AddShipmentPopup onClose={() => setIsAddPopupOpen(false)} onAdd={handleShipmentAdd} />
            )}
        </main>
    )
}