import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

export function ProtectedRoute() {
	const { user, loading } = useAuth()
	const location = useLocation()

	if (loading) return <FullscreenSpinner />
	if (!user) return <Navigate to="/login" state={{ from: location }} replace />

	return <Outlet />
}

export function AdminRoute() {
	const { user, loading } = useAuth()

	if (loading) return <FullscreenSpinner />
	if (!user) return <Navigate to="/login" replace />
	if (!user.isAdmin) return <Navigate to="/" replace />

	return <Outlet />
}

export function FullscreenSpinner() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-ink">
			<div className="w-8 h-8 rounded-full border-2 border-border border-t-gold animate-spin" />
		</div>
	)
}
