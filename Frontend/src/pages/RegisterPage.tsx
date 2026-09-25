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
            setError('Passwords do not match!')
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
                    <h2>Create your account</h2>
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
                        minLength={5}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label htmlFor='password'>Password</label>
                    <input
                        id='password'
                        name='password'
                        type='password'
                        placeholder='Create a password'
                        value={password}
                        required
                        minLength={5}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label htmlFor='confirm-password'>Confirm password</label>
                    <input
                        id='confirm-password'
                        name='confirm-password'
                        type='password'
                        placeholder='Re-enter your password'
                        value={confirmPassword}
                        required
                        minLength={5}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button type='submit' className='login-button' disabled={submitting}>
                        {submitting ? 'Creating account...' : 'Create account'}
                        <span aria-hidden='true'>-&gt;</span>
                    </button>
                </form>
                <p className='login-form-footer'>
                    Already have an account? <button
                        type='button'
                        className='login-text-button'
                        onClick={() => navigate('/')}
                    >Sign in</button>
                </p>
            </div>
        </main>
    )
}