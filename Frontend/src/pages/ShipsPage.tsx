import { useState } from 'react';
import PageTabs from '../components/PageTabs';
import useShips from '../contexts/useShips';
import type Ship from '../models/ship';
import ShipManagerPopup from '../components/ShipManagerPopup';
import './styles/ManagerPage.css';

export default function ShipsPage() {
	const { ships, shipFetchError } = useShips()
	const [isManagerOpen, setIsManagerOpen] = useState(false);
	const [shipToEdit, setShipToEdit] = useState<Ship | null>(null);

	const openAddForm = () => {
		setShipToEdit(null);
		setIsManagerOpen(true);
	};

	const openEditForm = (ship: Ship) => {
		setShipToEdit(ship);
		setIsManagerOpen(true);
	};

	const closeManager = () => {
		setIsManagerOpen(false);
		setShipToEdit(null);
	};

	return (
		<main className='dashboard-page'>
			<div className='dashboard-main'>
				<PageTabs />
				<header className='dashboard-heading'>
					<h1>Omat laivat</h1>
					<button className='add-shipment-button' onClick={openAddForm} type='button'>
						Lisää laiva
					</button>
				</header>

				<section className='manager-list' aria-label='Laivat'>
					{shipFetchError && (
						<p className='error-message' role='alert'>
							{shipFetchError}
						</p>
					)}

					{ships.map((ship) => (
						<button
							className='manager-list__item'
							key={ship.id}
							onClick={() => openEditForm(ship)}
							type='button'
							aria-label={`Muokkaa laivaa ${ship.ship_nickname}`}
						>
							<h2 className='manager-list__details'>{ship.ship_nickname}</h2>
							<span className='shipment-row__open' aria-hidden='true'>
								↗
							</span>
						</button>
					))}

					{!shipFetchError && ships.length === 0 && (
						<p className='manager-list__empty'>
							Et ole vielä lisännyt laivoja. Lisää ensimmäinen laiva aloittaaksesi.
						</p>
					)}
				</section>
			</div>

			{isManagerOpen && (
				<ShipManagerPopup
					onClose={closeManager}
					initialTab={shipToEdit ? 'Muokkaa' : 'Lisää'}
					initialShipToEdit={shipToEdit}
				/>
			)}
		</main>
	);
}
