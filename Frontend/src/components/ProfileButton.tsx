import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../contexts/useAuth'
import Icon from '../constants/Icons'
import './styles/ProfileButton.css'

export default function ProfileButton() {
    const [isOpen, setIsOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const initial = user?.username?.charAt(0).toUpperCase() ?? 'U'

    useEffect(() => {
        if (!isOpen) return

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false)
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            setIsOpen(false)
            triggerRef.current?.focus()
        }

        document.addEventListener('pointerdown', closeOnOutsideClick)
        document.addEventListener('keydown', closeOnEscape)

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [isOpen])

    const handleSettings = async () => {
        setIsOpen(false)
        await navigate('/profile')
    }

    const handleLogout = async () => {
        setIsOpen(false)
        logout()
        await navigate('/')
    }

    return (
        <div className='profile-menu' ref={dropdownRef}>
            <button
                aria-expanded={isOpen}
                aria-haspopup='menu'
                aria-label='Open profile menu'
                className='profile-menu__trigger'
                onClick={() => setIsOpen((open) => !open)}
                ref={triggerRef}
                type='button'
            >
                <span aria-hidden='true' className='profile-menu__avatar'>{initial}</span>
                <Icon icon='chevron' size={20} color='none' viewbox='0 0 20 20' className='button-chevron'/>
            </button>

            {isOpen && (
                <div className='profile-menu__panel' role='menu'>
                    <div aria-label='Account' className='profile-menu__identity' role='group'>
                        <span className='profile-menu__user-details'>
                            <span className='profile-menu__username'>{user?.username ?? 'User'}</span>
                            {user?.email && <span className='profile-menu__email'>{user.email}</span>}
                        </span>
                    </div>

                    <div className='profile-menu__divider' role='separator' />

                    <button className='profile-menu__item' onClick={handleSettings} role='menuitem' type='button'>
                        <Icon icon='settings' size={20} color='#6b7782' viewbox='0 -960 760 960' />
                        <span>Asetukset</span>
                    </button>

                    <button className='profile-menu__item profile-menu__item--danger' onClick={handleLogout} role='menuitem' type='button'>
                        <Icon icon='exit' size={20} color='none' viewbox='0 0 24 24' className='logout-button-icon' />
                        <span>Kirjaudu ulos</span>
                    </button>
                </div>
            )}
        </div>
    )
}
