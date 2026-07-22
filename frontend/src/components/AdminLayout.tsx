import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Film, Users, ArrowLeft } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

function AdminNavItem({ to, icon: Icon, children }: { to: string; icon: typeof Film; children: React.ReactNode }) {
	return (
		<NavLink
			to={to}
			end
			className={({ isActive }) =>
				`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
					isActive ? 'bg-gold/10 text-gold' : 'text-muted hover:text-paper hover:bg-curtain-light'
				}`
			}
		>
			<Icon className="w-4 h-4" />
			{children}
		</NavLink>
	)
}

export default function AdminLayout() {
	return (
		<div className="min-h-screen bg-ink text-paper flex">
			<aside className="w-56 shrink-0 border-r border-border p-4 flex flex-col">
				<div className="flex items-center justify-between mb-6">
					<Link to="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-paper transition-colors">
						<ArrowLeft className="w-3.5 h-3.5" />
						Saytga qaytish
					</Link>
					<ThemeToggle />
				</div>

				<div className="font-display text-lg text-paper mb-6 px-3">
					Admin<span className="text-gold">.</span>panel
				</div>

				<nav className="space-y-1">
					<AdminNavItem to="/admin" icon={LayoutDashboard}>
						Dashboard
					</AdminNavItem>
					<AdminNavItem to="/admin/movies" icon={Film}>
						Kinolar
					</AdminNavItem>
					<AdminNavItem to="/admin/users" icon={Users}>
						Foydalanuvchilar
					</AdminNavItem>
				</nav>
			</aside>

			<main className="flex-1 min-w-0">
				<Outlet />
			</main>
		</div>
	)
}
