import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore, type User } from '../lib/api'

interface AuthContextValue {
	user: User | null
	loading: boolean
	setSession: (accessToken: string, refreshToken: string, user: User) => void
	logout: () => void
	refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	async function loadUser() {
		if (!tokenStore.getAccess()) {
			setLoading(false)
			return
		}
		try {
			const { user } = await api.users.me()
			setUser(user)
		} catch {
			tokenStore.clear()
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadUser()

		const onUnauthorized = () => setUser(null)
		window.addEventListener('ott:unauthorized', onUnauthorized)
		return () => window.removeEventListener('ott:unauthorized', onUnauthorized)
	}, [])

	function setSession(accessToken: string, refreshToken: string, user: User) {
		tokenStore.set(accessToken, refreshToken)
		setUser(user)
	}

	function logout() {
		tokenStore.clear()
		setUser(null)
	}

	return (
		<AuthContext.Provider value={{ user, loading, setSession, logout, refreshUser: loadUser }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}
