import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { Button, ErrorText } from '../components/ui'

interface SubStatus {
	isActive: boolean
	subscription: { expires_at: string; status: string } | null
}

export default function Subscription() {
	const [status, setStatus] = useState<SubStatus | null>(null)
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState(false)
	const [error, setError] = useState('')

	function load() {
		setLoading(true)
		api.subscriptions
			.me()
			.then(setStatus)
			.finally(() => setLoading(false))
	}

	useEffect(load, [])

	async function subscribe() {
		setError('')
		setActionLoading(true)
		try {
			await api.subscriptions.subscribe()
			load()
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setActionLoading(false)
		}
	}

	async function cancel() {
		setError('')
		setActionLoading(true)
		try {
			await api.subscriptions.cancel()
			load()
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setActionLoading(false)
		}
	}

	return (
		<div className="mx-auto max-w-lg px-5 py-14">
			<h1 className="font-display text-3xl text-paper mb-8">Obuna</h1>

			{loading ? (
				<p className="text-muted text-sm">Yuklanmoqda...</p>
			) : (
				<div className="ticket-stub p-6">
					<div className="flex items-center gap-2 mb-4">
						{status?.isActive ? (
							<>
								<CheckCircle2 className="w-5 h-5 text-gold" />
								<span className="text-paper font-medium">Faol obuna</span>
							</>
						) : (
							<>
								<XCircle className="w-5 h-5 text-muted-dim" />
								<span className="text-muted">Faol obuna yo'q</span>
							</>
						)}
					</div>

					{status?.subscription && (
						<p className="text-sm text-muted mb-4 font-mono">
							Tugash sanasi: {new Date(status.subscription.expires_at).toLocaleDateString('uz-UZ')}
						</p>
					)}

					<p className="text-sm text-muted-dim leading-relaxed mb-5">
						Oylik obuna — barcha oddiy (premyera bo'lmagan) kinolarga kirish. Auto-billing
						yo'q, 30 kundan keyin o'zi tugaydi.
					</p>

					<ErrorText>{error}</ErrorText>

					{status?.isActive ? (
						<Button variant="danger" onClick={cancel} loading={actionLoading}>
							Obunani bekor qilish
						</Button>
					) : (
						<Button onClick={subscribe} loading={actionLoading}>
							Obuna bo'lish
						</Button>
					)}
				</div>
			)}
		</div>
	)
}
