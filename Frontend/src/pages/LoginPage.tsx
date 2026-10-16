import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../contexts/useAuth'
import Icon from '../constants/Icons'
import './styles/LoginPage.css'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [visiblePasswordField, setVisiblePasswordField] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        setSubmitting(true)

        try {
            await login({ username, password })
            setUsername('')
            setPassword('')
            await navigate('/dashboard')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Connection error'
            setError(message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className='login-page'>
            <div className='login-form-wrap'>
                <div className='login-form-heading'>
                    <p className='welcome-text welcome-text--dark'>Tervetuloa</p>
                    <h2>Kirjaudu sisään</h2>
                </div>

                <form className='login-form' onSubmit={handleSubmit}>
                    <label htmlFor='username'>Käyttäjänimi</label>
                    <input
                        id='username'
                        className='login-input'
                        name='username'
                        type='text'
                        placeholder='Käyttäjänimesi'
                        autoComplete='username'
                        value={username}
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label htmlFor='password'>Salasana</label>
                    <span className='login-password-input'>
                        <input
                            id='password'
                            className='login-input'
                            name='password'
                            type={visiblePasswordField ? 'text' : 'password'}
                            placeholder='Salasanasi'
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className='password-visibility-toggle'
                            type='button'
                            aria-label={visiblePasswordField ? 'Piilota salasana' : 'Näytä salasana'}
                            onClick={() => setVisiblePasswordField((visible) => !visible)}
                        >
                            <Icon icon={visiblePasswordField ? 'visibilityOff' : 'visibility'} size={20} color='#6b7782' />
                        </button>
                    </span>
                    <button type='submit' className='login-button' disabled={submitting}>
                        {submitting ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
                        <span aria-hidden='true'>-&gt;</span>
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
                <p className='login-form-footer'>
                    Eikö sinulla ole tiliä? <button
                        type='button'
                        className='login-text-button'
                        onClick={() => navigate('/register')}
                    >Rekisteröidy</button>
                </p>
            </div>
        </main>
    )
}