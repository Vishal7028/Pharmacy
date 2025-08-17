import React, { useEffect, useState } from 'react'
import { loadDataset } from '@/lib/loadData'
import type { ElyxDataset } from '@/lib/types'
import DecisionCard from '@/components/DecisionCard'

export default function DecisionsPage() {
	const [data, setData] = useState<ElyxDataset | null>(null)
	useEffect(() => {
		loadDataset().then(r => setData(r.data))
	}, [])
	if (!data) return <div>Loading…</div>
	return (
		<div className="flex flex-col gap-3">
			{data.decisions.map(d => (
				<DecisionCard key={d.id} decision={d} messages={data.messages} />
			))}
		</div>
	)
}