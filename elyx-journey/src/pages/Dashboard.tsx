import React, { useEffect, useState } from 'react'
import { loadDataset } from '@/lib/loadData'
import type { ElyxDataset } from '@/lib/types'
import KPIRing from '@/components/KPIRing'
import MetricCharts from '@/components/MetricCharts'
import AskAssistant from '@/components/AskAssistant'

export default function Dashboard() {
	const [data, setData] = useState<ElyxDataset | null>(null)
	useEffect(() => {
		loadDataset().then(r => setData(r.data))
	}, [])
	if (!data) return <div>Loading…</div>
	const mm = data.monthly_metrics
	const latestAdh = mm.length ? mm[mm.length - 1].adherence_percent : 0
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold">{data.patient.name}</h2>
					<div className="text-slate-600">{data.patient.residence}</div>
				</div>
				<KPIRing percent={latestAdh} label="Adherence" />
				<AskAssistant data={data} />
			</div>
			<MetricCharts data={data.monthly_signals} />
		</div>
	)
}