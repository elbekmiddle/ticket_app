import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'
import type { ReactNode } from 'react'

export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-ink px-5 py-12">
			<div className="w-full max-w-sm">
				<Link to="/" className="flex items-center justify-center gap-2 mb-8">
					<Film className="w-5 h-5 text-gold" strokeWidth={1.75} />
					<span className="font-display text-lg tracking-wide">
						OTT<span className="text-gold">.</span>Stream
					</span>
				</Link>

				<div className="ticket-stub p-7">
					<h1 className="font-display text-2xl text-paper mb-1.5">{title}</h1>
					{subtitle && <p className="text-sm text-muted mb-6">{subtitle}</p>}
					{!subtitle && <div className="mb-6" />}
					{children}
				</div>
			</div>
		</div>
	)
}
