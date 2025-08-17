import React from 'react'
import { useFilters } from '@/store/filters'

export default function DateRangeBar({ minISO, maxISO }: { minISO: string; maxISO: string }) {
	const { dateFrom, dateTo, setRange } = useFilters()
	const setPreset = (days: number | 'all') => {
		if (days === 'all') return setRange(undefined, undefined)
		const end = new Date(maxISO)
		const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
		const f = start.toISOString().slice(0, 10)
		const t = end.toISOString().slice(0, 10)
		setRange(f, t)
	}
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-3">
				<label htmlFor="from" className="text-sm text-slate-600">From</label>
				<input id="from" placeholder="yyyy-mm-dd or dd-mm-yyyy" value={dateFrom || ''} onChange={e => setRange(e.target.value || undefined, dateTo)} className="rounded-md border px-3 py-2 w-48" />
				<label htmlFor="to" className="text-sm text-slate-600">To</label>
				<input id="to" placeholder="yyyy-mm-dd or dd-mm-yyyy" value={dateTo || ''} onChange={e => setRange(dateFrom, e.target.value || undefined)} className="rounded-md border px-3 py-2 w-48" />
				<div className="flex items-center gap-2">
					<button onClick={() => setPreset('all')} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">All</button>
					<button onClick={() => setPreset(30)} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">30d</button>
					<button onClick={() => setPreset(90)} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">90d</button>
				</div>
			</div>
			<div className="text-xs text-slate-500">Data window: {new Date(minISO).toLocaleDateString()} → {new Date(maxISO).toLocaleDateString()}</div>
		</div>
	)
}