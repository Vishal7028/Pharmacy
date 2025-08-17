import type { InitProgressReport } from '@mlc-ai/web-llm'

let enginePromise: Promise<any> | null = null
let engineReady = false
let engineError: string | null = null

export type AIStatus = 'idle' | 'loading' | 'ready' | 'error'
let status: AIStatus = 'idle'
let statusListeners: Array<(s: AIStatus, note?: string) => void> = []

function notify(s: AIStatus, note?: string) {
	status = s
	statusListeners.forEach(cb => cb(s, note))
}

export function onAIStatus(cb: (s: AIStatus, note?: string) => void) {
	statusListeners.push(cb)
	cb(status)
	return () => {
		statusListeners = statusListeners.filter(x => x !== cb)
	}
}

async function ensureEngine() {
	if (engineReady) return enginePromise!
	if (!enginePromise) {
		notify('loading')
		enginePromise = import('@mlc-ai/web-llm').then(async ({ CreateMLCEngine }) => {
			const modelId = 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC'
			const progress = (info: InitProgressReport) => {
				if (info.text) notify('loading', info.text)
			}
			try {
				const eng = await CreateMLCEngine(modelId, { initProgressCallback: progress })
				engineReady = true
				notify('ready')
				return eng
			} catch (e: any) {
				engineError = e?.message || 'Failed to load AI model'
				notify('error', engineError || undefined)
				throw e
			}
		})
	}
	return enginePromise
}

export function prepareAI() {
	// Fire-and-forget to start loading the model when the UI opens the panel
	ensureEngine().catch(() => {})
}

function keywords(text: string): string[] {
	return text.toLowerCase().match(/[a-zA-Z]{3,}/g) || []
}

function heuristicSummary(text: string, maxSentences = 5): string {
	const sentences = text
		.replace(/\n+/g, ' ')
		.split(/(?<=[.!?])\s+/)
		.filter(Boolean)
	const all = keywords(text)
	const score = (s: string) => {
		const ks = keywords(s)
		const overlap = ks.filter(k => all.includes(k)).length
		return overlap + Math.min(2, s.length / 120)
	}
	return sentences
		.sort((a, b) => score(b) - score(a))
		.slice(0, maxSentences)
		.join(' ')
}

function heuristicRationale(lines: string[], maxBullets = 5): string {
	const trimmed = lines.map(s => s.trim()).filter(Boolean)
	const bullets = trimmed.slice(0, maxBullets).map(s => `• ${s}`)
	return bullets.join('\n')
}

export function getAIStatus(): AIStatus {
	return status
}

export async function chat(query: string, context: string): Promise<string> {
	try {
		const eng = await ensureEngine()
		const prompt = `${context}\n\nUser question: ${query}`
		const rsp = await eng.chat.completions.create({
			messages: [
				{ role: 'system', content: 'You are a concise health assistant.' },
				{ role: 'user', content: prompt },
			],
			max_tokens: 256,
			temperature: 0.3,
		})
		return rsp.choices?.[0]?.message?.content || 'No response.'
	} catch {
		return heuristicSummary(context, 6)
	}
}

export async function summarize(text: string): Promise<string> {
	// Return instant heuristic if model isn’t ready yet
	if (status !== 'ready') return heuristicSummary(text)
	try {
		const eng = await ensureEngine()
		const rsp = await eng.chat.completions.create({
			messages: [
				{ role: 'system', content: 'Summarize in clear bullet points (3-6 bullets).' },
				{ role: 'user', content: text },
			],
			max_tokens: 200,
			temperature: 0.2,
		})
		return rsp.choices?.[0]?.message?.content || heuristicSummary(text)
	} catch {
		return heuristicSummary(text)
	}
}

export function summarizeRationaleFromWhy(messages: Array<{ id: string; message: string }>): string {
	const lines = messages.map(m => `(${m.id}) ${m.message}`)
	return heuristicRationale(lines, 5)
}