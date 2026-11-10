import { useState } from 'react';
import DestinationManagerPopup from '../components/DestinationManagerPopup';
import PageTabs from '../components/PageTabs';
import useDestinations from '../contexts/useDestinations';
import type Destination from '../models/destination';
import './styles/ManagerPage.css';

const defaultCoordinates = { lat: 63.859577, lng: 23.03756 };

export default function DestinationsPage() {
	const { destinations, defaultDestination, destinationFetchError } = useDestinations();
	const [isManagerOpen, setIsManagerOpen] = useState(false);
	const [destinationToEdit, setDestinationToEdit] = useState<Destination | null>(null);

	const openAddForm = () => {
		setDestinationToEdit(null);
		setIsManagerOpen(true);
	};

	const openEditForm = (destination: Destination) => {
		setDestinationToEdit(destination);
		setIsManagerOpen(true);
	};

	const closeManager = () => {
		setIsManagerOpen(false);
		setDestinationToEdit(null);
	};

	return (
		<main className='dashboard-page'>
			<div className='dashboard-main'>
				<PageTabs />
				<header className='dashboard-heading'>
					<h1>Omat määränpäät</h1>
					<button className='add-shipment-button' onClick={openAddForm} type='button'>
						Lisää määränpää
					</button>
				</header>

				<section className='manager-list' aria-label='Määränpäät'>
					{destinationFetchError && (
						<p className='error-message' role='alert'>
							{destinationFetchError}
						</p>
					)}

					{destinations.map((destination) => (
						<button
							className='manager-list__item'
							key={destination.id}
							onClick={() => openEditForm(destination)}
							type='button'
							aria-label={`Muokkaa määränpäätä ${destination.destination_name}`}
						>
							<div className='manager-list__details'>
								<h2>{destination.destination_name}</h2>
							</div>
							{defaultDestination?.id === destination.id && (
								<span className='manager-list__badge manager-list__badge--default'>Oletus</span>
							)}

							<span className='shipment-row__open' aria-hidden='true'>
								↗
							</span>
						</button>
					))}

					{!destinationFetchError && destinations.length === 0 && (
						<p className='manager-list__empty'>
							Et ole vielä lisännyt määränpäitä. Lisää ensimmäinen määränpää aloittaaksesi.
						</p>
					)}
				</section>
			</div>

			{isManagerOpen && (
				<DestinationManagerPopup
					onClose={closeManager}
					initialCoordinates={
						destinationToEdit
							? { lat: destinationToEdit.lat, lng: destinationToEdit.lon }
							: defaultDestination
								? { lat: defaultDestination.lat, lng: defaultDestination.lon }
								: defaultCoordinates
					}
					initialTab={destinationToEdit ? 'Muokkaa' : 'Lisää'}
					initialDestinationToEdit={destinationToEdit}
					setAsDefaultOnAdd={false}
				/>
			)}
		</main>
	);
}
