import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchLogin } from '../services/auth'
import './LoginPage.css'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        setSubmitting(true)

        try {
            await fetchLogin({ username, password })
            //navigate('/dashboard')
            setUsername('')
            setPassword('')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Connection error'

            setError(message)
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
                        name='username'
                        type='text'
                        placeholder='Käyttäjänimesi'
                        autoComplete='username'
                        value={username}
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <div className='password-label'>
                        <label htmlFor='password'>Salasana</label>
                        <button type='button' className='login-text-button'>Unohditko salasanasi?</button>
                    </div>
                    <input
                        id='password'
                        name='password'
                        type='password'
                        placeholder='Salasanasi'
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button type='submit' className='login-button' disabled={submitting}>
                        {submitting ? 'Kirjaudutaan sisään...' : 'Kirjaudu sisään'}
                        <span aria-hidden='true'>-&gt;</span>
                    </button>
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