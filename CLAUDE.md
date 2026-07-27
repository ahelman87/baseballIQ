# Baseball IQ

Youth baseball situational-awareness game. Static PWA. Vite + TypeScript, no framework.
Full spec: @docs/BUILD_BRIEF.md

## Current state: Phase 0

There is no build step yet. The whole app is a single `index.html` with an inline `<script>` and
zero dependencies. The `src/` module tree described in the brief arrives in Phase 1 — until then,
paths like `src/game/geometry.ts` are a target, not a location.

## Naming
Name is "Baseball IQ", URL is **baseball-iq-sandy.vercel.app**. It is generic and may change.
(`baseball-iq.vercel.app` was already taken by a different project of Alex's — the Indiana
Falcons 11U app — so Vercel appended a suffix. Do not link to the un-suffixed host; it serves
someone else's app.)
In Phase 0 it is hardcoded in `<title>` and the `<h1>` — deliberately, because link-preview
scrapers do not run JavaScript, and a texted link with no title breaks the main distribution
channel. Phase 1 moves it to one `APP_NAME` constant injected at BUILD time, never at runtime.
A rename should be a one-line change. See brief §10.

## Non-negotiables
- Do NOT port to React/Next/Svelte. The animation engine is imperative on purpose.
- Do NOT modify the `P` coordinate table, the `BADGE`/`BADGEF` offsets, `flyBall()`, the particle
  system, or `moveRunners()` without being asked. They are tuned and were validated geometrically.
  `legacy/baseball-iq-prototype.html` is the frozen reference; never edit it. It still says
  "Diamond IQ" inside — that is correct, it is a byte-exact baseline to diff against.
- Do NOT change user-facing copy. Every string is tuned to a 3rd-grade reading level.
- The game must stay fully playable offline after first load.
- Zero runtime dependencies. No cookies, no PII, no third-party runtime JS. Kids under 13 use this.

## Before committing
Phase 0 has no `npm run check`. Verify by hand: serve the directory, play a full game at each
level, and confirm the career line survives a hard refresh.
From Phase 1 on: `npm run check` — typecheck, scenario validation, tests, build. Must be green.

## Storage
`career:v1` in localStorage, via the `Store` wrapper at the top of the script. The key carries no
product name on purpose — deriving it from the app name means a rename orphans every kid's saved
progress. `Store` falls back to an in-memory map when localStorage throws (Safari private mode).

## Adding scenarios
Phase 2 onward: edit `content/scenarios.json` only, then run `npm run validate`.
New scenarios must pass the layout invariants, not just the data rules — see the brief.
A scenario that reads fine can still be visually ambiguous on the field.

## Device priority
iPad first, then phone, then desktop. Test touch targets at iPad size.
