import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateSettings, changePassword, deleteAccount } from '../services/auth'
import DestinationDropdown from '../components/DestinationDropdown'
import DestinationManagerPopup from '../components/DestinationManagerPopup'
import ToastMessage from '../components/ToastMessage'
import Icon from '../constants/Icons'
import { useAuth } from '../contexts/AuthContext'
import { useDestinations } from '../contexts/DestinationContext'
import './styles/ProfilePage.css'

export default function ProfilePage() {
    const { user, refreshUser, logout } = useAuth()
    const { destinations, defaultDestination, destinationFetchError } = useDestinations()
    const navigate = useNavigate()

    const [username, setUsername] = useState(user?.username)
    const [email, setEmail] = useState(user?.email)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [visiblePasswordFields, setVisiblePasswordFields] = useState({ old: false, new: false, confirm: false })
    const [selectedDestination, setSelectedDestination] = useState(defaultDestination)
    const [isDestinationManagerOpen, setIsDestinationManagerOpen] = useState(false)
    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(destinationFetchError)
    const [resetPwError, setResetPwError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const handleUpdateSettings = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')

        if (username === user?.username
            && email === user?.email
            && selectedDestination?.id === user?.default_destination_id) {
            return
        }

        setLoading(true)

        const changedSettings = {
            username: username ? username.trim() : undefined,
            email: email ? email.trim() : undefined,
            default_destination_id: selectedDestination?.id ?? user?.default_destination_id
        }

        try {
            await updateSettings(changedSettings)
            await refreshUser()
            setSuccessMessage('Profiili päivitetty.')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setResetPwError('')
        setSuccessMessage('')

        if (newPassword !== confirmPassword) {
            setResetPwError('Salasanat eivät täsmää!')
            return
        }

        setLoading(true)

        try {
            await changePassword(oldPassword, newPassword)

            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setIsPasswordSectionOpen(false)
            setVisiblePasswordFields({ old: false, new: false, confirm: false })
            setSuccessMessage('Salasana vaihdettu.')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setResetPwError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleAccountDeletion = async () => {
        if (!window.confirm('Haluatko varmasti poistaa käyttäjäsi? Käyttäjätilisi ja kaikki lisäämäsi lähetykset poistetaan pysyvästi.')) return
        setError('')
        setLoading(true)

        try {
            await deleteAccount()
            logout()
            navigate('/')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {isDestinationManagerOpen && (
                <DestinationManagerPopup
                    onClose={() => setIsDestinationManagerOpen(false)}
                    selectedDestination={selectedDestination}
                    setSelectedDestination={setSelectedDestination}
                    initialCoordinates={
                        // Opens the location of the currently selected destination by default
                        selectedDestination
                            ? { lat: Number(selectedDestination.lat), lng: Number(selectedDestination.lon) }
                            : { lat: 63.859577, lng: 23.037560 }
                    }
                />
            )}
            <ToastMessage message={successMessage} onAfterToast={() => setSuccessMessage('')} />
            <main className='profile-page'>
                <header className='profile-page__heading'>
                    <h1>Profiili</h1>
                </header>

                <div className='profile-page__sections'>
                    <section className='profile-card' aria-labelledby='profile-settings-title'>
                        <form className='profile-form profile-settings-form' onSubmit={handleUpdateSettings}>
                            <label className='popup-form__field'>
                                <span>Käyttäjänimi</span>
                                <input
                                    className='popup-form__field'
                                    name='username'
                                    autoComplete='off'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </label>

                            <label className='popup-form__field'>
                                <span>Sähköposti</span>
                                <input
                                    className='popup-form__field'
                                    name='email'
                                    autoComplete='off'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>

                            <div className='popup-form__field profile-settings-form__destination'>
                                <span>Oletus määränpää</span>
                                <DestinationDropdown
                                    options={destinations}
                                    selectedOption={selectedDestination ? selectedDestination : defaultDestination}
                                    onChange={(value) => setSelectedDestination(value)}
                                    onOpenManager={() => setIsDestinationManagerOpen(true)}
                                />
                            </div>

                            {error && <p className='error-message' role='alert'>{error}</p>}

                            <footer className='popup-form__actions'>
                                <button className='popup-form__submit' type='submit' disabled={loading}>
                                    Tallenna
                                </button>
                            </footer>
                        </form>
                    </section>

                    <section className='profile-card' aria-labelledby='profile-security-settings'>
                        <div className='profile-password'>
                            <button
                                className='profile-toggle-button'
                                type='button'
                                aria-expanded={isPasswordSectionOpen}
                                aria-controls='profile-password-form'
                                onClick={() => setIsPasswordSectionOpen((open) => !open)}
                            >
                                <svg
                                    className='profile-toggle-button__chevron'
                                    aria-hidden='true'
                                    viewBox='0 0 20 20'
                                    fill='none'
                                >
                                    <path d='m5 7.5 5 5 5-5' />
                                </svg>
                                Vaihda salasana
                            </button>

                            <form
                                id='profile-password-form'
                                className='profile-form profile-password-form'
                                hidden={!isPasswordSectionOpen}
                                onSubmit={handlePasswordChange}
                            >
                                <label className='profile-field'>
                                    <span>Vanha salasana</span>
                                    <span className='profile-password-input'>
                                        <input
                                            id='old-password'
                                            className='profile-input'
                                            name='old-password'
                                            type={visiblePasswordFields.old ? 'text' : 'password'}
                                            placeholder='Salasanasi'
                                            value={oldPassword}
                                            required
                                            minLength={8}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                        />
                                        <button
                                            className='password-visibility-toggle'
                                            type='button'
                                            aria-label={visiblePasswordFields.old ? 'Piilota vanha salasana' : 'Näytä vanha salasana'}
                                            onClick={() => setVisiblePasswordFields((visible) => ({ ...visible, old: !visible.old }))}
                                        >
                                            <Icon icon={visiblePasswordFields.old ? 'visibilityOff' : 'visibility'} size={20} color='#6b7782' />
                                        </button>
                                    </span>
                                </label>


                                <label className='profile-field'>
                                    <span>Uusi salasana</span>
                                    <span className='profile-password-input'>
                                        <input
                                            id='new-password'
                                            className='profile-input'
                                            name='new-password'
                                            type={visiblePasswordFields.new ? 'text' : 'password'}
                                            placeholder='Salasanasi'
                                            value={newPassword}
                                            required
                                            minLength={8}
                                            pattern='(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}'
                                            title='Vähintään 8 merkkiä: iso- ja pienikirjain, numero sekä erikoismerkki.'
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            className='password-visibility-toggle'
                                            type='button'
                                            aria-label={visiblePasswordFields.new ? 'Piilota uuusi salasana' : 'Näytä uusi salasana'}
                                            onClick={() => setVisiblePasswordFields((visible) => ({ ...visible, new: !visible.new }))}
                                        >
                                            <Icon icon={visiblePasswordFields.new ? 'visibilityOff' : 'visibility'} size={20} color='#6b7782' />
                                        </button>
                                    </span>
                                </label>

                                <label className='profile-field profile-password-form__confirm'>
                                    <span>Varmista salasana</span>
                                    <span className='profile-password-input'>
                                        <input
                                            id='confirm-password'
                                            className='profile-input'
                                            name='confirm-password'
                                            type={visiblePasswordFields.confirm ? 'text' : 'password'}
                                            placeholder='Toista salasanasi'
                                            value={confirmPassword}
                                            required
                                            minLength={5}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            className='password-visibility-toggle'
                                            type='button'
                                            aria-label={visiblePasswordFields.confirm ? 'Piilota salasanan vahvistus' : 'Näytä salasanan vahvistus'}
                                            onClick={() => setVisiblePasswordFields((visible) => ({ ...visible, confirm: !visible.confirm }))}
                                        >
                                            <Icon icon={visiblePasswordFields.confirm ? 'visibilityOff' : 'visibility'} size={20} color='#6b7782' />
                                        </button>
                                    </span>
                                </label>

                                {resetPwError && <p className='error-message' role='alert'>{resetPwError}</p>}

                                <footer className='popup-form__actions'>
                                    <button className='popup-form__submit' type='submit' disabled={loading}>
                                        Tallenna
                                    </button>
                                </footer>
                            </form>
                        </div>
                        <button className='delete-button' onClick={handleAccountDeletion} type='button'>
                            Poista käyttäjä
                        </button>
                    </section>
                </div>
            </main>
        </>
    )
}