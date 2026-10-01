import './App.css'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function PrivateRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, loading } = useAuth()

	if (loading) return null
	return isAuthenticated ? children : <Navigate to='/' replace />
}

function PublicRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, loading } = useAuth()

	if (loading) return null
	return isAuthenticated ? <Navigate to='/dashboard' replace /> : children
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path='/' element={<PublicRoute><LoginPage /></PublicRoute>} />
					<Route path='/register' element={<PublicRoute><RegisterPage /></PublicRoute>} />
					<Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App
