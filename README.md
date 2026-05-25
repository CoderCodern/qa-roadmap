# QA Automation Roadmap

A fully static, bilingual (English / Vietnamese) educational website for an 8-week QA automation testing roadmap. Built with Next.js 14 App Router, MDX, and Tailwind CSS. No backend — all progress tracked in localStorage.

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
- Fully static export — deployable to Vercel or any CDN with zero server

## Setup

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # produces out/ for static deployment
```

Requires Node.js 18+ and pnpm.

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
4. No environment variables required

Vercel will run `pnpm build` and serve the static `out/` directory automatically.
