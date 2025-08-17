import React from 'react'
import { useFilters } from '@/store/filters'

export default function FiltersBar({ availablePillars }: { availablePillars: string[] }) {
	const { q, setQuery, reset, pillars, togglePillar } = useFilters()
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3">
				<label htmlFor="search" className="sr-only">Search</label>
				<input
					id="search"
					type="text"
					placeholder="Search messages"
					value={q}
					onChange={e => setQuery(e.target.value)}
					className="w-full md:w-96 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					onClick={reset}
					className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50"
					aria-label="Reset filters"
				>
					Reset
				</button>
			</div>
			<div className="flex flex-wrap gap-2 items-center">
				<span className="text-sm text-slate-600">Pillars:</span>
				{availablePillars.map(p => {
					const active = pillars.includes(p)
					return (
						<button
							key={p}
							onClick={() => togglePillar(p)}
							className={active ? 'px-3 py-1 rounded-full bg-blue-600 text-white text-sm' : 'px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-sm hover:bg-slate-300'}
							aria-pressed={active}
						>
							{p}
						</button>
					)
				})}
			</div>
		</div>
	)
}