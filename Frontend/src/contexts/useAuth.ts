import { createContext, useContext } from 'react'
import type AuthUser from '../types/user'

interface AuthContextValue {
    user: AuthUser | null
    refreshUser: () => Promise<void>
    isAuthenticated: boolean
    loading: boolean
    login: (credentials: { username: string; password: string }) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export default function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
