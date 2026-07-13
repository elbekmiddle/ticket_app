import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { Field, Input, Button, ErrorText } from '../components/ui'
import { api, ApiError } from '../lib/api'

export default function ForgotPassword() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await api.auth.forgotPassword({ email })
			navigate('/reset-password', { state: { email } })
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthCard title="Parolni tiklash" subtitle="Emailingizga tasdiqlash kodi yuboramiz">
			<form onSubmit={onSubmit} className="space-y-4">
				<Field label="Email">
					<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="siz@mail.com" />
				</Field>
				<ErrorText>{error}</ErrorText>
				<Button type="submit" loading={loading} className="w-full mt-2">
					Kod yuborish
				</Button>
			</form>
		</AuthCard>
	)
}
