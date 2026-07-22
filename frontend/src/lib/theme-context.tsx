import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'ott:theme'

function getInitialTheme(): Theme {
	// index.html'dagi inline skript FOUC'ni oldini olish uchun bu attributni
	// React ishga tushishidan oldinoq o'rnatadi — shu yerda faqat o'qiymiz.
	const attr = document.documentElement.dataset.theme
	if (attr === 'dark' || attr === 'light') return attr

	const stored = localStorage.getItem(STORAGE_KEY)
	if (stored === 'dark' || stored === 'light') return stored

	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(getInitialTheme)

	useEffect(() => {
		document.documentElement.dataset.theme = theme
		localStorage.setItem(STORAGE_KEY, theme)
	}, [theme])

	function toggleTheme() {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
	}

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
	return ctx
}
