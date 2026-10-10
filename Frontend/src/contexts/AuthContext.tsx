import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAuth, fetchLogin, type AuthUser } from '../services/auth'
import { ApiError, authExpiredEvent } from '../services/serviceHelper'

interface AuthContextValue {
    user: AuthUser | null
    isAuthenticated: boolean
    loading: boolean
    login: (credentials: { username: string; password: string }) => Promise<void>
    logout: () => void
}

interface LoginResponse {
    token: string
}

const tokenKey = 'shipmentTrackingAuthToken'
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

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
        const handleAuthExpired = () => {
            localStorage.removeItem(tokenKey)
            setUser(null)
            navigate('/', { replace: true })
        }

        window.addEventListener(authExpiredEvent, handleAuthExpired)
        return () => window.removeEventListener(authExpiredEvent, handleAuthExpired)
    }, [navigate])

    const login = async (credentials: { username: string; password: string }) => {
        const { token } = await fetchLogin<LoginResponse>(credentials)
        localStorage.setItem(tokenKey, token)

        try {
            const currentUser = await checkAuth()
            setUser(currentUser)
        } catch (error) {
            localStorage.removeItem(tokenKey)
            setUser(null)
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem(tokenKey)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: user !== null, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
