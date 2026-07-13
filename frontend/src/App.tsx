import { Routes, Route } from 'react-router-dom'

import PublicLayout from './components/PublicLayout'
import { ProtectedRoute, AdminRoute } from './components/RouteGuards'
import AdminLayout from './components/AdminLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import Profile from './pages/Profile'
import Tickets from './pages/Tickets'
import Subscription from './pages/Subscription'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminMovieForm from './pages/admin/AdminMovieForm'
import AdminUsers from './pages/admin/AdminUsers'

export default function App() {
	return (
		<Routes>
			{/* Public + authenticated user-facing pages share the site header/footer */}
			<Route element={<PublicLayout />}>
				<Route path="/" element={<Landing />} />
				<Route path="/movies" element={<Movies />} />
				<Route path="/movies/:id" element={<MovieDetail />} />

				<Route element={<ProtectedRoute />}>
					<Route path="/profile" element={<Profile />} />
					<Route path="/tickets" element={<Tickets />} />
					<Route path="/subscription" element={<Subscription />} />
				</Route>
			</Route>

			{/* Auth pages — no header/footer, own centered card layout */}
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/verify-email" element={<VerifyEmail />} />
			<Route path="/forgot-password" element={<ForgotPassword />} />
			<Route path="/reset-password" element={<ResetPassword />} />

			{/* Admin */}
			<Route element={<AdminRoute />}>
				<Route element={<AdminLayout />}>
					<Route path="/admin" element={<AdminDashboard />} />
					<Route path="/admin/movies" element={<AdminMovies />} />
					<Route path="/admin/movies/new" element={<AdminMovieForm />} />
					<Route path="/admin/movies/:id" element={<AdminMovieForm />} />
					<Route path="/admin/users" element={<AdminUsers />} />
				</Route>
			</Route>

			<Route path="*" element={<Landing />} />
		</Routes>
	)
}
