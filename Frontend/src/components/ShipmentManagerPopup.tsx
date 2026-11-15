import { useEffect, useState, type JSX } from 'react';
import type Destination from '../models/destination';
import type Ship from '../models/ship';
import type Shipment from '../models/shipment';
import { addShipment, fetchShipment, updateShipment } from '../services/api';
import Dropdown from './Dropdown';
import DestinationManagerPopup from './DestinationManagerPopup';
import ShipManagerPopup from './ShipManagerPopup';
import useDestinations from '../contexts/useDestinations';
import useShips from '../contexts/useShips';

interface ShipmentManagerPopupProps {
	shipments: Shipment[];
	onClose: () => void;
	onAdd: () => void;
	onUpdate: (shipment: Shipment) => void;
	initialTab?: (typeof tabs)[number];
	initialShipmentToEdit?: Shipment | null;
}

const tabs = ['Lisää', 'Muokkaa'] as const;

function toDateTimeLocal(value: string | null): string {
	if (!value) return '';

	const date = new Date(value);
	const pad = (part: number) => String(part).padStart(2, '0');

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ShipmentManagerPopup({
	shipments,
	onClose,
	onAdd,
	onUpdate,
	initialTab = 'Lisää',
	initialShipmentToEdit = null,
}: ShipmentManagerPopupProps): JSX.Element {
	const { destinations, defaultDestination, destinationFetchError } = useDestinations();
	const { ships, shipFetchError } = useShips();

	const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(initialTab);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(destinationFetchError || shipFetchError);
	const [isDestinationManagerOpen, setIsDestinationManagerOpen] = useState(false);
	const [isShipManagerOpen, setIsShipManagerOpen] = useState(false);
	const [shipmentName, setShipmentName] = useState('');
	const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
	const [eta, setEta] = useState('');
	const [selectedDestinationOverride, setSelectedDestinationOverride] = useState<Destination | null>(null);
	const selectedDestination = selectedDestinationOverride ?? defaultDestination;

	const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(initialShipmentToEdit);
	const [editName, setEditName] = useState(initialShipmentToEdit?.shipment_name ?? '');
	const [editEta, setEditEta] = useState(() => toDateTimeLocal(initialShipmentToEdit?.eta ?? ''));
	const [editDestinationId, setEditDestinationId] = useState<number | null>(
		initialShipmentToEdit?.destination_id ?? null
	);
	const [editShipId, setEditShipId] = useState<number | null>(initialShipmentToEdit?.ship_id ?? null);
	const selectedEditDestination = destinations.find((destination) => destination.id === editDestinationId) ?? null;
	const selectedEditShip = ships.find((ship) => ship.id === editShipId) ?? null;

	useEffect(() => {
		const previousDocumentOverflow = document.documentElement.style.overflow;
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		document.documentElement.style.overflow = 'hidden';
		window.addEventListener('keydown', closeOnEscape);

		return () => {
			document.documentElement.style.overflow = previousDocumentOverflow;
			window.removeEventListener('keydown', closeOnEscape);
		};
	}, [onClose, onAdd]);

	const handleShipmentSelect = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
		if (activeTab === 'Lisää') return;

		const shipment = shipments.find((item) => item.id === Number(e.target.value));

		if (!shipment) return;

		setShipmentToEdit(shipment);
		setEditName(shipment.shipment_name);
		setEditEta(toDateTimeLocal(shipment.eta));
		setEditDestinationId(shipment.destination_id);
		setEditShipId(shipment.ship_id);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (activeTab === 'Lisää') {
			if (!selectedDestination) {
				setError('Valitse määränpää.');
				return;
			}

			if (!selectedShip) {
				setError('Valitse Laiva.');
				return;
			}

			setError('');
			setSubmitting(true);

			const newShipment = {
				shipment_name: shipmentName.trim(),
				ship_id: selectedShip.id,
				eta: eta ? new Date(eta).toISOString() : null,
				destination_id: selectedDestination.id,
			};

			try {
				await addShipment(newShipment);

				setShipmentName('');
				setEta('');
				onAdd();
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Yhteysvirhe';

				setError(message);
			} finally {
				setSubmitting(false);
			}
		} else {
			if (!editDestinationId) {
				setError('Valitse määränpää.');
				return;
			}

			if (!editShipId) {
				setError('Valitse laiva.');
				return;
			}

			if (shipmentToEdit === null) {
				setError('Valitse lähetys.');
				return;
			}

			setError('');
			setSubmitting(true);

			const newShipment = {
				shipment_name: editName.trim(),
				ship_id: editShipId,
				eta: editEta ? new Date(editEta).toISOString() : null,
				destination_id: editDestinationId,
			};

			if (
				shipmentToEdit.shipment_name === newShipment.shipment_name &&
				shipmentToEdit.ship_id === newShipment.ship_id &&
				shipmentToEdit.eta === newShipment.eta &&
				shipmentToEdit.destination_id === newShipment.destination_id
			) {
				setSubmitting(false);
				onClose();
				return;
			}

			try {
				await updateShipment(shipmentToEdit.id, newShipment);
				const updatedShipment = await fetchShipment(shipmentToEdit.id);
				onUpdate(updatedShipment);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Yhteysvirhe';

				setError(message);
			} finally {
				setSubmitting(false);
			}
		}
	};

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
						: { lat: 63.859577, lng: 23.03756 }
				}
			/>
		);
	} else if (isShipManagerOpen) {
		return (
			<ShipManagerPopup
				onClose={() => setIsShipManagerOpen(false)}
				selectedShip={selectedShip}
				setSelectedShip={setSelectedShip}
			/>
		);
	} else {
		const hasNoShipmentToEdit = activeTab === 'Muokkaa' && !shipmentToEdit;

		return (
			<div
				className='popup-backdrop popup-backdrop--compact'
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
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
						{activeTab === 'Lisää' ? (
							<h2 id='add-ship-title'>Lisää lähetys</h2>
						) : (
							<h2 id='add-ship-title'>Muokkaa lähetystä</h2>
						)}
						<button
							className='popup-dialog__close'
							onClick={onClose}
							type='button'
							aria-label='Sulje lisäysikkuna'
						>
							×
						</button>
					</header>

					<div className='manager-popup__tabs' role='group' aria-label='lähetyksen toiminnot'>
						{tabs.map((tab) => (
							<button
								className={`manager-popup__tab${activeTab === tab ? ' manager-popup__tab--active' : ''}`}
								key={tab}
								onClick={() => setActiveTab(tab)}
								type='button'
								aria-pressed={activeTab === tab}
							>
								<span>{tab}</span>
							</button>
						))}
					</div>

					<form className='popup-form' onSubmit={handleSubmit}>
						{activeTab === 'Muokkaa' && (
							<label className='popup-form__field'>
								<span>Valitse lähetys</span>
								<select
									className='manager-popup__select'
									name='selected_shipment'
									value={shipmentToEdit?.id ?? ''}
									onChange={handleShipmentSelect}
									required
								>
									<option value='' disabled>
										Valitse muokattava laiva
									</option>
									{shipments.map((option) => (
										<option
											key={option.id}
											value={option.id}
											className={`dropdown__option${shipmentToEdit?.id === option.id ? ' dropdown__option--selected' : ''}`}
										>
											{option.shipment_name}
										</option>
									))}
								</select>
							</label>
						)}

						<label className='popup-form__field'>
							<span>Lähetyksen nimi</span>
							<input
								autoFocus
								name='shipment_name'
								type='text'
								value={activeTab === 'Lisää' ? shipmentName : editName}
								onChange={(e) =>
									activeTab === 'Lisää'
										? setShipmentName(e.target.value)
										: setEditName(e.target.value)
								}
								placeholder='Esim. Maalit'
								disabled={hasNoShipmentToEdit}
								required
								maxLength={120}
							/>
						</label>

						<label className='popup-form__field'>
							<span>Arvioitu saapumisaika</span>
							<input
								name='eta'
								type='datetime-local'
								className='eta-input'
								value={activeTab === 'Lisää' ? eta : editEta}
								onChange={(e) =>
									activeTab === 'Lisää' ? setEta(e.target.value) : setEditEta(e.target.value)
								}
								disabled={hasNoShipmentToEdit}
								required
							/>
						</label>

						<div className='popup-form__field'>
							<span>Laiva</span>
							<Dropdown
								getOptionLabel={(s) => s?.ship_nickname ?? null}
								getMmsiLabel={(s) => s?.mmsi ?? null}
								label='Laiva'
								options={ships}
								selectedOption={activeTab === 'Lisää' ? selectedShip : selectedEditShip}
								onChange={(option) =>
									activeTab === 'Lisää' ? setSelectedShip(option) : setEditShipId(option.id)
								}
								onAdd={() => setIsShipManagerOpen(true)}
								dropdownDisabled={hasNoShipmentToEdit}
							/>
						</div>

						<div className='popup-form__field'>
							<span>Määränpää</span>
							<Dropdown
								getOptionLabel={(d) => d?.destination_name ?? null}
								label='Määränpää'
								options={destinations}
								selectedOption={
									activeTab === 'Lisää'
										? (selectedDestination ?? defaultDestination)
										: selectedEditDestination
								}
								onChange={(option) =>
									activeTab === 'Lisää'
										? setSelectedDestinationOverride(option)
										: setEditDestinationId(option.id)
								}
								onAdd={() => setIsDestinationManagerOpen(true)}
								dropdownDisabled={hasNoShipmentToEdit}
							/>
						</div>

						{error && <p className='error-message'>{error}</p>}

						<footer className='popup-form__actions manager-popup__actions'>
							<div className='manager-popup__primary-actions'>
								<button className='popup-form__cancel' onClick={onClose} type='button'>
									Peruuta
								</button>
								<button className='popup-form__submit' type='submit' disabled={hasNoShipmentToEdit}>
									{activeTab === 'Lisää'
										? submitting
											? 'Lisätään...'
											: 'Lisää lähetys'
										: submitting
											? 'Tallennetaan...'
											: 'Tallenna muutokset'}
								</button>
							</div>
						</footer>
					</form>
				</section>
			</div>
		);
	}
}
