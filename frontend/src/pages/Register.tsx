import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { Field, Input, Button, ErrorText } from '../components/ui'
import { api, ApiError } from '../lib/api'

export default function Register() {
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const res = await api.auth.register({ name, email, password })
			navigate('/verify-email', {
				state: { email, verificationToken: res.verificationToken, emailSent: res.emailSent },
			})
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthCard title="Ro'yxatdan o'tish" subtitle="Premyeralar va abadiy chiptalar dunyosiga xush kelibsiz">
			<form onSubmit={onSubmit} className="space-y-4">
				<Field label="Ism">
					<Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Elbek" />
				</Field>
				<Field label="Email">
					<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="siz@mail.com" />
				</Field>
				<Field label="Parol">
					<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Kamida 8 belgi" />
				</Field>
				<ErrorText>{error}</ErrorText>
				<Button type="submit" loading={loading} className="w-full mt-2">
					Ro'yxatdan o'tish
				</Button>
			</form>
			<p className="mt-6 text-center text-sm text-muted">
				Akkountingiz bormi?{' '}
				<Link to="/login" className="text-gold hover:underline">
					Kirish
				</Link>
			</p>
		</AuthCard>
	)
}
