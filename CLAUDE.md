# CLAUDE.md — Srya Project Context & Conversation Handoff

> **Purpose of this file.** This is a handoff from a previous Claude chat into
> Claude Code. It captures the full conversation, every decision and why it was
> made, the current state of the code, and exactly what to do next. Claude Code
> reads `CLAUDE.md` automatically, so opening this repo loads all of this context.
>
> Companion file: **`SRYA.md`** holds the formal charter + dated build log.

---

## 1. What Srya is

Srya is an ambitious "Personal Execution Intelligence System" — not a to-do app.
It should help anyone increase work capacity, sharpen focus, and manage their day,
and walk away a measurably better performer. Tagline: *"Become an Execution
Weapon. Optimize your behavior, not just your tasks."*

The owner has a reference dashboard design (dark, gamified "command center") and
wants the real product built to match its features — to the standard a serious
company would ship: reliable, fast, calm, works on every device.

Live site: **srya.online** (also `focus-todo-sepia.vercel.app`).
Repo: **github.com/Faizaniqbal52/focus-todo**.

---

## 2. The conversation so far (what was asked, in order)

1. **Owner shared the reference design** and explained Srya was a paused dream
   project they want to revive and make extraordinary.
2. **Requirements gathering.** Asked for every feature in the design to be
   itemized in detail (not just headings). Result: the 9 modules in section 3.
   Also identified the bottom tagline as a **Daily Code** — a rotating daily
   mantra, not static text.
3. **Audit + approach.** Asked Claude to read the existing repo, note everything,
   and propose how to build the dream using the existing data + code. Key finding:
   this is **not a rewrite** — it's an analytics + behavior layer on top of data
   the app already collects.
4. **Charter requested.** Asked for a small README holding the goal, the
   requirements, the chosen process, and a running log of *what was done and why*
   (decisions/actions, not raw code). Result: **`SRYA.md`**.
5. **Plan approved.** Owner agreed to the phased plan and delegated all design
   decisions to the builder.
6. **Phase 0 built.** Safety + foundation (see section 5).
7. **Go local.** Owner asked to remove Google auth + cloud storage "for now" and
   keep everything on the device. Done — app is now local-only (section 6).
8. **Deployment reality clarified.** The previous chat could not push to GitHub
   (no credentials, sandbox only). All code was delivered as files + a zip. This
   handoff exists so **Claude Code, running under the owner's login, can commit,
   push, and open the PR.**

### Important constraints the owner set
- Build only what the reference design specifies **for now**. APIs, chatbots, and
  integrations come **later** — but leave clean seams for them.
- Must work on **phone, tablet, laptop — any device.** Smooth, no lag, fast load.
- **Easy to use, not overwhelming, not too shiny.** Calm but industry-grade.
- **Protect existing data.** Nothing lost or broken.
- Design authority is **delegated to the builder.**

---

## 3. Feature scope — the 9 modules

| # | Module | What it does |
|---|--------|--------------|
| 0 | **Daily Code** | A rotating daily mantra that resets mindset each morning. |
| 1 | **Execution Score (Daily Power)** | One 0–100% score for the day, plotted as a weekly trend. Fire/streak motif. |
| 2 | **Execution Board** | Add / complete / edit / delete tasks, voice input ("Speak"), per-task time, deep-work tagging, Today + Completed sections. |
| 3 | **Completion Velocity** | Throughput over time — completing faster or stalling. Line chart, range filter. |
| 4 | **Focus Tracking** | Focus timer + total focus time, average session, sessions-vs-target (e.g. 4/7), daily bar chart. |
| 5 | **Habit Heatmap** | GitHub-style grid of habit consistency; streaks and gaps at a glance. |
| 6 | **Anti-Procrastination** | Detects repeatedly-delayed tasks, names the next one to do, "Attack Now" launches a focus session on it. The "intelligence" layer. |
| 7 | **Weekly Grade** | A letter grade (A+…F) summarizing the week into one verdict. |
| 8 | **Account shell** | Profile, settings, notifications. (Auth currently removed — see section 6.) |

---

## 4. Chosen design direction — "Quiet Command Center"

The reference image is high-energy; for daily use, raw neon is tiring. The chosen
face keeps the power but dials the noise:
- Dark slate base, **one accent (violet — existing Srya brand)**, glow used
  sparingly for emphasis, not decoration.
