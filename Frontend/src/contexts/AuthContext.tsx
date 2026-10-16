import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAuth, fetchLogin, fetchLogout } from '../services/auth'
import { ApiError, authExpiredEvent, tokenKey } from '../services/serviceHelper'
import type AuthUser from '../types/user'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()

    useEffect(() => {
        let cancelled = false

        const loadUser = async () => {
            try {
                const token = localStorage.getItem(tokenKey)
                if (!token) {
                    return
                }

                const currentUser = await checkAuth()
                if (!cancelled) setUser(currentUser)
            } catch (error: unknown) {
                if (!cancelled) {
                    if (error instanceof ApiError && error.status === 401) {
                        localStorage.removeItem(tokenKey)
                    }
                    setUser(null)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        void loadUser()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        const handleAuthExpired = async () => {
            localStorage.removeItem(tokenKey)
            setUser(null)
            await navigate('/', { replace: true })
        }

        window.addEventListener(authExpiredEvent, handleAuthExpired)
        return () => window.removeEventListener(authExpiredEvent, handleAuthExpired)
    }, [navigate])

    const refreshUser = async () => {
        const currentUser = await checkAuth()
        setUser(currentUser)
    }

    const login = async (credentials: { username: string; password: string }) => {
        const { token } = await fetchLogin(credentials)
        localStorage.setItem(tokenKey, token)

        try {
            await refreshUser()
        } catch (error) {
            localStorage.removeItem(tokenKey)
            setUser(null)
            throw error
        }
    }

    const logout = async () => {
        await fetchLogout()
        localStorage.removeItem(tokenKey)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, refreshUser, isAuthenticated: user !== null, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}