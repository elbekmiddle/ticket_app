import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, PlayCircle, Sparkles } from 'lucide-react'
import { api, type Movie } from '../lib/api'
import MovieCard from '../components/MovieCard'

export default function Landing() {
	const [movies, setMovies] = useState<Movie[]>([])

	useEffect(() => {
		api.movies.list({ limit: 6 }).then((res) => setMovies(res.items)).catch(() => {})
	}, [])

	return (
		<div>
			{/* Hero */}
			<section className="relative overflow-hidden border-b border-border">
				<div className="mx-auto max-w-6xl px-5 pt-20 pb-16 sm:pt-28 sm:pb-20">
					<div className="max-w-2xl">
						<div className="inline-flex items-center gap-1.5 rounded-full border border-gold-dim/40 px-3 py-1 text-xs text-gold mb-6">
							<Sparkles className="w-3 h-3" />
							Yangi premyeralar har hafta
						</div>
						<h1 className="font-display text-4xl sm:text-5xl leading-[1.1] text-paper">
							Kinoni sotib oling,
							<br />
							<span className="text-gold">umrbod</span> saqlab qoling.
						</h1>
						<p className="mt-5 text-muted text-base leading-relaxed max-w-md">
							Premyera kinolarga abadiy chipta sotib oling yoki oylik obuna bilan
							butun kutubxonaga kirish oching — auto-billing yo'q, faqat siz xohlagan
							paytda yangilaysiz.
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Link
								to="/movies"
								className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-medium text-on-accent hover:bg-gold-dim transition-colors"
							>
								<PlayCircle className="w-4 h-4" />
								Kinolarni ko'rish
							</Link>
							<Link
								to="/register"
								className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-paper hover:border-gold-dim transition-colors"
							>
								<Ticket className="w-4 h-4" />
								Bepul ro'yxatdan o'tish
							</Link>
						</div>
					</div>
				</div>
				<div className="marquee-divider" />
			</section>

			{/* Featured movies */}
			<section className="mx-auto max-w-6xl px-5 py-14">
				<div className="flex items-end justify-between mb-6">
					<h2 className="font-display text-2xl text-paper">Hozir platformada</h2>
					<Link to="/movies" className="text-sm text-gold hover:underline">
						Barchasi →
					</Link>
				</div>

				{movies.length === 0 ? (
					<p className="text-muted text-sm">Hozircha kinolar qo'shilmagan.</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
						{movies.map((m) => (
							<MovieCard key={m.id} movie={m} />
						))}
					</div>
				)}
			</section>

			{/* How it works */}
			<section className="border-t border-border">
				<div className="mx-auto max-w-6xl px-5 py-16 grid sm:grid-cols-3 gap-8">
					<div>
						<div className="font-mono text-xs text-gold-dim mb-2">Chipta</div>
						<h3 className="font-display text-lg text-paper mb-1.5">Abadiy egalik</h3>
						<p className="text-sm text-muted leading-relaxed">
							Premyera kinoni bir marta sotib oling — obunangiz tugasa ham, u sizda umrbod qoladi.
						</p>
					</div>
					<div>
						<div className="font-mono text-xs text-gold-dim mb-2">Obuna</div>
						<h3 className="font-display text-lg text-paper mb-1.5">Auto-billing yo'q</h3>
						<p className="text-sm text-muted leading-relaxed">
							Oylik obuna 30 kundan keyin o'zi tugaydi — xohlasangiz yangilaysiz, xohlamasangiz yo'q.
						</p>
					</div>
					<div>
						<div className="font-mono text-xs text-gold-dim mb-2">Daraja</div>
						<h3 className="font-display text-lg text-paper mb-1.5">Sodiq mijoz chegirmasi</h3>
						<p className="text-sm text-muted leading-relaxed">
							3 ta premyera chiptasidan keyin — barcha keyingi chiptalarga 10% chegirma avtomatik.
						</p>
					</div>
				</div>
			</section>
		</div>
	)
}
