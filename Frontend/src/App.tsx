import { type ReactNode, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ShipsPage from './pages/ShipsPage';
import DestinationsPage from './pages/DestinationsPage';
import { DestinationProvider } from './contexts/DestinationContext';
import { ShipProvider } from './contexts/ShipContext';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './contexts/useAuth';
import './App.css';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function PrivateRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, loading } = useAuth();

	if (loading) return null;
	return isAuthenticated ? children : <Navigate to='/' replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, loading } = useAuth();

	if (loading) return null;
	return isAuthenticated ? <Navigate to='/dashboard' replace /> : children;
}

function AppLayout() {
	return (
		<DestinationProvider>
			<ShipProvider>
				<AppHeader />
				<Outlet />
			</ShipProvider>
		</DestinationProvider>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route
						path='/'
						element={
							<PublicRoute>
								<LoginPage />
							</PublicRoute>
						}
					/>
					<Route
						path='/register'
						element={
							<PublicRoute>
								<RegisterPage />
							</PublicRoute>
						}
					/>

					<Route
						element={
							<PrivateRoute>
								<AppLayout />
							</PrivateRoute>
						}
					>
						<Route path='/profile' element={<ProfilePage />} />
						<Route path='/dashboard' element={<Dashboard />} />
						<Route path='/ships' element={<ShipsPage />} />
						<Route path='/destinations' element={<DestinationsPage />} />
					</Route>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
