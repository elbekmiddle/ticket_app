import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Film, User as UserIcon, Ticket, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import ThemeToggle from './ThemeToggle'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				`text-sm transition-colors ${isActive ? 'text-gold' : 'text-muted hover:text-paper'}`
			}
		>
			{children}
		</NavLink>
	)
}

export default function PublicLayout() {
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	return (
		<div className="min-h-screen flex flex-col bg-ink text-paper">
			<header className="sticky top-0 z-40 border-b border-border bg-ink/90 backdrop-blur">
				<div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-6">
					<Link to="/" className="flex items-center gap-2 shrink-0">
						<Film className="w-5 h-5 text-gold" strokeWidth={1.75} />
						<span className="font-display text-lg tracking-wide">
							OTT<span className="text-gold">.</span>Stream
						</span>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						<NavItem to="/movies">Kinolar</NavItem>
						{user && <NavItem to="/tickets">Chiptalarim</NavItem>}
						{user && <NavItem to="/subscription">Obuna</NavItem>}
						{user?.isAdmin && <NavItem to="/admin">Admin</NavItem>}
					</nav>

					<div className="flex items-center gap-3">
						<ThemeToggle />
						{user ? (
							<>
								<Link
									to="/profile"
									className="hidden sm:flex items-center gap-1.5 text-sm text-muted hover:text-paper transition-colors"
								>
									<UserIcon className="w-4 h-4" />
									{user.name}
									{(user.tier ?? 1) >= 3 && <ShieldCheck className="w-3.5 h-3.5 text-gold" />}
								</Link>
								<button
									onClick={() => {
										logout()
										navigate('/')
									}}
									className="flex items-center gap-1.5 text-sm text-muted hover:text-velvet-light transition-colors"
								>
									<LogOut className="w-4 h-4" />
									<span className="hidden sm:inline">Chiqish</span>
								</button>
							</>
						) : (
							<>
								<Link to="/login" className="text-sm text-muted hover:text-paper transition-colors">
									Kirish
								</Link>
								<Link
									to="/register"
									className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-sm font-medium text-on-accent hover:bg-gold-dim transition-colors"
								>
									<Ticket className="w-3.5 h-3.5" />
									Ro'yxatdan o'tish
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			<main className="flex-1">
				<Outlet />
			</main>

			<footer className="border-t border-border">
				<div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-dim">
					<span>© {new Date().getFullYear()} OTT.Stream — barcha huquqlar himoyalangan</span>
					<span className="font-mono">Toshkent, O'zbekiston</span>
				</div>
			</footer>
		</div>
	)
}
