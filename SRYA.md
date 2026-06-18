# Srya — Personal Execution Intelligence System

> "Become an Execution Weapon. Optimize your behavior, not just your tasks."

This document is the single source of truth for the Srya upgrade. It holds the
vision, the requirements, the decisions made, and a running build log of *what
was done and why*. Code lives in the repo; the reasoning lives here.

---

## 1. The Goal (the dream)

Srya is meant to be more than a to-do app. It is a place anyone can open to
**increase their work capacity, sharpen their focus, and manage their day** —
and walk away a measurably better performer. It should turn daily effort into
honest numbers, surface the behavior holding you back, and make showing up feel
like suiting up.

The north star: a product that feels like something a serious company shipped —
calm, fast, trustworthy — not a flashy demo.

---

## 2. What the owner asked for (requirements, in plain terms)

- **Build the dream, end to end.** Every feature from the reference design should
  actually work — no decorative dead buttons.
- **Work everywhere.** Phone, tablet, laptop, any device. Fully responsive.
- **Be smooth and light.** No noticeable lag. Fast load. Snappy interactions.
- **Easy to use, not overwhelming.** Not too complex, not too shiny. Polished,
  but calm.
- **Industry-benchmark quality.** Match the standard of products big companies
  launch — in reliability, UX, and performance.
- **Protect existing data.** Real users and real data already exist; nothing
  should be lost or broken.
- **Design authority delegated to the builder** — choose the best "face" for it.
- **Keep scope tight for now.** APIs, chatbots, and external integrations come
  *later*. Right now: only what the design specifies, done properly.

---

## 3. Scope — what we are building now

The nine pieces of the system:

| # | Module | What it does |
|---|--------|--------------|
| 0 | **Daily Code** | A rotating daily mantra that resets mindset each morning. |
| 1 | **Execution Score (Daily Power)** | One 0–100% number scoring the day, plotted as a weekly trend. |
| 2 | **Execution Board** | Task add / complete / edit / delete, voice input, time-per-task, deep-work tagging. |
| 3 | **Completion Velocity** | Throughput over time — are you clearing work faster or stalling. |
| 4 | **Focus Tracking** | Focus timer + total focus time, average session, sessions-vs-target, daily chart. |
| 5 | **Habit Heatmap** | GitHub-style grid of habit consistency; streaks and gaps at a glance. |
| 6 | **Anti-Procrastination** | Detects repeatedly-delayed tasks, names the next one, "Attack Now" jumps into it. |
| 7 | **Weekly Grade** | A letter grade summarizing the week into one verdict. |
| 8 | **Account shell** | Sign-in, profile, settings, notifications. |

**Explicitly out of scope for now:** third-party APIs, AI chatbots, integrations.
The architecture will leave clean seams so these slot in later without a rewrite.

---

## 4. Design direction (chosen by the builder)

**Name for the direction: "Quiet Command Center."**

The reference image is high-energy. For something used every single day, raw neon
is exhausting. So the chosen face keeps the *power* but dials the *noise*:

- **Dark slate base, one accent (violet — keeps the existing Srya brand).** Glow is
  used sparingly, as emphasis, not decoration.
- **Calm over shiny.** Generous spacing, clear hierarchy, restrained motion.
- **Benchmarks:** the clarity of Linear, the calm of Things, the polish of Vercel.
- **Mobile-first.** Designed for the phone first, then expanded to the dashboard
  grid on larger screens — so it is never a shrunk-down desktop afterthought.
- **One primary action per view.** The user always knows the next thing to do.

Goal: a newcomer understands it in seconds; a daily user never feels drained by it.

---

## 5. Technical approach

**The key insight:** this is *not* a rewrite. The dream is an **analytics +
behavior layer** on top of data the app already collects. The current app already
records *what* you do and *when*; the upgrade *interprets* it.

- **Preserve and extend the data model.** Keep `tasks` and `logs`. Add new
  collections: `sessions` (focus), `habits`, and a computed `stats/{date}` doc per
  day so charts load instantly instead of recomputing history each time.
- **A pure compute layer** turns raw data into Daily Power, Weekly Grade, and the
  velocity series. This is the "intelligence" — testable, isolated functions.
- **One shared data listener**, not three — fixing the current duplicate Firestore
  subscriptions for performance.
- **Charts via a lightweight library (Recharts)**, code-split so the dashboard stays
  fast on first load.
