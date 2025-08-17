import React, { useMemo } from 'react'
import type { Message } from '@/lib/types'
import { useFilters } from '@/store/filters'
import { inRange, formatDateTime } from '@/lib/date'

export default function Timeline({ messages }: { messages: Message[] }) {
	const { q, pillars, dateFrom, dateTo } = useFilters()
	const filtered = useMemo(() => {
		const query = q.trim().toLowerCase()
		return messages.filter(m => {
			if (!inRange(m.timestamp, dateFrom, dateTo)) return false
			if (pillars.length && !m.pillar_tags.some(t => pillars.includes(t))) return false
			if (query) {
				const hay = `${m.sender} ${m.sender_role} ${m.message}`.toLowerCase()
				if (!hay.includes(query)) return false
			}
			return true
		})
	}, [messages, q, pillars, dateFrom, dateTo])

	return (
		<div className="flex flex-col gap-3">
			<div className="text-sm text-slate-600">Showing {filtered.length} message(s)</div>
			{filtered.length === 0 && (
				<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
					No messages match your filters. Try resetting filters or widening the date range.
				</div>
			)}
			<div className="flex flex-col gap-3">
				{filtered.map(m => (
					<div key={m.id} className="rounded-lg border bg-white p-3">
						<div className="flex items-center justify-between">
							<div className="text-sm text-slate-500">{formatDateTime(m.timestamp)}</div>
							<div className="flex gap-2">
								{m.pillar_tags.map(t => (
									<span key={t} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs">{t}</span>
								))}
							</div>
						</div>
						<div className="mt-1">
							<span className="font-medium">{m.sender}</span>
							<span className="text-slate-500"> • {m.sender_role}</span>
						</div>
						<div className="mt-1 text-sm whitespace-pre-wrap">{m.message}</div>
					</div>
				))}
			</div>
		</div>
	)
}