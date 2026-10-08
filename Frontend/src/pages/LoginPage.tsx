import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
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
            navigate('/dashboard')
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

                    <div className='password-field'>
                        <label htmlFor='password'>Salasana</label>
                        <input
                            id='password'
                            className='login-input'
                            name='password'
                            type='password'
                            placeholder='Salasanasi'
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type='submit' className='login-button' disabled={submitting}>
                            {submitting ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
                            <span aria-hidden='true'>-&gt;</span>
                        </button>
                        {error && <p className="error-message">{error}</p>}
                    </div>
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