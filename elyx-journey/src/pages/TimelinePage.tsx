import React, { useEffect, useMemo, useState } from 'react'
import { loadDataset } from '@/lib/loadData'
import type { ElyxDataset } from '@/lib/types'
import FiltersBar from '@/components/FiltersBar'
import DateRangeBar from '@/components/DateRangeBar'
import Timeline from '@/components/Timeline'
import { summarize } from '@/lib/ai'
import { useFilters } from '@/store/filters'
import { inRange } from '@/lib/date'

export default function TimelinePage() {
	const [data, setData] = useState<ElyxDataset | null>(null)
	const [bounds, setBounds] = useState<{ minDate: string; maxDate: string } | null>(null)
	const [summary, setSummary] = useState<string>('')
	const filters = useFilters()
	useEffect(() => {
		loadDataset().then(r => {
			setData(r.data)
			setBounds({ minDate: r.minDate, maxDate: r.maxDate })
		})
	}, [])
	const availablePillars = useMemo(() => Array.from(new Set((data?.messages || []).flatMap(m => m.pillar_tags))).sort(), [data])
	const filteredForSummary = useMemo(() => {
		if (!data) return []
		const query = filters.q.trim().toLowerCase()
		return data.messages.filter(m => {
			if (!inRange(m.timestamp, filters.dateFrom, filters.dateTo)) return false
			if (filters.pillars.length && !m.pillar_tags.some(t => filters.pillars.includes(t))) return false
			if (query) {
				const hay = `${m.sender} ${m.sender_role} ${m.message}`.toLowerCase()
				if (!hay.includes(query)) return false
			}
			return true
		})
	}, [data, filters.q, filters.pillars, filters.dateFrom, filters.dateTo])

	async function summarizeFilters() {
		const text = filteredForSummary.map(m => `${m.timestamp} ${m.sender}: ${m.message}`).join('\n')
		setSummary(await summarize(text || 'No messages'))
	}

	if (!data || !bounds) return <div>Loading…</div>
	return (
		<div className="flex flex-col gap-4">
			<FiltersBar availablePillars={availablePillars} />
			<DateRangeBar minISO={bounds.minDate} maxISO={bounds.maxDate} />
			<div className="flex items-center gap-2">
				<button onClick={summarizeFilters} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">Summarize current filters</button>
			</div>
			{summary && (
				<div className="rounded-md bg-slate-50 border p-3 whitespace-pre-wrap text-sm">{summary}</div>
			)}
			<Timeline messages={data.messages} />
		</div>
	)
}