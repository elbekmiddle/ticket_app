import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react'
import { api, ApiError, type Movie } from '../../lib/api'

export default function AdminMovies() {
	const [movies, setMovies] = useState<Movie[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	function load() {
		setLoading(true)
		api.movies
			.list({ limit: 100 })
			.then((res) => setMovies(res.items))
			.finally(() => setLoading(false))
	}

	useEffect(load, [])

	async function onDelete(id: string) {
		if (!confirm("Kinoni o'chirishni tasdiqlaysizmi?")) return
		setError('')
		try {
			await api.movies.remove(id)
			load()
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		}
	}

	return (
		<div className="p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="font-display text-3xl text-paper">Kinolar</h1>
				<Link
					to="/admin/movies/new"
					className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold-dim transition-colors"
				>
					<Plus className="w-4 h-4" />
					Yangi kino
				</Link>
			</div>

			{error && <p className="text-sm text-velvet-light mb-4">{error}</p>}

			{loading ? (
				<p className="text-muted text-sm">Yuklanmoqda...</p>
			) : (
				<div className="rounded-xl border border-border overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-curtain text-left text-muted-dim text-xs">
								<th className="px-4 py-3 font-medium">Nomi</th>
								<th className="px-4 py-3 font-medium">Turi</th>
								<th className="px-4 py-3 font-medium">Narx</th>
								<th className="px-4 py-3 font-medium"></th>
							</tr>
						</thead>
						<tbody>
							{movies.map((m) => (
								<tr key={m.id} className="border-b border-border last:border-0 hover:bg-curtain/50">
									<td className="px-4 py-3 text-paper">{m.title}</td>
									<td className="px-4 py-3">
										{m.is_premiere ? (
											<span className="flex items-center gap-1 text-xs text-velvet-light">
												<Sparkles className="w-3 h-3" />
												Premyera
											</span>
										) : (
											<span className="text-xs text-muted-dim">Oddiy</span>
										)}
									</td>
									<td className="px-4 py-3 font-mono text-xs text-gold">
										{m.price != null ? `${Number(m.price).toLocaleString('uz-UZ')} so'm` : '—'}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3 justify-end">
											<Link to={`/admin/movies/${m.id}`} className="text-muted hover:text-gold transition-colors">
												<Pencil className="w-4 h-4" />
											</Link>
											<button onClick={() => onDelete(m.id)} className="text-muted hover:text-velvet-light transition-colors">
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{movies.length === 0 && <p className="text-muted text-sm text-center py-10">Kinolar yo'q.</p>}
				</div>
			)}
		</div>
	)
}
