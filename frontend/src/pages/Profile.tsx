import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import { Field, Input, Button, ErrorText, SuccessText } from '../components/ui'
import { api, ApiError } from '../lib/api'

const TIER_LABELS: Record<number, string> = {
	1: 'Yangi foydalanuvchi',
	2: 'Sodiq mijoz (10% chegirma)',
	3: 'VIP',
}

export default function Profile() {
	const { user, refreshUser } = useAuth()
	const [name, setName] = useState(user?.name || '')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [loading, setLoading] = useState(false)

	if (!user) return null

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setSuccess('')
		setLoading(true)
		try {
			await api.users.updateMe({ name })
			await refreshUser()
			setSuccess('Saqlandi')
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mx-auto max-w-lg px-5 py-14">
			<h1 className="font-display text-3xl text-paper mb-2">Profil</h1>
			<div className="flex items-center gap-2 mb-8">
				<span className="font-mono text-xs text-gold border border-gold-dim/40 rounded-full px-2.5 py-1">
					{TIER_LABELS[user.tier] ?? TIER_LABELS[1]}
				</span>
				{user.isAdmin && (
					<span className="flex items-center gap-1 font-mono text-xs text-velvet-light border border-velvet/40 rounded-full px-2.5 py-1">
						<ShieldCheck className="w-3 h-3" />
						Admin
					</span>
				)}
			</div>

			<form onSubmit={onSubmit} className="ticket-stub p-6 space-y-4">
				<Field label="Ism">
					<Input value={name} onChange={(e) => setName(e.target.value)} required />
				</Field>
				<Field label="Email">
					<Input value={user.email} disabled />
				</Field>
				<ErrorText>{error}</ErrorText>
				<SuccessText>{success}</SuccessText>
				<Button type="submit" loading={loading}>
					Saqlash
				</Button>
			</form>
		</div>
	)
}
