import { NavLink } from 'react-router-dom'
import ProfileButton from './ProfileButton'
import './styles/AppHeader.css'

export default function AppHeader() {
    return (
        <header className='app-header'>
            <div className='app-header__inner'>
                <NavLink aria-label='Shipment Tracking - dashboard' className='app-header__brand' to='/dashboard'>
                    Lähetysten seuranta
                </NavLink>

                <div className='app-header__profile'>
                    <ProfileButton />
                </div>
            </div>
        </header>
    )
}