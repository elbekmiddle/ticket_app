import { Star } from 'lucide-react'

export function StarsDisplay({ value }: { value: number }) {
	return (
		<div className="flex items-center gap-0.5">
			{[1, 2, 3, 4, 5].map((i) => (
				<Star key={i} className={`w-3.5 h-3.5 ${i <= value ? 'fill-gold text-gold' : 'text-border'}`} />
			))}
		</div>
	)
}

export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
	return (
		<div className="flex items-center gap-1">
			{[1, 2, 3, 4, 5].map((i) => (
				<button key={i} type="button" onClick={() => onChange(i)} className="p-0.5">
					<Star className={`w-5 h-5 transition-colors ${i <= value ? 'fill-gold text-gold' : 'text-border hover:text-gold-dim'}`} />
				</button>
			))}
		</div>
	)
}
