import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block">
			<span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
			{children}
		</label>
	)
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			className={`w-full rounded-lg border border-border bg-curtain px-3.5 py-2.5 text-sm text-paper placeholder:text-muted-dim outline-none focus:border-gold-dim transition-colors ${props.className ?? ''}`}
		/>
	)
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			{...props}
			className={`w-full rounded-lg border border-border bg-curtain px-3.5 py-2.5 text-sm text-paper placeholder:text-muted-dim outline-none focus:border-gold-dim transition-colors resize-none ${props.className ?? ''}`}
		/>
	)
}

export function Button({
	children,
	variant = 'primary',
	loading,
	className = '',
	...rest
}: {
	children: ReactNode
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
	loading?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const variants: Record<string, string> = {
		primary: 'bg-gold text-ink hover:bg-gold-dim',
		secondary: 'bg-curtain-light text-paper border border-border hover:border-gold-dim',
		danger: 'bg-velvet text-paper hover:bg-velvet-light',
		ghost: 'text-muted hover:text-paper',
	}

	return (
		<button
			{...rest}
			disabled={rest.disabled || loading}
			className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
		>
			{loading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : null}
			{children}
		</button>
	)
}

export function ErrorText({ children }: { children: ReactNode }) {
	if (!children) return null
	return <p className="text-sm text-velvet-light">{children}</p>
}

export function SuccessText({ children }: { children: ReactNode }) {
	if (!children) return null
	return <p className="text-sm text-gold">{children}</p>
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
	return <label {...props} />
}
