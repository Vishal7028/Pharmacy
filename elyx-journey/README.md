# Elyx Journey (Rohan Patel)

Single-patient health journey web app. 100% client-side, no backend, no API keys. Local AI runs in-browser via web-llm.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Tech stack
- Vite + React + TypeScript
- Tailwind CSS
- Recharts
- Zustand
- web-llm (MLC) for in-browser LLM

## Features
- Dashboard: patient info, adherence KPI ring, signals chart, Ask Assistant side panel
- Timeline: search, pillar chips, date range; summarize current filters
- Decisions: list with Explain button (instant lightweight rationale; can regenerate with AI)

## Data
Loads from `public/data/elyx_8months.json`. If missing/invalid, an in-app yellow banner appears and internal sample data is used.

## Local AI
- Model loads on demand when you open the assistant panel
- Shows status (loading/ready/error). First load can take a minute
- If not ready or you enable "Use lightweight", the app uses a heuristic summary instead

## Troubleshooting
- Hard refresh the page (Ctrl/Cmd+F5) on first run to clear caches
- If AI model loads slowly, toggle "Use lightweight" in the assistant for instant answers
- No server routes are used; everything runs client-side