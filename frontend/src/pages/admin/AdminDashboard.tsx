import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Film, Users, Plus } from 'lucide-react'
import { api } from '../../lib/api'

export default function AdminDashboard() {
	const [movieCount, setMovieCount] = useState<number | null>(null)
	const [userCount, setUserCount] = useState<number | null>(null)

	useEffect(() => {
		api.movies.list({ limit: 1 }).then((res) => setMovieCount(res.total))
		api.users.list(1, 1).then((res) => setUserCount(res.total))
	}, [])

	return (
		<div className="p-8 max-w-4xl">
			<h1 className="font-display text-3xl text-paper mb-8">Dashboard</h1>

			<div className="grid sm:grid-cols-2 gap-4 mb-10">
				<div className="ticket-stub p-6">
					<div className="flex items-center gap-2 text-muted text-sm mb-2">
						<Film className="w-4 h-4" />
						Jami kinolar
					</div>
					<div className="font-display text-3xl text-paper">{movieCount ?? '—'}</div>
				</div>
				<div className="ticket-stub p-6">
					<div className="flex items-center gap-2 text-muted text-sm mb-2">
						<Users className="w-4 h-4" />
						Jami foydalanuvchilar
					</div>
					<div className="font-display text-3xl text-paper">{userCount ?? '—'}</div>
				</div>
			</div>

			<Link
				to="/admin/movies/new"
				className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-medium text-on-accent hover:bg-gold-dim transition-colors"
			>
				<Plus className="w-4 h-4" />
				Yangi kino qo'shish
			</Link>

			<p className="mt-8 text-xs text-muted-dim max-w-md leading-relaxed">
				Sharhlarni moderatsiya qilish (pin/unpin/o'chirish) — har bir kino sahifasida,
				sharhlar ro'yxati ostida amalga oshiriladi.
			</p>
		</div>
	)
}
