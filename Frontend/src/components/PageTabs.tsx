import { NavLink } from 'react-router-dom';
import './styles/PageTabs.css';

const tabs = [
	{ label: 'Lähetykset', to: '/dashboard' },
	{ label: 'Laivat', to: '/ships' },
	{ label: 'Määränpäät', to: '/destinations' },
] as const;

export default function PageTabs() {
	return (
		<nav className='page-tabs' aria-label='Seurannan sivut'>
			{tabs.map((tab) => (
				<NavLink
					className={({ isActive }) => `page-tabs__link${isActive ? ' page-tabs__link--active' : ''}`}
					end
					key={tab.to}
					to={tab.to}
				>
					{tab.label}
				</NavLink>
			))}
		</nav>
	);
}
