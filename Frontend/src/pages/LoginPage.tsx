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
                    <p className='welcome-text welcome-text--dark'>Welcome</p>
                    <h2>Sign in</h2>
                </div>

                <form className='login-form' onSubmit={handleSubmit}>
                    <label htmlFor='username'>Username</label>
                    <input
                        id='username'
                        name='username'
                        type='text'
                        placeholder='Enter username'
                        autoComplete='username'
                        value={username}
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <div className='password-label'>
                        <label htmlFor='password'>Password</label>
                        <button type='button' className='login-text-button'>Forgot password?</button>
                    </div>
                    <input
                        id='password'
                        name='password'
                        type='password'
                        placeholder='Enter password'
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button type='submit' className='login-button' disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign in'}
                        <span aria-hidden='true'>-&gt;</span>
                    </button>
                </form>
                <p className='login-form-footer'>
                    Don't have an account yet? <button
                        type='button'
                        className='login-text-button'
                        onClick={() => navigate('/register')}
                    >Register</button>
                </p>
            </div>
        </main>
    )
}