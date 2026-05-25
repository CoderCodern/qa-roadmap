# QA Automation Roadmap — Plan & Build Prompt

A mini education web app for a beginner tester. This file contains:

1. The recommended tech stack & rationale
2. The 8-week curriculum (56 daily lessons)
3. Trusted source list per phase
4. Full project structure
5. A ready-to-paste prompt to execute in Cowork / Claude Code

---

## 1. Tech stack (final picks)

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | Vercel-native, file-based routing maps perfectly to `/day/[id]`, SSG by default → fast & cheap |
| Styling | **Tailwind CSS v3** + shadcn/ui primitives | Friendly to maintain, no CSS file sprawl |
| Content | **MDX** (`@next/mdx`) | Lessons authored as Markdown with embedded React quizzes/code blocks — easy for you to edit later |
| State | **Zustand** + `localStorage` persistence | Tiny, no provider boilerplate, perfect for progress + streak |
| Code highlighting | `shiki` (build-time) | Beautiful syntax highlighting, zero runtime JS |
| Icons | `lucide-react` | Clean, consistent |
| Deploy | **Vercel** | `git push` → live |

No backend, no database, no auth. Everything client-side.

---

## 2. Curriculum — 8 weeks, 56 daily lessons (~1–2h/day)

### Phase 1 — Test Fundamentals (Week 1, Days 1–7)
1. What is software testing? Manual vs automated.
2. Test types: functional, regression, smoke, sanity, exploratory.
3. Test case design: equivalence partitioning, boundary values.
4. Bug lifecycle, severity vs priority, good bug reports.
5. SDLC & STLC overview.
6. The test pyramid (unit / integration / E2E) and why it matters.
7. Week 1 review + quiz + mini exercise (write 5 test cases for a login form).

### Phase 2 — Programming Basics with Python (Weeks 2–3, Days 8–21)
8. Install Python, VS Code, run "hello world".
9. Variables, primitives, type hints.
10. Strings, formatting, f-strings.
11. Operators, expressions.
12. `if` / `elif` / `else`.
13. `for` and `while` loops.
14. Functions, parameters, return values.
15. Modules, imports, `pip`.
16. Exception handling (`try`/`except`).
17. Lists & tuples.
18. Dicts & sets.
19. File I/O (read/write `.txt`, `.json`).
20. Intro to classes & OOP.
21. Mini project: CLI calculator + 5 unit tests with `pytest`.

### Phase 3 — Web UI Automation with Playwright (Weeks 4–5, Days 22–35)
22. Browser automation overview; install Playwright (Python).
23. First test: `page.goto`, basic assertions.
24. Locators: role, text, CSS, XPath — and which to prefer.
25. Actions: click, fill, type, hover, check.
26. Waiting strategies & auto-waiting.
27. Screenshots, video, trace viewer.
28. Multiple pages, contexts, frames.
29. Page Object Model — concept.
30. Build your first POM (login + dashboard).
31. Pytest fixtures, hooks (`beforeEach`, `afterEach`).
32. Data-driven testing with `@pytest.mark.parametrize`.
33. Headed vs headless, debugging tips.
34. CI basics: GitHub Actions runs your tests.
35. Mini project: 10-test suite against `https://practicesoftwaretesting.com`.

### Phase 4 — API Testing (Weeks 6–7, Days 36–49)
36. HTTP basics: methods, status codes, headers.
37. REST principles & JSON.
38. Postman: first request, collections.
39. Postman environments & variables.
40. Postman tests (Chai assertions).
41. Postman data-driven runs + Newman CLI.
42. Python `requests` library.
43. `pytest` + `requests` basics.
44. Response schema validation with `jsonschema`.
45. Auth: Basic, Bearer, intro to OAuth2.
46. Negative testing & edge cases for APIs.
47. Mocking concepts (WireMock / `responses` library).
48. Combining API + UI tests in one suite.
49. Mini project: full test suite for the JSONPlaceholder API.

### Phase 5 — Capstone & Career (Week 8, Days 50–56)
50. Framework structure & best practices.
51. Reporting: Allure / HTML reports.
52. Reading & writing test plans + test strategy docs.
53. Capstone kickoff: pick a public demo app.
54. Capstone build day 1 (UI flows).
55. Capstone build day 2 (API + integration).
56. Wrap-up, portfolio tips, next steps (perf testing, mobile, advanced CI).

Each day includes: **Intro · Concept · Code/Demo · Exercise (15–30 min) · Quick quiz (2–4 Qs) · 2–3 curated links**.

---

