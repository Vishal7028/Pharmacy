import { create } from 'zustand'

export interface FiltersState {
	pillars: string[]
	q: string
	dateFrom?: string
	dateTo?: string
	setQuery: (q: string) => void
	togglePillar: (p: string) => void
	setRange: (from?: string, to?: string) => void
	reset: () => void
}

export const useFilters = create<FiltersState>((set, get) => ({
	pillars: [],
	q: '',
	dateFrom: undefined,
	dateTo: undefined,
	setQuery: (q: string) => set({ q }),
	togglePillar: (p: string) => {
		const has = get().pillars.includes(p)
		set({ pillars: has ? get().pillars.filter(x => x !== p) : [...get().pillars, p] })
	},
	setRange: (from?: string, to?: string) => set({ dateFrom: from, dateTo: to }),
	reset: () => set({ pillars: [], q: '', dateFrom: undefined, dateTo: undefined }),
}))