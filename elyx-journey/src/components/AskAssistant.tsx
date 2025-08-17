import React, { useEffect, useMemo, useState } from 'react'
import { chat, getAIStatus, onAIStatus, summarize, prepareAI } from '@/lib/ai'
import type { ElyxDataset } from '@/lib/types'

export default function AskAssistant({ data }: { data: ElyxDataset }) {
	const [open, setOpen] = useState(false)
	const [status, setStatus] = useState(getAIStatus())
	const [note, setNote] = useState<string | undefined>(undefined)
	const [q, setQ] = useState('')
	const [answer, setAnswer] = useState<string>('')
	const [lightweight, setLightweight] = useState(false)
	const context = useMemo(() => {
		const parts: string[] = []
		parts.push(`Patient: ${data.patient.name} (${data.patient.residence})`)
		parts.push(`Signals: ${data.monthly_signals.map(s => `${s.month} HRV ${s.hrv_median_ms}ms Sleep ${s.sleep_score_avg} ApoB ${s.apoB_mg_dL}`).join(' | ')}`)
		parts.push(`Decisions: ${data.decisions.map(d => `${d.date} ${d.title}`).join(' | ')}`)
		return parts.join('\n')
	}, [data])

	useEffect(() => {
		return onAIStatus((s, n) => {
			setStatus(s)
			setNote(n)
		})
	}, [])

	useEffect(() => {
		if (open) prepareAI()
	}, [open])

	async function ask() {
		if (!q.trim()) return
		setAnswer('')
		if (lightweight || status !== 'ready') {
			setAnswer('AI is loading — using lightweight summary.\n\n' + (await summarize(context)))
			return
		}
		const a = await chat(q, context)
		setAnswer(a)
	}

	async function summarize30d() {
		const sorted = [...data.messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
		const last = sorted.slice(-50)
		const text = last.map(m => `${m.timestamp} ${m.sender}: ${m.message}`).join('\n')
		setAnswer(await summarize(text))
	}

	return (
		<div>
			<button onClick={() => setOpen(v => !v)} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">{open ? 'Close Assistant' : 'Ask Assistant'}</button>
			{open && (
				<div className="fixed right-4 top-24 bottom-4 w-[360px] bg-white border rounded-lg shadow-lg p-4 flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<div className="font-semibold">Ask Assistant</div>
						<div className="text-xs text-slate-500">AI status: {status}{note ? ` — ${note}` : ''}</div>
					</div>
					<div className="flex items-center justify-between text-xs">
						<div>This may take a minute the first time.</div>
						<label className="flex items-center gap-1">
							<input type="checkbox" checked={lightweight} onChange={e => setLightweight(e.target.checked)} />
							<span>Use lightweight</span>
						</label>
					</div>
					<div className="flex gap-2">
						<input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask about the data" className="flex-1 rounded-md border px-3 py-2" />
						<button onClick={ask} className="rounded-md border px-3 py-2 bg-blue-600 text-white">Ask</button>
					</div>
					<button onClick={summarize30d} className="rounded-md border px-3 py-2 bg-white hover:bg-slate-50">Summarize last 30 days</button>
					<div className="flex-1 overflow-auto rounded-md bg-slate-50 border p-3 whitespace-pre-wrap text-sm">
						{!answer ? 'Ask a question to see the answer here.' : answer}
					</div>
				</div>
			)}
		</div>
	)
}