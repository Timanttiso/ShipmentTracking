import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DestinationProvider } from './contexts/DestinationContext'
import './App.css'

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

function AppLayout() {
	return (
		<DestinationProvider>
			<AppHeader />
			<Outlet />
		</DestinationProvider>
	)
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path='/' element={<PublicRoute><LoginPage /></PublicRoute>} />
					<Route path='/register' element={<PublicRoute><RegisterPage /></PublicRoute>} />

					<Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
						<Route path='/profile' element={<ProfilePage />} />
						<Route path='/dashboard' element={<Dashboard />} />
					</Route>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App