## 3. Trusted sources (vetted)

**Fundamentals**
- ISTQB Foundation syllabus — `https://www.istqb.org/`
- Ministry of Testing — `https://www.ministryoftesting.com/`
- Test Automation University (free) — `https://testautomationu.applitools.com/`

**Python**
- Official tutorial — `https://docs.python.org/3/tutorial/`
- Real Python — `https://realpython.com/`
- Automate the Boring Stuff (free book) — `https://automatetheboringstuff.com/`

**Playwright**
- Official docs — `https://playwright.dev/python/`
- Playwright YouTube channel
- `awesome-playwright` on GitHub

**API Testing**
- Postman Learning Center — `https://learning.postman.com/`
- HTTP MDN — `https://developer.mozilla.org/en-US/docs/Web/HTTP`
- `requests` docs — `https://requests.readthedocs.io/`

**General**
- The Test Automation Pyramid (Martin Fowler) — `https://martinfowler.com/articles/practical-test-pyramid.html`
- `awesome-test-automation` on GitHub

---

## 4. Project structure

```
qa-roadmap/
├── README.md
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── .eslintrc.json
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── hero-illustration.svg
│       └── badges/                 # streak/milestone SVGs
├── content/
│   └── lessons/
│       ├── day-01.mdx
│       ├── day-02.mdx
│       └── ...                     # day-01 .. day-56
├── src/
│   ├── app/
│   │   ├── layout.tsx              # global shell, fonts, ThemeProvider
│   │   ├── page.tsx                # landing (hero + roadmap preview + CTA)
│   │   ├── globals.css
│   │   ├── roadmap/
│   │   │   └── page.tsx            # full visual roadmap (5 phases × 56 days)
│   │   ├── day/
│   │   │   └── [id]/page.tsx       # daily lesson renderer
│   │   ├── progress/
│   │   │   └── page.tsx            # dashboard: % done, streak, badges
│   │   └── about/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # logo + nav + streak chip
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── roadmap/
│   │   │   ├── RoadmapTimeline.tsx # vertical timeline w/ phases
│   │   │   ├── PhaseCard.tsx
│   │   │   └── DayCard.tsx         # checkmark when completed
│   │   ├── lesson/
│   │   │   ├── LessonShell.tsx     # nav prev/next, completion button
│   │   │   ├── CodeBlock.tsx       # shiki-rendered
│   │   │   ├── Callout.tsx         # tip / warning / note
│   │   │   ├── Quiz.tsx            # multi-choice with feedback
│   │   │   ├── ExerciseBox.tsx     # checklist of tasks
│   │   │   └── ResourceList.tsx
│   │   ├── progress/
│   │   │   ├── StreakBadge.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   └── MilestoneGrid.tsx
│   │   └── ui/                     # shadcn-style primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Tooltip.tsx
│   ├── data/
│   │   ├── roadmap.ts              # phases, days metadata (single source of truth)
│   │   ├── quizzes.ts              # quiz definitions keyed by day
│   │   └── motivation.ts           # rotating encouragement messages
│   ├── hooks/
│   │   ├── useProgress.ts          # Zustand store hook
│   │   ├── useStreak.ts            # streak logic (consecutive-day check)
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── store.ts                # Zustand store w/ localStorage persist
│   │   ├── mdx.ts                  # MDX loader + frontmatter parser
│   │   ├── date.ts                 # day-key helpers (YYYY-MM-DD)
│   │   └── utils.ts                # cn(), clsx wrapper
│   └── styles/
│       └── prose.css               # MDX typography tweaks
└── .gitignore
```

### Key data shapes

```ts
// src/data/roadmap.ts
export type Phase = {
  id: number;
  title: string;            // "Test Fundamentals"
  weekRange: string;        // "Week 1"
  color: string;            // Tailwind hue
  icon: string;             // lucide icon name
  days: Day[];
};

export type Day = {
  id: number;               // 1..56
  title: string;
  blurb: string;            // 1-line teaser
  estMinutes: number;       // 60..120
  tags: string[];           // ["python", "loops"]
};
```

```ts
// progress store
type ProgressState = {
  completed: Set<number>;       // day ids
  lastCompletedDate: string | null;
  streak: number;
  toggleDay: (id: number) => void;
  reset: () => void;
};
```

---

## 5. ⬇️ COPY-PASTE PROMPT FOR COWORK / CLAUDE CODE ⬇️

Paste everything inside the fence into a fresh Cowork conversation (or Claude Code session) to build the site.