- **Security first:** Firestore rules locking every read/write to the owning user.

---

## 6. The plan — phased, always deployable

Each phase ships on its own; the live site never has to be "down for a rewrite."

- **Phase 0 — Safety & foundation:** security rules, migration-safe task IDs,
  single data provider, performance baseline.
- **Phase 1 — Dashboard shell + Daily Power + Weekly Grade** (built from existing
  log data).
- **Phase 2 — Focus timer + Focus Time** cards and charts.
- **Phase 3 — Habit tracking + heatmap.**
- **Phase 4 — Anti-Procrastination engine + Daily Code.**
- **Phase 5 — Polish pass:** responsiveness, load speed, accessibility, final QA.

---

## 7. Build Log — what was done and why

> Appended as we go. Records decisions and actions, not raw code.

### 2026-06-18 — Discovery & charter
- **Read the entire existing codebase.** Confirmed stack: Create React App +
  React 19, Firebase (Google auth + Firestore), deployed on Vercel at srya.online.
  *Why:* to upgrade safely, the existing structure and data had to be fully mapped
  before touching anything.
- **Mapped the live data model** (`tasks` and date-keyed `logs`). Identified that
  task documents are keyed by their lowercased text — a migration risk to handle
  carefully so no existing user task is orphaned. *Why:* protecting real user data
  is the first responsibility.
- **Confirmed reusable foundations:** Google sign-in, task CRUD with live sync,
  voice input, daily logs, toast system, and the violet/glass theme all already
  exist and map directly onto the dream. *Why:* the upgrade builds on these rather
  than discarding them — faster and safer.
- **Chose the design direction** ("Quiet Command Center") and locked scope to the
  nine modules, deferring APIs/chatbots. *Why:* the owner delegated design and
  asked for a calm, industry-grade product with tight current scope.
- **Authored this charter.** *Why:* to keep one clear record of the goal, the
  requirements, the decisions, and the journey from start to finish.

### 2026-06-18 — Phase 0: Safety & foundation (done)
- **Wrote Firestore security rules** (`firestore.rules`) locking every read/write
  to the owning user and denying everything else by default. *Why:* before adding
  more user data, the database had to be provably private — this was the biggest
  open risk.
- **Made the task model migration-safe.** New tasks now use auto-generated IDs
  instead of the task text as the ID, and carry new fields (`timeSpent`,
  `deepWork`, `createdDateKey`, `deferCount`) that seed Focus, Deep Work and
  Anti-Procrastination later. *Why:* the old text-as-ID scheme caused collisions
  and stale IDs; the new one fixes that **without touching or orphaning any
  existing task** — every other operation already keyed off the document id.
- **Centralised data into one live listener** (`AppDataContext`). Previously three
  components each opened their own Firestore subscription for the same data. *Why:*
  fewer listeners means less lag, less flicker, and lower cost — a direct hit on
  the "smooth and light" requirement.
- **Kept the public API of the hooks identical**, so no existing screen broke.
  *Why:* the site must keep working at every step; this was a non-breaking swap.
- **Built the scoring engine** (`utils/score.js`) — pure functions for Daily Power,
  Weekly Grade and Completion Velocity, with a weighting system that stays fair
  whether the user has one data source or all of them. Self-tested with sample
  data. *Why:* this is the "intelligence" the whole product rests on; isolating it
  as pure logic makes it reliable and easy to verify.
- **Ran a full production build — compiled successfully.** *Why:* this code
  deploys to the live site, so "it builds clean" was verified, not assumed.

### 2026-06-18 — Switched to on-device storage (no cloud, no sign-in)
- **Removed Google sign-in and the login wall.** The app now opens straight to the
  board. *Why:* the owner asked to keep it local "for now" — less friction, instant
  start.
- **Replaced Firestore with a local store** (`services/localStore.js`) backed by the
  browser's localStorage, with same-tab and cross-tab live updates. The task and
  log services were rewritten to use it while keeping identical function names and
  data shapes. *Why:* the scoring engine and every screen keep working unchanged —
  only the storage underneath swapped out.
- **Kept the Firebase files dormant, not deleted** (`firebase.js`, `AuthContext`,
  `useAuth`). Nothing imports them, so they add nothing to the app, but they're
  ready to switch back on when cloud sync returns. *Why:* the owner said "for now";
  this keeps the door open without a future rebuild.
