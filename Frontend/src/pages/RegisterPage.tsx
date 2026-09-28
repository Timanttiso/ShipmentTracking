import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRegister } from '../services/auth'
import './LoginPage.css'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Salasanat eivät täsmää!')
            return
        }

        setSubmitting(true)

        try {
            await fetchRegister({ username, password })
            //navigate('/dashboard')
            setUsername('')
            setPassword('')
            setConfirmPassword('')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Yhteysvirhe'

            setError(message)
            setSubmitting(false)
        }
    }

    return (
        <main className='login-page'>
            <div className='login-form-wrap'>
                <div className='login-form-heading'>
                    <p className='welcome-text welcome-text--dark'>Tervetuloa</p>
                    <h2>Luo uusi käyttäjätili</h2>
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
                        minLength={5}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label htmlFor='password'>Luo salasana</label>
                    <input
                        id='password'
                        name='password'
                        type='password'
                        placeholder='Salasanasi'
                        value={password}
                        required
                        minLength={5}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label htmlFor='confirm-password'>Varmista salasana</label>
                    <input
                        id='confirm-password'
                        name='confirm-password'
                        type='password'
                        placeholder='Toista salasanasi'
                        value={confirmPassword}
                        required
                        minLength={5}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button type='submit' className='login-button' disabled={submitting}>
                        {submitting ? 'Luodaan käyttäjätiliä...' : 'Luo käyttäjätili'}
                        <span aria-hidden='true'>-&gt;</span>
                    </button>
                </form>
                <p className='login-form-footer'>
                    Onko sinulla jo tili? <button
                        type='button'
                        className='login-text-button'
                        onClick={() => navigate('/')}
                    >Kirjaudu</button>
                </p>
            </div>
        </main>
    )
}