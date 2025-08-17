import React, { useMemo, useState } from 'react'
import type { Decision, Message } from '@/lib/types'
import { summarize, summarizeRationaleFromWhy, getAIStatus } from '@/lib/ai'
import { formatDate } from '@/lib/date'

export default function DecisionCard({ decision, messages }: { decision: Decision; messages: Message[] }) {
	const whyMessages = useMemo(() => messages.filter(m => decision.why_message_ids.includes(m.id)), [messages, decision])
	const [explanation, setExplanation] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function explain() {
		const lightweight = summarizeRationaleFromWhy(whyMessages.map(m => ({ id: m.id, message: m.message })))
		setExplanation(lightweight)
		if (getAIStatus() !== 'ready') return
		try {
			setLoading(true)
			const context = `Decision: ${decision.title} (${decision.date})\nWhy messages:\n${whyMessages.map(m => `(${m.id}) ${m.message}`).join('\n')}`
			const better = await summarize(context)
			setExplanation(better)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="border rounded-lg bg-white p-4 flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div>
					<div className="font-semibold">{decision.title}</div>
					<div className="text-sm text-slate-500">{formatDate(decision.date)}</div>
				</div>
				<div className="flex gap-2">
					{decision.pillar_tags.map(t => (
						<span key={t} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs">{t}</span>
					))}
				</div>
			</div>
			<div className="flex gap-2">
				<button onClick={explain} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">Explain</button>
				{explanation && getAIStatus() === 'ready' && (
					<button onClick={explain} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">Regenerate with AI</button>
				)}
			</div>
			{explanation && (
				<div className="rounded-md bg-slate-50 border p-3 whitespace-pre-wrap text-sm">
					{loading ? 'Generating…' : explanation}
				</div>
			)}
		</div>
	)
}