- **Bundle dropped from ~173 kB to ~64 kB gzipped.** *Why:* Firebase left the build
  graph entirely — a direct, measurable win for load speed and smoothness.
- **Full production build passed.** *Why:* verified, not assumed, before handing over.

> Note: local data lives in one browser on one device and is cleared if the user
> clears site data. Existing cloud tasks remain safe in Firebase but do not appear
> in local mode. A future "export / import" or cloud re-enable can bridge this.

### 2026-06-18 — Phase 1: Dashboard shell + Daily Power + Weekly Grade (done)
- **Built the command-center dashboard** (`components/dashboard/`) and placed it at
  the top of the board, above the task input. It reads the shared on-device data
  from `AppDataContext` and feeds it straight into the pure scoring engine — **no
  new data listeners were opened**, keeping the "smooth and light" promise intact.
- **Daily Power card** — today's `computeDailyPower(signalsForDay(...))` as the big
  number, with the 7-day `dailyPowerSeries(...)` drawn as a trend area chart.
  *Why:* this is the headline number the whole product orbits; it had to feel alive.
- **Weekly Grade card** — `weeklyGrade(dailyPowerSeries(...).map(s => s.value))`
  rendered as a single letter verdict with the average underneath, and a calm empty
  state ("Complete tasks to earn a grade") for fresh installs. *Why:* one glance,
  one verdict.
- **Completion Velocity card** — `completionVelocity(logs)` as a 7-day bar chart of
  tasks finished per day, plus the week's total. *Why:* shows momentum, not just a
  snapshot.
- **Added Recharts, code-split.** Both charts load with `React.lazy` + `Suspense`
  (with a shimmer skeleton to avoid layout shift), so Recharts lands in a separate
  ~96 kB chunk and **stays out of first paint**. The main bundle held at ~65 kB
  gzipped. *Why:* charts are heavy; the dashboard still had to load fast.
- **Made the shell mobile-first.** Cards stack in one column on phones and form the
  command grid (Daily Power leading the top row) from 700px up. The app container
  now goes edge-to-edge with lighter padding on small screens, the input wraps, and
  the oversized header logo is capped. *Why:* it must feel native on a phone, not a
  shrunk-down desktop.
- **Full production build compiled clean.** *Why:* this ships to the live site, so
  "it builds" was verified, not assumed.

### 2026-06-18 — Phase 2: Focus timer + Focus Time (done)
- **Added a focus-session data layer.** Sessions
  (`{ id, startedAt, endedAt, duration, taskId, dateKey }`) live in the same
  on-device store under a new `srya:sessions` key, with a reactive
  `focusService` and a third subscription folded into the *single* shared
  `AppDataContext` listener. *Why:* keep the "one listener, not many" performance
  promise while adding a new data source.
- **Built the focus stopwatch** (`useFocusTimer` + `FocusTimer`). It persists the
  *intent* (when it started, time banked before the last pause) and derives live
  elapsed seconds from the clock, so a **mid-session page reload resumes at the
  right number** instead of resetting. Start / Pause / Resume / Finish / Reset.
  *Why:* a focus timer that loses your session on refresh isn't trustworthy.
- **Built the Focus Time card** — today's total focus (the big "6h 40m" from the
  reference), average session, sessions-vs-target pips, and a 7-day bar chart.
  *Why:* this is module 4 of the nine, straight off the design.
- **Wired the focus signal into the scoring engine.** `signalsForDay` now reads
  sessions and contributes a `focus` signal (focus minutes vs a 120-min daily
  target, weight 2). Because the engine drops empty signals and re-normalises,
  **Daily Power automatically gets richer** the moment a user logs focus — no
  dashboard changes needed. *Why:* the whole point of the weighted design from
  Phase 0 was exactly this kind of drop-in.
- **Charts stay code-split.** The Focus Time bar chart lazy-loads like the Phase 1
  charts; the main bundle held at ~66 kB gzipped. Used an emerald accent for focus
  to echo the reference's green "performance is good" cue while keeping violet as
  the base. *Why:* fast first paint, and a visual language where green = momentum.
- **Full production build compiled clean.** *Why:* it ships to the live site.

### Next up — Phase 3
- Habit tracking + the GitHub-style heatmap, adding the `habits` signal (still
  `null`) so Daily Power gains its final everyday input.
