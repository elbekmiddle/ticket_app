import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Download } from 'lucide-react'
import { api } from '../lib/api'

interface TicketItem {
	id: string
	movie_id: string
	title: string
	poster_url: string | null
	purchased_at: string
	can_download: boolean
}

export default function Tickets() {
	const [items, setItems] = useState<TicketItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		api.tickets
			.mine()
			.then((res) => setItems(res.items as unknown as TicketItem[]))
			.finally(() => setLoading(false))
	}, [])

	return (
		<div className="mx-auto max-w-3xl px-5 py-14">
			<h1 className="font-display text-3xl text-paper mb-8">Chiptalarim</h1>

			{loading ? (
				<p className="text-muted text-sm">Yuklanmoqda...</p>
			) : items.length === 0 ? (
				<div className="ticket-stub p-8 text-center">
					<Ticket className="w-8 h-8 text-muted-dim mx-auto mb-3" />
					<p className="text-muted text-sm mb-4">Hali chiptalaringiz yo'q</p>
					<Link to="/movies" className="text-gold text-sm hover:underline">
						Premyeralarni ko'rish →
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{items.map((t) => (
						<Link
							key={t.id}
							to={`/movies/${t.movie_id}`}
							className="ticket-stub flex items-center gap-4 p-3 hover-lift"
						>
							<div className="w-14 h-20 rounded-md overflow-hidden bg-curtain-light shrink-0">
								{t.poster_url && <img src={t.poster_url} alt={t.title} className="w-full h-full object-cover" />}
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-display text-base text-paper truncate">{t.title}</h3>
								<p className="text-xs text-muted-dim mt-0.5">
									Sotib olingan: {new Date(t.purchased_at).toLocaleDateString('uz-UZ')}
								</p>
							</div>
							{t.can_download && (
								<div className="flex items-center gap-1 text-xs text-gold shrink-0">
									<Download className="w-3.5 h-3.5" />
									Yuklab olish mumkin
								</div>
							)}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
