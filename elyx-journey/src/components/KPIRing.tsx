import React from 'react'

export default function KPIRing({ percent, label = 'Adherence' }: { percent: number; label?: string }) {
	const clamped = Math.max(0, Math.min(100, Math.round(percent)))
	const bg = `conic-gradient(#2563eb ${clamped * 3.6}deg, #e5e7eb 0)`
	return (
		<div className="flex items-center gap-4">
			<div className="relative h-24 w-24" aria-label={`${label} ring`}>
				<div className="h-full w-full rounded-full" style={{ background: bg }} />
				<div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
					<div className="text-center">
						<div className="text-lg font-semibold">{clamped}%</div>
						<div className="text-xs text-slate-500">{label}</div>
					</div>
				</div>
			</div>
		</div>
	)
}