```text
You are building a single-page-app-style educational website that walks a beginner QA tester through an 8-week automation testing roadmap. Build it end to end as a real, runnable project.

================================
PROJECT REQUIREMENTS
================================

Tech stack (use exactly):
- Next.js 14 with the App Router and TypeScript (strict mode)
- Tailwind CSS v3 + a few hand-written shadcn-style primitives (Button, Card, Badge, Tooltip)
- MDX via @next/mdx for lesson content
- Zustand for state, with localStorage persistence (persist middleware)
- shiki for syntax highlighting (build-time, not runtime)
- lucide-react for icons
- No backend, no database, no auth — fully static, deployable to Vercel

Visual style:
- Friendly, modern, slightly playful but not childish
- Light + dark mode (system default), toggle in header
- Rounded-2xl cards, soft shadows, generous spacing
- Primary palette: indigo/violet gradient for hero, emerald accents for "completed"
- Use the Inter font via next/font/google
- Mobile-first, fully responsive

Pages to build:
1. `/` — Landing
   - Hero with title "Your 8-Week Automation Tester Roadmap", subtitle, illustration, two CTAs ("Start Day 1", "See full roadmap")
   - Phase overview (5 phase cards)
   - "Why this roadmap" 3-column feature strip
   - Footer
2. `/roadmap` — Full visual timeline of all 56 days grouped by 5 phases. Completed days show a green check. Clicking a day navigates to `/day/[id]`.
3. `/day/[id]` — Renders the MDX lesson. Sticky right rail with "Mark as complete" button, prev/next links, estimated time. Lesson layout: Intro → Concept → Code/Demo → Exercise → Quiz → Resources.
4. `/progress` — Dashboard. Big progress ring (X/56), current streak with flame icon, longest streak, milestone badges (7/21/35/56 days), recent activity list, "Reset progress" button (with confirm).
5. `/about` — Short page explaining the roadmap, sources, who it's for.

Interactive features:
- Progress tracking via Zustand + localStorage. Each day can be toggled complete.
- Streak counter: increments when user completes a day on a date later than the last completion date; resets if a calendar day was skipped. Show "Don't lose your streak!" callout on landing when streak > 0.
- Embedded quizzes: 2–4 multiple-choice questions per lesson, instant feedback, no scoring stored.
- Curated resource links per day (open in new tab, rel="noopener noreferrer").
- Daily motivation: rotating encouragement message on landing + on lesson completion.

Content scope:
- Generate ALL 56 lesson MDX files. Each file should be 250–500 words of original, accurate, beginner-friendly content following this frontmatter and section structure:
  ---
  id: 1
  title: "What is software testing?"
  phase: 1
  estMinutes: 60
  tags: ["fundamentals"]
  resources:
    - title: "ISTQB Foundation Syllabus"
      url: "https://www.istqb.org/certifications/certified-tester-foundation-level"
    - title: "Ministry of Testing — 99-Second Intros"
      url: "https://www.ministryoftesting.com/dojo/series/99-second-intros"
  ---

  ## Intro
  ...
  ## Concept
  ...
  ## Code / Demo
  ```python
  # if applicable
  ```
  ## Exercise
  - [ ] task 1
  - [ ] task 2
  ## Quiz
  <Quiz questions={[
    { q: "...", choices: ["a","b","c","d"], answer: 1, explain: "..." }
  ]} />

- Use the curriculum below as the source of truth for the 56 day titles and ordering. Don't deviate.

CURRICULUM (use these exact titles, in this exact order; ids 1..56):

Phase 1 — Test Fundamentals (days 1–7)
1. What is software testing? Manual vs automated.
2. Test types: functional, regression, smoke, sanity, exploratory.
3. Test case design: equivalence partitioning & boundary values.
4. Bug lifecycle, severity vs priority, writing great bug reports.
5. SDLC & STLC overview.
6. The test pyramid and why it matters.
7. Week 1 review + 5 test cases for a login form.

Phase 2 — Python Basics (days 8–21)
8. Install Python, VS Code, run hello world.
9. Variables, primitives, type hints.
10. Strings & f-strings.
11. Operators & expressions.
12. if / elif / else.
13. for and while loops.
14. Functions, parameters, return values.
15. Modules, imports, pip.
16. Exception handling.
17. Lists & tuples.
18. Dicts & sets.
19. File I/O: txt and json.
20. Classes & OOP intro.
21. Mini project: CLI calculator with pytest.

Phase 3 — Playwright (days 22–35)
22. Browser automation overview & Playwright install.
23. First test: page.goto + assertions.
24. Locators: role, text, css, xpath.
25. Actions: click, fill, type, hover, check.
26. Waiting strategies & auto-wait.
27. Screenshots, video, trace viewer.
28. Multiple pages, contexts, frames.
29. Page Object Model — concept.
30. Build your first POM.
31. Pytest fixtures and hooks.
32. Data-driven tests with parametrize.
33. Headed vs headless; debugging tips.
34. CI basics with GitHub Actions.
35. Mini project: 10-test suite vs practicesoftwaretesting.com.

Phase 4 — API Testing (days 36–49)
36. HTTP basics: methods, status codes, headers.
37. REST principles & JSON.
38. Postman: first request and collections.
39. Postman environments & variables.
40. Postman tests with Chai assertions.
41. Data-driven runs + Newman CLI.
42. Python requests library.
43. pytest + requests basics.
44. Schema validation with jsonschema.
45. Auth: Basic, Bearer, intro to OAuth2.
46. Negative testing & API edge cases.
47. Mocking concepts (responses / WireMock).
48. Combining API + UI tests.
49. Mini project: full suite for JSONPlaceholder.

Phase 5 — Capstone & Career (days 50–56)
50. Framework structure & best practices.
51. Reporting: Allure & HTML reports.
52. Reading & writing test plans.
53. Capstone kickoff.
54. Capstone day 1: UI flows.
55. Capstone day 2: API + integration.
56. Wrap-up, portfolio tips, next steps.

Trusted sources to pull from when writing lessons (do NOT invent URLs):
- ISTQB: https://www.istqb.org/
- Ministry of Testing: https://www.ministryoftesting.com/
- Test Automation University: https://testautomationu.applitools.com/
- Python docs: https://docs.python.org/3/tutorial/
- Real Python: https://realpython.com/
- Automate the Boring Stuff: https://automatetheboringstuff.com/
- Playwright: https://playwright.dev/python/
- Postman Learning: https://learning.postman.com/
- MDN HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP
- requests: https://requests.readthedocs.io/
- Martin Fowler test pyramid: https://martinfowler.com/articles/practical-test-pyramid.html

================================
IMPLEMENTATION PLAN — execute in this order
================================

1. Scaffold the Next.js + TS + Tailwind project; configure @next/mdx; add Inter font; set up dark mode (`class` strategy).
2. Create `src/lib/store.ts` (Zustand + persist) and `src/hooks/useProgress.ts`, `src/hooks/useStreak.ts`.
3. Create `src/data/roadmap.ts` with all 56 days and 5 phases (icons + Tailwind colors).
4. Build UI primitives in `src/components/ui/`.
5. Build layout components (Header with streak chip, Footer, MobileNav).
6. Build roadmap timeline + DayCard + PhaseCard.
7. Build lesson components (LessonShell, CodeBlock with shiki, Quiz, ExerciseBox, ResourceList, Callout).
8. Build pages: `/`, `/roadmap`, `/day/[id]`, `/progress`, `/about`.
9. Generate all 56 MDX lesson files under `content/lessons/`. Make them genuinely useful — short, accurate, beginner-friendly. Include 1 Python code example per relevant day and a 3-question quiz.
10. Wire MDX loader (`src/lib/mdx.ts`) so `/day/[id]` reads `content/lessons/day-{id:02}.mdx` and renders with the Quiz / ExerciseBox / Callout components in scope.
11. Add `README.md` with: what this is, how to run (`pnpm install && pnpm dev`), how to deploy to Vercel, how to edit lessons.
12. Run `pnpm build` and fix all type/lint errors. Don't ship a broken build.

Output expectations:
- Working `pnpm dev` and `pnpm build`.
- All 56 lesson files present and rendered.
- No console errors, no failed type checks.
- The site looks polished on both light and dark mode at mobile (375px) and desktop (1440px) widths.

When you're done, give me:
- A short summary of what you built and any choices you made.
- The exact commands to run locally.
- A note on what to tweak first if I want to rebrand it for my friend (her name / color theme).
```

---

## How to use this file

1. Open the prompt block above (section 5) and copy everything between the triple backticks.
2. Start a new Cowork conversation (or Claude Code session in an empty folder).
3. Paste the prompt.
4. Let it scaffold, then `cd qa-roadmap && pnpm install && pnpm dev`.
5. When you're happy, push to GitHub → import on Vercel → deploy.

If you want a Vietnamese-language version of the lesson content, add this line at the end of the prompt: *"Write all lesson content in Vietnamese, but keep code, file names, and technical terms in English."*
