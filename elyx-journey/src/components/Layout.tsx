import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadDataset } from '@/lib/loadData'

export default function Layout() {
	const [usingFallback, setUsingFallback] = useState(false)
	useEffect(() => {
		let mounted = true
		loadDataset().then(r => {
			if (mounted) setUsingFallback(r.usedFallback)
		})
		return () => {
			mounted = false
		}
	}, [])
	return (
		<div className="min-h-full">
			<header className="border-b bg-white">
				<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
					<Link to="/" className="text-xl font-semibold">Elyx • Rohan Patel</Link>
					<nav className="flex gap-6">
						<NavLink to="/" end className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}>Dashboard</NavLink>
						<NavLink to="/timeline" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}>Timeline</NavLink>
						<NavLink to="/decisions" className={({ isActive }) => isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}>Decisions</NavLink>
					</nav>
				</div>
				{usingFallback && (
					<div className="bg-yellow-100 border-t border-yellow-300">
						<div className="mx-auto max-w-6xl px-4 py-2 text-sm text-yellow-900">
							Using sample data (public/data/elyx_8months.json missing or invalid).
						</div>
					</div>
				)}
			</header>
			<main className="mx-auto max-w-6xl px-4 py-6">
				<Outlet />
			</main>
		</div>
	)
}