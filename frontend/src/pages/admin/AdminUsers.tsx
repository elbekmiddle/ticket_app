import { useEffect, useState } from 'react'
import { Trash2, ShieldCheck } from 'lucide-react'
import { api, ApiError, type User } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'

const TIER_LABELS: Record<number, string> = {
	1: 'Yangi',
	2: 'Sodiq mijoz',
	3: 'VIP',
}

export default function AdminUsers() {
	const { user: currentUser } = useAuth()
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const limit = 20

	function load() {
		setLoading(true)
		api.users
			.list(page, limit)
			.then((res) => {
				setUsers(res.items)
				setTotal(res.total)
			})
			.finally(() => setLoading(false))
	}

	useEffect(load, [page])

	async function onTierChange(id: string, tier: number) {
		setError('')
		try {
			await api.users.updateTier(id, tier)
			load()
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		}
	}

	async function onDelete(id: string) {
		if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return
		setError('')
		try {
			await api.users.remove(id)
			load()
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		}
	}

	const totalPages = Math.max(1, Math.ceil(total / limit))

	return (
		<div className="p-8">
			<h1 className="font-display text-3xl text-paper mb-8">Foydalanuvchilar</h1>

			{error && <p className="text-sm text-velvet-light mb-4">{error}</p>}

			{loading ? (
				<p className="text-muted text-sm">Yuklanmoqda...</p>
			) : (
				<>
					<div className="rounded-xl border border-border overflow-hidden">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border bg-curtain text-left text-muted-dim text-xs">
									<th className="px-4 py-3 font-medium">Ism</th>
									<th className="px-4 py-3 font-medium">Email</th>
									<th className="px-4 py-3 font-medium">Daraja</th>
									<th className="px-4 py-3 font-medium"></th>
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr key={u.id} className="border-b border-border last:border-0 hover:bg-curtain/50">
										<td className="px-4 py-3 text-paper">
											<div className="flex items-center gap-1.5">
												{u.name}
												{u.is_admin && <ShieldCheck className="w-3.5 h-3.5 text-velvet-light" />}
											</div>
										</td>
										<td className="px-4 py-3 text-muted font-mono text-xs">{u.email}</td>
										<td className="px-4 py-3">
											<select
												value={u.tier}
												onChange={(e) => onTierChange(u.id, Number(e.target.value))}
												className="rounded-md border border-border bg-curtain px-2 py-1 text-xs text-paper outline-none focus:border-gold-dim"
											>
												{[1, 2, 3].map((t) => (
													<option key={t} value={t}>
														{TIER_LABELS[t]}
													</option>
												))}
											</select>
										</td>
										<td className="px-4 py-3 text-right">
											{u.id !== currentUser?.id && (
												<button onClick={() => onDelete(u.id)} className="text-muted hover:text-velvet-light transition-colors">
													<Trash2 className="w-4 h-4" />
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{totalPages > 1 && (
						<div className="mt-6 flex items-center justify-center gap-2">
							{Array.from({ length: totalPages }).map((_, i) => (
								<button
									key={i}
									onClick={() => setPage(i + 1)}
									className={`w-8 h-8 rounded-full text-sm transition-colors ${page === i + 1 ? 'bg-gold text-ink' : 'text-muted hover:text-paper'}`}
								>
									{i + 1}
								</button>
							))}
						</div>
					)}
				</>
			)}
		</div>
	)
}
