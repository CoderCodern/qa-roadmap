# QA Automation Roadmap

A bilingual (English / Vietnamese) educational website for an 8-week QA automation testing roadmap. Built with Next.js 14 App Router, MDX, and Tailwind CSS.

**Architecture:** Static SSG pages (56 lessons pre-rendered at build time) + two serverless Route Handlers (AI exercise grading via OpenAI, reward emails via Resend). User progress is stored in `localStorage` client-side.

## Live content

56 daily lessons across 5 phases:

| Phase | Days | Topic |
|-------|------|-------|
| 1 | 1–7 | Testing fundamentals |
| 2 | 8–21 | Python for QA |
| 3 | 22–35 | Playwright browser automation |
| 4 | 36–49 | API testing with pytest + requests |
| 5 | 50–56 | Capstone framework + career |

## Features

- Bilingual EN/VI toggle — switches instantly via CSS, no page reload
- Dark/light theme
- Per-day progress tracking with streak counter, persisted to localStorage
- Interactive quizzes and exercise checklists on every lesson
- Syntax-highlighted code blocks with copy button
- AI-powered exercise review (via `/api/ai-hint` → OpenAI)
- Phase-completion reward emails (via `/api/send-award-email` → Resend)

## Setup

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # builds and serves via Next.js (not a static export)
```

Requires Node.js 18+ and pnpm.

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
OPENAI_API_KEY=   # required for AI exercise review
RESEND_API_KEY=   # required for reward emails
```

The site runs without these — AI hints and reward emails will return 503.

## Editing lessons

All 56 lesson files live in `content/lessons/en/`. Each is an MDX file with this structure:

```mdx
---
id: N
title: "Lesson title"
phase: P
estMinutes: 60
tags: ["tag"]
---

## Intro
<En>English text</En>
<Vi>Vietnamese text</Vi>

## Concept
...
## Code / Demo
```python
# code
```
## Exercise
<ExerciseBox>
- [ ] Task
</ExerciseBox>
## Quiz
<Quiz questions={[{ q: "...", choices: [...], answer: 0, explain: "..." }]} />
## Resources
<ResourceList resources={[{ title: "...", url: "https://..." }]} />
```

**MDX rules:**
- Never put blank lines inside `<En>` or `<Vi>` blocks
- Code blocks are never wrapped in `<En>` / `<Vi>` — always English only
- Use only trusted, verified URLs in `ResourceList`
- Postman-style `{{variable}}` syntax must be inside backticks in MDX text

## Metadata

Lesson metadata (titles, blurbs, estimated time, phase assignments) lives in `src/data/roadmap.ts` — this is the source of truth since `@next/mdx` strips frontmatter at build time.

## Rebrand

| What to change | Where |
|----------------|-------|
| Site name and description | `src/app/layout.tsx` metadata |
| Brand colors | `tailwind.config.ts` → `colors.brand` |
| Phase colors | `src/data/roadmap.ts` → `Phase.color` |
| Motivation messages | `src/data/motivation.ts` |

## Deploy to Vercel

1. Push to GitHub
2. Import the `qa-roadmap/` directory in Vercel
3. Set Framework Preset to **Next.js**
4. Add `OPENAI_API_KEY` and `RESEND_API_KEY` in Vercel's Environment Variables settings

Vercel will run `pnpm build` and deploy the Next.js app (static pages + serverless functions) automatically.
