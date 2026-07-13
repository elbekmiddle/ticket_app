import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { Movie } from '../lib/api'

export default function MovieCard({ movie }: { movie: Movie }) {
	return (
		<Link to={`/movies/${movie.id}`} className="group block hover-lift">
			<div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-curtain border border-border">
				{movie.poster_url ? (
					<img
						src={movie.poster_url}
						alt={movie.title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center text-muted-dim font-display text-4xl">
						{movie.title.charAt(0)}
					</div>
				)}

				{movie.is_premiere && (
					<div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-velvet/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-paper">
						<Sparkles className="w-3 h-3" />
						Premyera
					</div>
				)}

				{movie.price != null && (
					<div className="absolute bottom-2 right-2 rounded-md bg-ink/85 backdrop-blur px-2 py-1 font-mono text-xs text-gold border border-gold-dim/40">
						{Number(movie.price).toLocaleString('uz-UZ')} so'm
					</div>
				)}
			</div>
			<div className="mt-2.5 px-0.5">
				<h3 className="font-display text-[15px] leading-snug text-paper group-hover:text-gold transition-colors line-clamp-1">
					{movie.title}
				</h3>
				{movie.description && (
					<p className="mt-0.5 text-xs text-muted-dim line-clamp-1">{movie.description}</p>
				)}
			</div>
		</Link>
	)
}
