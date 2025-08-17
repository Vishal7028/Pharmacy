export function parseFlexibleDate(input?: string, endOfDay = false): number | undefined {
	if (!input) return undefined
	const s = input.trim()
	let y: number, m: number, d: number
	const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
	if (m1) {
		y = Number(m1[1])
		m = Number(m1[2])
		d = Number(m1[3])
		return endOfDay ? Date.UTC(y, m - 1, d, 23, 59, 59, 999) : Date.UTC(y, m - 1, d, 0, 0, 0, 0)
	}
	const m2 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/)
	if (m2) {
		d = Number(m2[1])
		m = Number(m2[2])
		y = Number(m2[3])
		return endOfDay ? Date.UTC(y, m - 1, d, 23, 59, 59, 999) : Date.UTC(y, m - 1, d, 0, 0, 0, 0)
	}
	const t = Date.parse(s)
	return isNaN(t) ? undefined : (endOfDay ? (new Date(t).setHours(23, 59, 59, 999), new Date(t).getTime()) : t)
}

export function inRange(tsISO: string, from?: string, to?: string): boolean {
	const t = Date.parse(tsISO)
	const fromMs = parseFlexibleDate(from, false)
	const toMs = parseFlexibleDate(to, true)
	if (fromMs !== undefined && t < fromMs) return false
	if (toMs !== undefined && t > toMs) return false
	return true
}

export function formatDateTime(iso: string): string {
	const d = new Date(iso)
	return d.toLocaleString()
}

export function formatDate(iso: string): string {
	const d = new Date(iso)
	return d.toLocaleDateString()
}