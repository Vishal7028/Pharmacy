import type { ElyxDataset } from './types'

export interface LoadResult {
	data: ElyxDataset
	usedFallback: boolean
	minDate: string
	maxDate: string
}

const fallback: ElyxDataset = {
	patient: { name: 'Rohan Patel', residence: 'San Francisco, CA' },
	messages: [
		{
			id: 'm1',
			timestamp: '2024-11-28T09:00:00Z',
			sender: 'Coach Maya',
			sender_role: 'coach',
			message: 'Great job keeping consistency this week. Consider adding one more easy run.',
			pillar_tags: ['exercise', 'coaching'],
		},
		{
			id: 'm2',
			timestamp: '2024-12-05T18:33:00Z',
			sender: 'Dr. Lee',
			sender_role: 'doctor',
			message: 'ApoB improved to 85 mg/dL. Keep up the statin adherence and fiber intake.',
			pillar_tags: ['lipids', 'medication', 'nutrition'],
		},
	],
	decisions: [
		{
			id: 'd1',
			title: 'Increase weekly long run to 70 minutes',
			date: '2024-12-06',
			why_message_ids: ['m1'],
			pillar_tags: ['exercise'],
		},
	],
	monthly_signals: [
		{ month: '2024-09', hrv_median_ms: 65, sleep_score_avg: 76, apoB_mg_dL: 98 },
		{ month: '2024-10', hrv_median_ms: 67, sleep_score_avg: 78, apoB_mg_dL: 92 },
		{ month: '2024-11', hrv_median_ms: 70, sleep_score_avg: 80, apoB_mg_dL: 88 },
		{ month: '2024-12', hrv_median_ms: 72, sleep_score_avg: 79, apoB_mg_dL: 85 },
	],
	monthly_metrics: [
		{ month: '2024-09', adherence_percent: 82, planned_days: 22, total_exercise_minutes: 620, doctor_hours: 1, coach_hours: 2, tests_performed: 1 },
		{ month: '2024-10', adherence_percent: 85, planned_days: 24, total_exercise_minutes: 650, doctor_hours: 1, coach_hours: 2, tests_performed: 1 },
		{ month: '2024-11', adherence_percent: 88, planned_days: 26, total_exercise_minutes: 700, doctor_hours: 2, coach_hours: 2, tests_performed: 2 },
		{ month: '2024-12', adherence_percent: 90, planned_days: 26, total_exercise_minutes: 720, doctor_hours: 1, coach_hours: 2, tests_performed: 1 },
	],
}

function computeBounds(ds: ElyxDataset): { minDate: string; maxDate: string } {
	const allDates: string[] = []
	ds.messages.forEach(m => allDates.push(m.timestamp))
	ds.decisions.forEach(d => allDates.push(d.date))
	const toDay = (s: string) => new Date(s).getTime()
	const min = new Date(Math.min(...allDates.map(toDay)))
	const max = new Date(Math.max(...allDates.map(toDay)))
	const toISO = (d: Date) => d.toISOString()
	return { minDate: toISO(min), maxDate: toISO(max) }
}

export async function loadDataset(): Promise<LoadResult> {
	try {
		const res = await fetch('/data/elyx_8months.json', { cache: 'no-store' })
		if (!res.ok) throw new Error('not ok')
		const data = (await res.json()) as ElyxDataset
		if (!data || !data.messages || !data.decisions) throw new Error('invalid')
		const bounds = computeBounds(data)
		return { data, usedFallback: false, ...bounds }
	} catch (e) {
		const bounds = computeBounds(fallback)
		return { data: fallback, usedFallback: true, ...bounds }
	}
}