- Calm over shiny: generous spacing, clear hierarchy, restrained motion.
- **Mobile-first**, then expand to the dashboard grid on larger screens.
- One primary action per view; a newcomer understands it in seconds.
- Benchmarks: clarity of Linear, calm of Things, polish of Vercel.
- Charts: **Recharts**, code-split so first load stays fast.

---

## 5. Phased plan & current status

- **Phase 0 — Safety & foundation** ✅ DONE
- **Phase 1 — Dashboard shell + Daily Power + Weekly Grade** ✅ DONE
- **Phase 2 — Focus timer + Focus Time** cards/charts ✅ DONE
- **Phase 3 — Habit tracking + heatmap** ✅ DONE
- **Phase 4 — Anti-Procrastination engine + Daily Code** ✅ DONE
- **Phase 5 — Polish:** responsiveness, load speed, accessibility, QA ⬅️ NEXT

Each phase is independently deployable; the live site never has to go "down for a
rewrite."

---

## 6. Current code state (read before editing)

**Stack:** Create React App + React 19. Charts not yet added. **Storage is now
on-device (localStorage)** — no Firebase, no Google sign-in at runtime.

**Storage model (unchanged shapes, local backing):**
- Tasks: array of `{ id, text, completed, createdAt, completedAt, timeSpent,
  deepWork, createdDateKey, deferCount }`
- Logs: `{ 'YYYY-MM-DD': ['task text', ...] }`

**Key files:**
- `src/services/localStore.js` — reactive localStorage layer (same-tab + cross-tab
  updates). **New.**
- `src/services/taskService.js` / `logService.js` — local CRUD, same API as the old
  cloud version. **Rewritten.**
- `src/context/AppDataContext.jsx` — single shared data listener (fixes old
  triple-subscription lag). No auth. **Rewritten.**
- `src/utils/score.js` — pure scoring engine: `computeDailyPower`, `weeklyGrade`,
  `completionVelocity`, `dailyPowerSeries`. Self-tested. **New.** This is the brain
  Phase 1 plugs into.
- `src/App.jsx` — no login gate; opens straight to the board. **Rewritten.**
- `src/components/layout/Header.jsx` — logout removed. **Rewritten.**
- `firestore.rules` — locks cloud data to its owner. **Dormant** (only matters if
  cloud is re-enabled; publish in Firebase Console then).
- **Dormant, not deleted:** `src/services/firebase.js`, `src/context/AuthContext.jsx`,
  `src/hooks/useAuth.js`. Nothing imports them; ready to re-enable cloud later.

**Verified:** full production build compiles clean. Bundle dropped ~173 kB → ~64 kB
gzipped after Firebase left the graph.

**Local-only caveats:** data lives in one browser on one device and is cleared if
the user clears site data. Pre-existing cloud tasks remain in Firebase but do not
appear in local mode. A future export/import or cloud re-enable can bridge this.

---

## 7. What to do next (Phase 1) — concrete

1. `npm install` then `npm start` to run locally.
2. Add **Recharts** (`npm i recharts`) for charts; keep it code-split.
3. Build a **mobile-first dashboard layout** (the "Quiet Command Center" look):
   header, a Daily Power card, a Weekly Grade card, plus the existing task board.
4. Wire `utils/score.js` into the UI:
   - **Daily Power** card: today's `computeDailyPower(signalsForDay(...))` as the big
     number + `dailyPowerSeries(...)` as the trend line.
   - **Weekly Grade** card: `weeklyGrade(dailyPowerSeries(...).map(s => s.value))`.
   - **Completion Velocity** card: `completionVelocity(logs)`.
5. Keep everything reading from `AppDataContext` (do not open new data listeners).
6. After it builds clean, **append a dated entry to `SRYA.md`** describing what was
   done and why (this is a required project habit).

---

## 8. Deployment

Storage is local; the live site needs no environment variables right now.
Typical flow under the owner's GitHub login:

```bash
git checkout -b srya-upgrade
git add -A
git commit -m "Srya upgrade: scoring engine, single data listener, on-device storage"
git push origin srya-upgrade
# then open a PR into main on GitHub and merge; Vercel redeploys automatically
```

---

## 9. Working agreements (please keep these)

- **Never claim a push/PR happened unless it actually did.** Be honest about what
  ran and what didn't.
- **Keep the live site working at every step** — each change should build clean.
- **Log decisions in `SRYA.md`** as you go: what you did and *why*, not raw code.
- **Protect user data**; prefer non-breaking, backward-compatible changes.
- **Scope discipline:** build the 9 modules well before adding APIs/chatbots.
