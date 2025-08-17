export interface Message {
	id: string
	timestamp: string
	sender: string
	sender_role: string
	message: string
	pillar_tags: string[]
}

export interface Decision {
	id: string
	title: string
	date: string
	why_message_ids: string[]
	pillar_tags: string[]
}

export interface MonthlySignal {
	month: string
	hrv_median_ms: number
	sleep_score_avg: number
	apoB_mg_dL: number
}

export interface MonthlyMetric {
	month: string
	adherence_percent: number
	planned_days: number
	total_exercise_minutes: number
	doctor_hours: number
	coach_hours: number
	tests_performed: number
}

export interface ElyxDataset {
	patient: {
		name: string
		residence: string
	}
	messages: Message[]
	decisions: Decision[]
	monthly_signals: MonthlySignal[]
	monthly_metrics: MonthlyMetric[]
}