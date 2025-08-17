import React from 'react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import type { MonthlySignal } from '@/lib/types'

export default function MetricCharts({ data }: { data: MonthlySignal[] }) {
	const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month))
	return (
		<div className="bg-white border rounded-lg p-4">
			<h3 className="text-base font-semibold mb-3">Signals (by month)</h3>
			<div className="h-72">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={sorted} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Line type="monotone" dataKey="hrv_median_ms" name="HRV (ms)" stroke="#2563eb" strokeWidth={2} dot={false} />
						<Line type="monotone" dataKey="sleep_score_avg" name="Sleep score" stroke="#16a34a" strokeWidth={2} dot={false} />
						<Line type="monotone" dataKey="apoB_mg_dL" name="ApoB (mg/dL)" stroke="#dc2626" strokeWidth={2} dot={false} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}