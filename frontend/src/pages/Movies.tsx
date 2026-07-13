import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { api, type Movie } from '../lib/api'
import MovieCard from '../components/MovieCard'

export default function Movies() {
	const [movies, setMovies] = useState<Movie[]>([])
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<'all' | 'premiere'>('all')
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const limit = 18

	useEffect(() => {
		const timeout = setTimeout(() => {
			setLoading(true)
			api.movies
				.list({ page, limit, search: search || undefined, isPremiere: filter === 'premiere' ? true : undefined })
				.then((res) => {
					setMovies(res.items)
					setTotal(res.total)
				})
				.finally(() => setLoading(false))
		}, 300)
		return () => clearTimeout(timeout)
	}, [search, filter, page])

	const totalPages = Math.max(1, Math.ceil(total / limit))

	return (
		<div className="mx-auto max-w-6xl px-5 py-10">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
				<h1 className="font-display text-3xl text-paper">Kinolar</h1>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dim" />
						<input
							value={search}
							onChange={(e) => {
								setPage(1)
								setSearch(e.target.value)
							}}
							placeholder="Qidirish..."
							className="w-full sm:w-64 rounded-lg border border-border bg-curtain pl-9 pr-3.5 py-2 text-sm text-paper placeholder:text-muted-dim outline-none focus:border-gold-dim transition-colors"
						/>
					</div>

					<div className="flex rounded-lg border border-border overflow-hidden text-sm">
						{(['all', 'premiere'] as const).map((f) => (
							<button
								key={f}
								onClick={() => {
									setPage(1)
									setFilter(f)
								}}
								className={`px-3.5 py-2 transition-colors ${filter === f ? 'bg-gold text-ink' : 'text-muted hover:text-paper'}`}
							>
								{f === 'all' ? 'Hammasi' : 'Premyera'}
							</button>
						))}
					</div>
				</div>
			</div>

			{loading ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<div key={i} className="aspect-[2/3] rounded-xl bg-curtain animate-pulse" />
					))}
				</div>
			) : movies.length === 0 ? (
				<p className="text-muted text-sm py-20 text-center">Hech narsa topilmadi.</p>
			) : (
				<>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
						{movies.map((m) => (
							<MovieCard key={m.id} movie={m} />
						))}
					</div>

					{totalPages > 1 && (
						<div className="mt-10 flex items-center justify-center gap-2">
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
