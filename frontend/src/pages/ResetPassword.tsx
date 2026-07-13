import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { Field, Input, Button, ErrorText } from '../components/ui'
import { api, ApiError } from '../lib/api'

export default function ResetPassword() {
	const navigate = useNavigate()
	const location = useLocation()
	const stateEmail = (location.state as { email?: string })?.email || ''

	const [email, setEmail] = useState(stateEmail)
	const [otp, setOtp] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await api.auth.resetPassword({ email, otp, newPassword })
			navigate('/login', { state: { resetSuccess: true } })
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthCard title="Yangi parol" subtitle="Kod va yangi parolingizni kiriting">
			<form onSubmit={onSubmit} className="space-y-4">
				<Field label="Email">
					<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!stateEmail} />
				</Field>
				<Field label="Tasdiqlash kodi">
					<Input
						value={otp}
						onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
						required
						inputMode="numeric"
						placeholder="123456"
						className="text-center tracking-[0.5em] font-mono"
					/>
				</Field>
				<Field label="Yangi parol">
					<Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="Kamida 8 belgi" />
				</Field>
				<ErrorText>{error}</ErrorText>
				<Button type="submit" loading={loading} className="w-full mt-2">
					Parolni yangilash
				</Button>
			</form>
		</AuthCard>
	)
}
