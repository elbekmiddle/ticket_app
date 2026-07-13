import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { Field, Input, Button, ErrorText, SuccessText } from '../components/ui'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'

interface LocationState {
	email: string
	verificationToken?: string
	emailSent?: boolean
}

export default function VerifyEmail() {
	const navigate = useNavigate()
	const location = useLocation()
	const { setSession } = useAuth()
	const state = location.state as LocationState | undefined

	const [otp, setOtp] = useState('')
	const [token, setToken] = useState(state?.verificationToken || '')
	const [error, setError] = useState('')
	const [info, setInfo] = useState(state?.emailSent === false ? 'Email yuborilmadi — "Qayta yuborish" tugmasidan foydalaning' : '')
	const [loading, setLoading] = useState(false)
	const [resending, setResending] = useState(false)

	if (!state?.email) {
		navigate('/register', { replace: true })
		return null
	}

	const email = state.email

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const res = await api.auth.verifyEmail({ verificationToken: token, otp })
			setSession(res.accessToken, res.refreshToken, res.user)
			navigate('/movies', { replace: true })
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	async function onResend() {
		setError('')
		setInfo('')
		setResending(true)
		try {
			const res = await api.auth.resendOtp({ email })
			if (res.verificationToken) setToken(res.verificationToken)
			setInfo(res.emailSent ? 'Yangi kod yuborildi' : res.message)
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setResending(false)
		}
	}

	return (
		<AuthCard title="Emailingizni tasdiqlang" subtitle={`${email} manziliga yuborilgan kodni kiriting`}>
			<form onSubmit={onSubmit} className="space-y-4">
				<Field label="Tasdiqlash kodi">
					<Input
						value={otp}
						onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
						required
						inputMode="numeric"
						placeholder="123456"
						className="text-center tracking-[0.5em] font-mono text-lg"
					/>
				</Field>
				<ErrorText>{error}</ErrorText>
				<SuccessText>{info}</SuccessText>
				<Button type="submit" loading={loading} className="w-full mt-2" disabled={!token}>
					Tasdiqlash
				</Button>
			</form>
			<button
				onClick={onResend}
				disabled={resending}
				className="mt-5 w-full text-center text-sm text-muted hover:text-gold transition-colors disabled:opacity-50"
			>
				{resending ? 'Yuborilmoqda...' : 'Kodni qayta yuborish'}
			</button>
		</AuthCard>
	)
}
