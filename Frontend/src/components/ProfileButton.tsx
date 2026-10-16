import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../contexts/useAuth'
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
                <svg aria-hidden='true' className='profile-menu__trigger-chevron' viewBox='0 0 12 12'>
                    <path d='m2 4.5 4 4 4-4' />
                </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 760 960" width="24px" fill="#000000">
                            <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
                        </svg>
                        <span>Asetukset</span>
                    </button>

                    <button className='profile-menu__item profile-menu__item--danger' onClick={handleLogout} role='menuitem' type='button'>
                        <svg aria-hidden='true' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M13 4h7v16h-7' />
                            <path d='M3 12h11' />
                            <path d='m10 8 4 4-4 4' />
                        </svg>
                        <span>Kirjaudu ulos</span>
                    </button>
                </div>
            )}
        </div>
    )
}
