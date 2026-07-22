import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme-context'

export default function ThemeToggle() {
	const { theme, toggleTheme } = useTheme()
	const isLight = theme === 'light'

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={isLight ? 'Dark rejimga o\'tish' : 'Light rejimga o\'tish'}
			title={isLight ? 'Dark rejimga o\'tish' : 'Light rejimga o\'tish'}
			className="flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-gold hover:bg-curtain-light transition-colors"
		>
			{isLight ? <Moon className="w-4 h-4" strokeWidth={1.75} /> : <Sun className="w-4 h-4" strokeWidth={1.75} />}
		</button>
	)
}
