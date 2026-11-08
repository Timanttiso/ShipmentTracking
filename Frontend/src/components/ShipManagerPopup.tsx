import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type Ship from '../models/ship';
import ToastMessage from './ToastMessage';
import { addUserShip, updateShip, deleteShip } from '../services/api';
import useShips from '../contexts/useShips';
import './styles/ManagerPopup.css';
import './styles/ShipsManagerPopup.css';

interface ShipManagerPopupProps {
	onClose: () => void;
	selectedShip?: Ship | null;
	setSelectedShip?: Dispatch<SetStateAction<Ship | null>>;
	initialTab?: (typeof tabs)[number];
	initialShipToEdit?: Ship | null;
}

const tabs = ['Lisää', 'Muokkaa'] as const;

export default function ShipManagerPopup({
	onClose,
	selectedShip,
	setSelectedShip,
	initialTab = 'Lisää',
	initialShipToEdit = null,
}: ShipManagerPopupProps) {
	const { ships, populateShips } = useShips();

	const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(initialTab);
	const [successMessage, setSuccessMessage] = useState('');
	const [shipToEdit, setShipToEdit] = useState<Ship | null>(initialShipToEdit);
	const [shipToEditName, setShipToEditName] = useState(initialShipToEdit?.ship_nickname ?? '');
	const [shipToEditMmsi, setShipToEditMmsi] = useState(initialShipToEdit?.mmsi ?? '');
	const [shipName, setShipName] = useState('');
	const [shipMmsi, setShipMmsi] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState('');

	const handleShipSelect = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
		if (activeTab === 'Lisää') return;

		const ship = ships.find((item) => item.id === Number(e.target.value));

		if (!ship) return;

		setShipToEdit(ship);
		setShipToEditName(ship.ship_nickname);
		setShipToEditMmsi(ship.mmsi);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setSubmitting(true);
		setSuccessMessage('');

		if (activeTab === 'Lisää') {
			const newShip = { ship_nickname: shipName.trim(), mmsi: shipMmsi.trim() };
			try {
				const [addedShip] = await addUserShip(newShip); // <-- returns different format than the ships from /api/ships
				//setSelectedShip?.(addedShip);
				const newShips = await populateShips();
				const formattedShip = newShips.find((s) => s.id === addedShip.ship_id) ?? null;
				setSelectedShip?.(formattedShip);
				handleOnSuccess();
				setSuccessMessage('Laiva lisätty.');
				if (setSelectedShip) onClose();
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Yhteysvirhe';

				setError(message);
			} finally {
				setSubmitting(false);
			}
		} else {
			const newShip = { ship_nickname: shipToEditName.trim(), mmsi: shipToEditMmsi.trim() };
			if (shipToEdit === null) {
				setSubmitting(false);
				return;
			}

			if (shipToEdit.ship_nickname === newShip.ship_nickname && shipToEdit.mmsi === newShip.mmsi) {
				setSubmitting(false);
				onClose();
				return;
			}

			try {
				const [updatedShip] = await updateShip(shipToEdit.id, newShip);

				if (setSelectedShip && selectedShip?.id === shipToEdit.id) setSelectedShip(updatedShip);

				await populateShips();
				handleOnSuccess();
				setSuccessMessage('Määränpää muokattu.');
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Yhteysvirhe';

				setError(message);
			} finally {
				setSubmitting(false);
			}
		}
	};

	const handleDelete = async () => {
		if (!shipToEdit) {
			setError('Valitse laiva, jota et enää halua seurata!');
			return;
		}

		setError('');
		setSuccessMessage('');

		if (!window.confirm(`Haluatko varmasti poistaa laivan '${shipToEdit?.ship_nickname}'?`)) return;

		setDeleting(true);

		try {
			await deleteShip(shipToEdit.id);
			await populateShips();
			handleOnSuccess();
			setSuccessMessage('Laiva poistettu.');
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Yhteysvirhe';

			setError(message);
		} finally {
			setDeleting(false);
		}
	};

	const handleOnSuccess = () => {
		setShipName('');
		setShipMmsi('');
		setShipToEditName('');
		setShipToEditMmsi('');
		setShipToEdit(null);
	};

	return (
		<div
			className='popup-backdrop popup-backdrop--compact'
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			role='presentation'
		>
			<ToastMessage message={successMessage} onAfterToast={() => setSuccessMessage('')} />
			<section
				className='popup-dialog manager-popup__dialog manager-popup__dialog--ship'
				role='dialog'
				aria-modal='true'
				aria-labelledby='add-ship-title'
			>
				<header className='popup-dialog__header'>
					{activeTab === 'Lisää' ? (
						<h2 id='add-ship-title'>Lisää laiva</h2>
					) : (
						<h2 id='add-ship-title'>Muokkaa laivaa</h2>
					)}
					<button
						className='popup-dialog__close'
						onClick={onClose}
						type='button'
						aria-label='Sulje ikkuna'
					>
						×
					</button>
				</header>

				<div className='manager-popup__tabs' role='group' aria-label='laivan toiminnot'>
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

				<form onSubmit={handleSubmit}>
					<div className='manager-popup-inputs'>
						{activeTab === 'Muokkaa' && (
							<label className='popup-form__field'>
								<span>Valitse laiva</span>
								<select
									className='manager-popup__select'
									name='selected_destination'
									value={shipToEdit?.id ?? ''}
									onChange={handleShipSelect}
									required
								>
									<option value='' disabled>
										Valitse muokattava laiva
									</option>
									{ships.map((option) => (
										<option
											key={option.id}
											value={option.id}
											className={`dropdown__option${shipToEdit?.id === option.id ? ' dropdown__option--selected' : ''}`}
										>
											{option.ship_nickname}
										</option>
									))}
								</select>
							</label>
						)}

						<label className='popup-form__field'>
							<span>Nimeä Laiva</span>
							<input
								autoFocus
								name='ship_nickname'
								type='text'
								value={activeTab === 'Lisää' ? shipName : shipToEditName}
								onChange={
									activeTab === 'Lisää'
										? (e) => setShipName(e.target.value)
										: (e) => setShipToEditName(e.target.value)
								}
								placeholder='Esim. Lentävä Hollantilainen'
								required
								maxLength={100}
							/>
						</label>

						<label className='popup-form__field'>
							<span>Laivan MMSI</span>
							<input
								autoFocus
								name='ship_mmsi'
								type='text'
								inputMode='numeric'
								pattern='[0-9]*'
								title='9 numeron numerosarja.'
								value={activeTab === 'Lisää' ? shipMmsi : shipToEditMmsi}
								onChange={
									activeTab === 'Lisää'
										? (e) => setShipMmsi(e.target.value)
										: (e) => setShipToEditMmsi(e.target.value)
								}
								placeholder='Esim. 123456789'
								required
								minLength={9}
								maxLength={9}
							/>
						</label>
					</div>

					{error && <p className='error-message'>{error}</p>}

					<footer className='popup-form__actions manager-popup__actions'>
						{activeTab === 'Muokkaa' && (
							<div className='manager-popup-secondary-actions'>
								<button
									type='button'
									className='delete-button'
									onClick={handleDelete}
									disabled={shipToEdit === null}
								>
									{deleting ? 'Poistetaan' : 'Poista'}
								</button>
							</div>
						)}

						<div className='manager-popup__primary-actions'>
							<button className='popup-form__cancel' onClick={onClose} type='button'>
								Peruuta
							</button>

							<button
								className='popup-form__submit'
								type='submit'
								disabled={shipToEdit === null && activeTab === 'Muokkaa'}
							>
								{activeTab === 'Lisää'
									? submitting
										? 'Lisätään...'
										: 'Lisää laiva'
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
