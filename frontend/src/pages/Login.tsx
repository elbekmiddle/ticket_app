import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { Field, Input, Button, ErrorText } from '../components/ui'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'

export default function Login() {
	const navigate = useNavigate()
	const location = useLocation()
	const { setSession } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const res = await api.auth.login({ email, password })
			setSession(res.accessToken, res.refreshToken, res.user)
			const from = (location.state as { from?: Location })?.from?.pathname || '/movies'
			navigate(from, { replace: true })
		} catch (err) {
			if (err instanceof ApiError && err.message === 'EMAIL_NOT_VERIFIED') {
				navigate('/verify-email', { state: { email } })
				return
			}
			setError(err instanceof ApiError ? "Email yoki parol noto'g'ri" : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthCard title="Kirish">
			<form onSubmit={onSubmit} className="space-y-4">
				<Field label="Email">
					<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="siz@mail.com" />
				</Field>
				<Field label="Parol">
					<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
				</Field>
				<div className="flex justify-end">
					<Link to="/forgot-password" className="text-xs text-muted hover:text-gold transition-colors">
						Parolni unutdingizmi?
					</Link>
				</div>
				<ErrorText>{error}</ErrorText>
				<Button type="submit" loading={loading} className="w-full mt-2">
					Kirish
				</Button>
			</form>
			<p className="mt-6 text-center text-sm text-muted">
				Akkountingiz yo'qmi?{' '}
				<Link to="/register" className="text-gold hover:underline">
					Ro'yxatdan o'tish
				</Link>
			</p>
		</AuthCard>
	)
}
