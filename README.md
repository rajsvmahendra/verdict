# Verdict — Multi-Agent AI Investment Research Engine

> An adversarial multi-agent investment research system that researches a company, evaluates both bullish and bearish perspectives, stress-tests conclusions, and delivers a transparent verdict: **Invest**, **Watchlist**, or **Pass**.

Built using Next.js, TypeScript, LangGraph.js, OpenRouter, Gemini, Tailwind CSS, and Framer Motion.

> An adversarial multi-agent AI system that researches any company, debates the investment case from both sides, and delivers a structured verdict: **Invest**, **Watchlist**, or **Pass**.

![Verdict](https://img.shields.io/badge/verdict-AI%20Investment%20Research-e08c52?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript)
![LangGraph](https://img.shields.io/badge/LangGraph.js-1.4.4-green?style=flat-square)

---

## What is Verdict?

Most investment research tools give you data. Verdict gives you a **decision**.

Type any company name — public, private, or even a misspelling. Verdict's six-agent AI committee will:

1. **Research** the company — business model, financials, recent news, competitive position
2. **Debate** the investment case — a Bull agent argues for, a Bear agent argues against, simultaneously
3. **Stress-test** the stronger argument — a Skeptic agent hunts for unsupported claims and missing risks
4. **Synthesize** a final verdict — a Chair agent weighs everything and delivers a structured decision

Every verdict comes with full reasoning, traceable evidence, and two separate confidence scores — so you always know *why* the decision was made.

---

## How It Works
User Input
│
▼
┌─────────────┐
│ Resolver │ Identifies the exact company (handles typos, tickers, ambiguous names)
└─────────────┘
│
▼
┌─────────────┐
│ Research │ Gathers business model, financials, market data, recent news
└─────────────┘
│
├─────────────────────┐
▼ ▼
┌─────────┐ ┌──────────┐
│ Bull │ │ Bear │ Run in parallel — same evidence, opposite conclusions
└─────────┘ └──────────┘
│ │
└──────────┬──────────┘
▼
┌──────────────────┐
│ Skeptic (if │ Only fires when debate is lopsided or confidence is borderline
│ needed) │
└──────────────────┘
│
▼
┌────────────┐
│ Chair │ Synthesizes everything into the final verdict
└────────────┘
│
▼
INVEST / WATCHLIST / PASS


### The Verdict System

| Verdict | Meaning |
|---|---|
| **INVEST** | Strong bull case, high confidence, reliable data |
| **WATCHLIST** | Mixed case, or strong case but data is thin |
| **PASS** | Bear case clearly dominates |

Two confidence scores are tracked separately and combined only at the final step:

- **Decision Confidence** — how strong is the case in either direction?
- **Data Quality Confidence** — how much reliable evidence was actually available?

> A strong-looking case built on thin data will never resolve to **INVEST**. This rule is enforced in code, not in a prompt.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Agent Orchestration | LangGraph.js v1.4.4 |
| LLM Gateway | OpenRouter (Gemini 2.5 Flash) |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Agent Architecture

### Resolver Agent
Disambiguates raw user input. Handles typos, ticker symbols, common name variants, and genuinely ambiguous inputs. Routes to a clarification message when it cannot confidently identify a single company.

### Research Agent
Gathers structured, sourced evidence via Gemini. Produces:
- Business model description
- Recent developments (last 12–18 months)
- Market position and competitive landscape
- Financial snapshot (where available)
- Data completeness score (drives Data Quality Confidence)

Private companies and obscure firms explicitly receive lower data quality scores — never fabricated data.

### Bull Agent
Builds the strongest possible evidence-backed case **for** investing. Scores four dimensions via a weighted rubric:
- Business quality / moat (35%)
- Growth potential (30%)
- Market position (25%)
- Management execution (10%)

`strengthRating` is a weighted decimal (e.g., 8.3) — not an opaque LLM-guessed number.

### Bear Agent
Builds the strongest possible case **against** investing. Runs in **true parallel** with the Bull Agent. Scores four risk dimensions:
- Competitive risk (30%)
- Execution risk (25%)
- Financial risk (30%)
- External / macro risk (15%)

`severityRating` is derived from the same rubric approach.

### Skeptic Agent
**Conditionally invoked** — only fires when:
- Bull and Bear ratings are heavily lopsided (gap ≥ 4 points), OR
- Preliminary confidence falls in a borderline band (40%–70%)

Stress-tests whichever side is winning. Flags unsupported claims, identifies missing considerations, and outputs an `adjustedConfidenceDelta` (always ≤ 0).

### Chair Agent
Synthesizes all prior agent outputs into the final verdict using a deterministic banding table:

| Decision Confidence | Data Quality | Verdict |
|---|---|---|
| High + favorable | High | **INVEST** |
| High + unfavorable | High or Low | **PASS** |
| Moderate / mixed | High | **WATCHLIST** |
| Anything | Low | **WATCHLIST** |

The verdict is determined algorithmically **before** the LLM writes the narrative. The LLM explains — it cannot override.

---

## Project Structure
verdict/
├── app/
│ ├── api/
│ │ ├── analyze/ # POST endpoint — runs the full graph
│ │ └── test-gemini/ # Connection test route
│ ├── globals.css # Design system (Tailwind v4 @theme)
│ ├── layout.tsx
│ └── page.tsx # Root screen state manager
├── components/
│ ├── input-screen.tsx # Search input with disambiguation handling
│ ├── processing-screen.tsx # Live agent pipeline visualization
│ ├── results-screen.tsx # Full verdict display
│ └── ui/
│ ├── company-logo.tsx # Logo fetch with cascade fallback
│ ├── confidence-bar.tsx
│ ├── icons.tsx # Full SVG icon set
│ ├── scroll-reveal.tsx
│ ├── skeleton-loader.tsx
│ ├── spinner.tsx
│ └── verdict-badge.tsx
├── lib/
│ ├── agents/
│ │ ├── resolver.ts # Gemini-powered entity resolution
│ │ ├── research.ts # Structured evidence gathering
│ │ ├── bull.ts # Bullish case builder
│ │ ├── bear.ts # Bearish case builder
│ │ ├── skeptic.ts # Conditional stress-tester
│ │ └── chair.ts # Verdict synthesis + banding logic
│ ├── gemini/
│ │ ├── client.ts # OpenRouter client wrapper
│ │ └── index.ts
│ ├── api-client.ts # Frontend type-safe API client
│ └── env.ts # Typed environment variable loader
├── types/
│ └── graph.ts # Complete typed state schema
└── docs/
├── decisions.md # Architectural decision log
└── build-log.md # Debug session log


---
## Getting Started

### Prerequisites

* Node.js 18+
* An OpenRouter API Key

### Installation

```bash
git clone https://github.com/rajsvmahendra/verdict.git
cd verdict
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

in your browser.
