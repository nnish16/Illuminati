# The Council of Intelligence

> A theatrical debating society of five specialized AI agents that analyze your hardest questions through structured multi-perspective debate.

[![CI](https://github.com/nnish16/Illuminati/actions/workflows/ci.yml/badge.svg)](https://github.com/nnish16/Illuminati/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## The Problem

Single-LLM responses give you one perspective. For complex, nuanced questions — ethics dilemmas, architectural trade-offs, strategic decisions — you need structured disagreement from multiple viewpoints.

## The Solution

The Council of Intelligence convenes five specialized AI agents around a virtual table. Each has a distinct persona, reasoning style, and area of expertise. They debate your question in real-time, and the discussion culminates in a unified decree that synthesizes all perspectives.

### The Council Members

| Member | Role | Perspective |
|--------|------|-------------|
| **The Architect** | Systems thinker | Structural analysis, scalability, trade-offs |
| **The Visionary** | Creative strategist | Innovation, future implications, bold ideas |
| **The Chronicler** | Historian | Historical precedents, patterns, lessons learned |
| **The Paladin** | Ethics guardian | Moral implications, fairness, unintended consequences |
| **The Inquisitor** | Devil's advocate | Challenges assumptions, stress-tests arguments |

## Features

- **Guard system** — trivial queries are rejected (with three-strike ban and secret unban)
- **Animated debate playback** — each member speaks in turn with read-time-matched delays
- **3D isometric council table** — depth-sorted rendering with active speaker highlighting
- **Final decree** — synthesized conclusion after all members have spoken
- **Thinking budget** — uses Gemini 3 Pro Preview with extended reasoning for nuanced answers

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite |
| Language | TypeScript |
| AI (guard) | Gemini 2.5 Flash |
| AI (debate) | Gemini 3 Pro Preview |
| Animations | Framer Motion |
| Icons | Lucide React |
| Styling | Tailwind CSS |

## Quick Start

```bash
git clone https://github.com/nnish16/Illuminati.git
cd Illuminati
npm install
echo "VITE_API_KEY=your_google_genai_key" > .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and pose a question to the Council.

## Architecture

```
User Query
    │
    ▼
┌──────────────────┐
│   Guard Check    │  ← Gemini 2.5 Flash (trivial? → reject)
│   (3-strike ban) │
└───────┬──────────┘
        │ (passes)
        ▼
┌──────────────────┐
│  Council Debate  │  ← Gemini 3 Pro Preview (thinking budget)
│  JSON structured │     → 5 members speak in sequence
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│  Animated        │  ← Read-time delays per member
│  Playback        │     3D table with active speaker
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│  Final Decree    │  ← Synthesized conclusion
└──────────────────┘
```

## Roadmap

- [ ] User-configurable council (add/remove/customize members)
- [ ] Debate history persistence
- [ ] Export debates as markdown
- [ ] Voice synthesis for each member
- [ ] Multi-round debates (follow-up questions)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE) — Nishant Sarang
