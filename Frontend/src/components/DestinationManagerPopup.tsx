import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type Destination from '../models/destination';
import LocationPicker from './LocationPicker';
import ToastMessage from './ToastMessage';
import { addDestination, updateDestination, deleteDestination } from '../services/api';
import useDestinations from '../contexts/useDestinations';
import './styles/ManagerPopup.css';
import './styles/DestinationManagerPopup.css';

interface DestinationManagerPopupProps {
	onClose: () => void;
	selectedDestination?: Destination | null;
	setSelectedDestination?: Dispatch<SetStateAction<Destination | null>>;
	initialCoordinates: { lat: number; lng: number };
	initialTab?: (typeof tabs)[number];
	initialDestinationToEdit?: Destination | null;
	setAsDefaultOnAdd?: boolean;
}

const tabs = ['Lisää', 'Muokkaa'] as const;

export default function DestinationManagerPopup({
	onClose,
	selectedDestination,
	setSelectedDestination,
	initialCoordinates,
	initialTab = 'Lisää',
	initialDestinationToEdit = null,
	setAsDefaultOnAdd = true,
}: DestinationManagerPopupProps) {
	const { destinations, populateDestinations, setDefaultDestination } = useDestinations();

	const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(initialTab);
	const [destinationToEdit, setDestinationToEdit] = useState<Destination | null>(initialDestinationToEdit);
	const [destinationToEditName, setDestinationToEditName] = useState(
		initialDestinationToEdit?.destination_name ?? ''
	);
	const [destinationName, setDestinationName] = useState('');
	const [coordinates, setCoordinates] = useState(initialCoordinates);
	const [mapCenter, setMapCenter] = useState(initialCoordinates);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const handleSelectLocation = (lat: number, lng: number) => {
		setCoordinates({ lat, lng });
	};

	const handleDestinationSelect = (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
		if (activeTab === 'Lisää') return;

		const destination = destinations.find((item) => item.id === Number(e.target.value));

		if (!destination) return;

		setDestinationToEdit(destination);
		setDestinationToEditName(destination.destination_name);
		const newCoordinates = {
			lat: destination.lat,
			lng: destination.lon,
		};
		setCoordinates(newCoordinates);
		setMapCenter(newCoordinates);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setSubmitting(true);
		setSuccessMessage('');

		const newDestination = {
			destination_name: '',
			lon: coordinates.lng,
			lat: coordinates.lat,
		};

		if (activeTab === 'Lisää') {
			newDestination.destination_name = destinationName.trim();
			try {
				const [addedDestination] = await addDestination(newDestination);
				setSelectedDestination?.(addedDestination);
				if (setAsDefaultOnAdd) await setDefaultDestination(addedDestination.id);
				await populateDestinations();
				handleOnSuccess();
				setSuccessMessage('Määränpää lisätty.');
				if (setSelectedDestination) onClose();
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Yhteysvirhe';

				setError(message);
			} finally {
				setSubmitting(false);
			}
		} else {
			newDestination.destination_name = destinationToEditName.trim();
			if (destinationToEdit === null) {
				setSubmitting(false);
				return;
			}

			if (
				destinationToEdit.destination_name === newDestination.destination_name &&
				destinationToEdit.lat === coordinates.lat &&
				destinationToEdit.lon === coordinates.lng
			) {
				setSubmitting(false);
				onClose();
				return;
			}

			try {
				const [updatedDestination] = await updateDestination(destinationToEdit.id, newDestination);

				if (setSelectedDestination && selectedDestination?.id === destinationToEdit.id) {
					setSelectedDestination(updatedDestination);
				}
				await populateDestinations();
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
		if (!destinationToEdit) {
			setError('Valitse poistettava määränpää!');
			return;
		}

		setError('');
		setSuccessMessage('');
		if (
			!window.confirm(
				`Haluatko varmasti poistaa määränpään '${destinationToEdit?.destination_name}'? Myös kaikki tätä määränpäätä käyttävät lähetykset poistetaan.`
			)
		) {
			return;
		}
		setDeleting(true);

		try {
			await deleteDestination(destinationToEdit.id);
			await populateDestinations();
			handleOnSuccess();
			setSuccessMessage('Määränpää poistettu.');
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Yhteysvirhe';

			setError(message);
		} finally {
			setDeleting(false);
		}
	};

	const handleSetDefault = async () => {
		if (!destinationToEdit) {
			setError('Valitse määränpää.');
			return;
		}

		setSuccessMessage('');

		try {
			await setDefaultDestination(destinationToEdit.id);
			handleOnSuccess();
			setSuccessMessage('Oletus määränpää asetettu.');
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Yhteysvirhe';

			setError(message);
		}
	};

	const handleOnSuccess = () => {
		setDestinationName('');
		setDestinationToEditName('');
		setDestinationToEdit(null);
		setCoordinates(initialCoordinates);
		setMapCenter(initialCoordinates);
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
				className='popup-dialog'
				role='dialog'
				aria-modal='true'
				aria-labelledby='add-destination-title'
			>
				<header className='popup-dialog__header'>
					{activeTab === 'Lisää' ? (
						<h2 id='add-destination-title'>Lisää määränpää</h2>
					) : (
						<h2 id='add-destination-title'>Muokkaa määränpäätä</h2>
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

				<div className='manager-popup__tabs' role='group' aria-label='Määränpään toiminnot'>
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
								<span>Valitse määränpää</span>
								<select
									className='manager-popup__select'
									name='selected_destination'
									value={destinationToEdit?.id ?? ''}
									onChange={handleDestinationSelect}
									required
								>
									<option value='' disabled>
										Valitse muokattava määränpää
									</option>
									{destinations.map((option) => (
										<option
											key={option.id}
											value={option.id}
											className={`dropdown__option${destinationToEdit?.id === option.id ? ' dropdown__option--selected' : ''}`}
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
								onChange={
									activeTab === 'Lisää'
										? (e) => setDestinationName(e.target.value)
										: (e) => setDestinationToEditName(e.target.value)
								}
								placeholder='Esim. Kokkolan kantasatama'
								required
								maxLength={120}
							/>
						</label>
					</div>

					<LocationPicker
						center={mapCenter}
						coordinates={coordinates}
						onSelect={handleSelectLocation}
					/>

					{error && <p className='error-message'>{error}</p>}

					<footer className='popup-form__actions manager-popup__actions'>
						{activeTab === 'Muokkaa' && (
							<div className='manager-popup-secondary-actions'>
								<button
									type='button'
									className='delete-button'
									onClick={handleDelete}
									disabled={destinationToEdit === null}
								>
									{deleting ? 'Poistetaan' : 'Poista'}
								</button>

								<button
									className='destination-manager__default-button'
									type='button'
									disabled={destinationToEdit === null}
									onClick={handleSetDefault}
								>
									Aseta oletukseksi
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
								disabled={destinationToEdit === null && activeTab === 'Muokkaa'}
							>
								{activeTab === 'Lisää'
									? submitting
										? 'Lisätään...'
										: 'Lisää määränpää'
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
