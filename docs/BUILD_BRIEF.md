# Baseball IQ — Build Brief

**For:** Claude Code
**Repo:** `baseballIQ`
**Source material:** `legacy/baseball-iq-prototype.html` (working single-file prototype — this is the behavioral spec)

> **Locked decisions — do not reopen.**
> Name: **Baseball IQ**. URL: **`baseball-iq.vercel.app`** (Vercel free Hobby tier, no custom
> domain). Scope: a free tool for one Little League, not a commercial product. The name is
> generic and may change if this outgrows the league — so it lives in **one constant**, never
> hardcoded in markup (see §10).

---

## Amendments — decisions made during Phase 0

Recorded here so the brief and the repo don't silently diverge. Everything else below stands.

1. **The prototype was renamed from "Diamond IQ" to "Baseball IQ."** Historical references to the
   old name survive in §10.4 (where the whole point is why it was rejected) and inside
   `legacy/baseball-iq-prototype.html`, which is frozen byte-for-byte as a diff baseline.
2. **§10.2's `APP_NAME` constant is deferred to Phase 1.** Phase 0 hardcodes the name in `<title>`
   and the `<h1>`. Every runtime-injection approach requires `<title>` to ship empty, and
   link-preview scrapers do not run JavaScript — a texted link would unfurl with no title, which
   breaks the primary distribution channel described in §1. Phase 1 injects `APP_NAME` at **build
   time** via Vite, which satisfies §10.2 *and* keeps a real title in the served HTML.
3. **The localStorage key is `career:v1`**, carrying no product name, so a future rename cannot
   orphan saved progress.

---

## How to use this document

Work in **phases**. Do not skip ahead. Each phase has a definition of done; stop and report when you hit it rather than rolling into the next one.

Start every non-trivial phase in **plan mode** (`/plan` or `claude --permission-mode plan`), get the plan approved, then implement exactly what was approved and nothing more.

When something in this brief conflicts with what you'd normally do — follow this brief and say so.

---

## 1. What this is

A free web game that teaches youth baseball players (ages 8–14) where to throw the ball in defensive situations. A play animates on a top-down field, the player taps a base, and gets an out or gives up a run, with a one-line coaching takeaway after each play.

It already exists and works as a single HTML file. This project makes it a hosted product: a URL anyone can open, that installs to an iPad home screen, works with no signal in a dugout, and can grow past its current 36 scenarios.

**Primary device is an iPad in a dugout, then a phone, then desktop.** Optimize in that order.

**v1 is done when:** a coach can text a link to a parent, the kid opens it on an iPad, plays a full game with the wifi off, and the app remembers their progress next time.

---

## 2. Architecture decisions — settled, do not relitigate

| Area | Decision | Why |
|---|---|---|
| Build | **Vite + TypeScript**, no UI framework — **from Phase 1 onward** | The game is one screen with an imperative rAF animation loop and direct SVG DOM mutation. A virtual DOM adds friction and buys nothing here. **Phase 0 has no build step at all** — see §6. |
| Output | **Fully static** (`dist/`) | No SSR, no per-request logic. Infinitely cacheable, no cold starts, near-zero cost. |
| Host | **Vercel** | Already chosen and known. Cloudflare Pages is a fine swap later if bandwidth ever matters; do not switch now. |
| Backend | **None in v1** | Nothing in v1 requires a server. Adding one adds COPPA surface area for zero user benefit. |
| Storage | **`localStorage`**, wrapped | Local progress only. No accounts, no sync, no PII. |
| Delivery | **PWA, offline-first** | Dugout wifi is bad or absent. This is a hard requirement, not a nice-to-have. |
| Runtime deps | **Zero** | No animation libraries, no UI kits, no analytics SDKs that set cookies. Dev dependencies are fine. |

**Explicitly considered and rejected:**

- **Next.js** — routing and SSR we don't need; app-router complexity for a single-screen game.
- **React / Svelte / Vue** — would require rewriting the animation engine against a reconciler. The engine is the part that works best. Don't touch it.
- **A database in v1** — see Phase 4 for the conditions under which this changes.

---

## 3. Hard constraints

1. **Do not rewrite the animation engine, the field geometry constants, or the SVG field markup.** Port them verbatim into modules. They are tuned. Specifically preserve, unchanged: the `P` coordinate table, the `<svg id="field">` markup and its `viewBox="40 30 920 750"`, `flyBall()`, the particle system (`burst`/`ring`/`stepParts`), the trail system, `moveRunners()`, and the `BADGE`/`BADGEF` offset tables.
2. **Do not change visual design, copy, or game rules** without asking first. The reading level of every string was deliberately tuned for a 9-year-old.
3. **The game must be fully playable with the network disconnected** after first load.
4. **No cookies, no PII, no third-party runtime JavaScript.** See §10.
5. **Every commit must pass `npm run check`** (typecheck + scenario validation + build). Wire this as a pre-push hook and as a Vercel build step.
6. **Never ship a scenario that fails the validator.** See §8 — this is not busywork, it has already caught a real shipped-quality bug.

---

## 4. What's in the source file

`legacy/baseball-iq-prototype.html`, ~64KB, no dependencies. Read it fully before planning.

- **Field model** — `P` maps base and fielder positions to SVG coordinates in a `40 30 920 750` viewBox. Home is `[500,700]`, bases 170px apart on the diagonal.
- **Animation engine** — one global `requestAnimationFrame` loop driving a particle system and a trail; `flyBall()` interpolates a quadratic arc with a ground shadow that scales with height.
- **Scenario bank** — 36 objects inlined in a `BANK` array.
- **Answer markers** — up to 3 numbered, color-coded rings drawn on the field (`OPTC = ["#3ba7ff","#ffc24a","#ff5fa8"]`), each mirrored by a matching numbered button. Badge offsets are hand-placed per base (`BADGE`) and per fielder (`BADGEF`) so a number never lands on top of a fielder or a chalk label.
- **Read-aloud** — `SpeechSynthesis`, on by default.
- **Audio** — WebAudio synthesis, no asset files.
- **Force arrows** — a teaching overlay drawn after each ground-ball play showing which runners are forced.

---

## 5. Known defects to fix during the port

| # | Defect | Fix | Status |
|---|---|---|---|
| 1 | Uses `window.storage` (a sandbox-only API that doesn't exist in a browser) | Replace with a `storage.ts` wrapper over `localStorage`. Must no-op safely in Safari private mode — wrap every call in try/catch and fall back to an in-memory map. | **Done in Phase 0** (inline `Store`; moves to `src/lib/storage.ts` in Phase 1) |
| 2 | iOS Safari drops `speechSynthesis.speak()` when called immediately after `.cancel()` | Queue through a small wrapper: `cancel()`, then `speak()` on a `setTimeout(…, 60)`. Also handle `voiceschanged` firing late — voices are often empty on first call. | Phase 1 |
| 3 | Speech never unlocked on iOS until a user gesture | Speak one silent/short utterance inside the "Play Ball" click handler to unlock the API for the session. | Phase 1 |
| 4 | No screen-wake handling | Request `navigator.wakeLock` on game start, release on results. An iPad dimming mid-inning is a real annoyance in a dugout. Feature-detect; it's unsupported on some browsers. | Phase 1 |
| 5 | Emoji used as UI icons (medals, tiles, toggles) | Render inconsistently across Android/Windows. Replace with inline SVG icons. Low priority; do it in Phase 1, not Phase 0. | Phase 1 |
| 6 | Scenario bank is inline | Extract to `content/scenarios.json` in Phase 2. | Phase 2 |
| 7 | No focus-visible styles; callouts aren't announced | Add visible focus rings on all buttons and an `aria-live="assertive"` region that announces "Out" / "Safe" and the takeaway. `prefers-reduced-motion` is already handled — keep it. **Also remove `maximum-scale=1, user-scalable=no` from the viewport meta — it blocks pinch-zoom.** | Phase 1 |
| 8 | No error handling | A thrown error mid-play leaves a dead screen. Wrap the play loop; on error, log, skip to the next play, and don't lose the session. | Phase 1 |
| 9 | **Results-screen accuracy bars never render.** `.fill` is an `<i>`, which is `display:inline`, so `height:100%` doesn't apply and the element measures 0×0. The `scaleX()` transition runs correctly on a zero-size box, so it fails silently — the per-concept tracks look permanently empty even at 100%. Present in the frozen prototype, so it has never worked. | Add `display:block; width:100%` to `.fill`. One CSS line. Not done in Phase 0 because it is a visual change (§3.2) and Phase 0 allows exactly one functional change. | Phase 1 |

---

## 6. Phases

### Phase 0 — Get it live (target: one session)

Ship before refactoring. A working URL today beats a clean architecture next week.

**No build step in this phase.** Do not scaffold Vite, do not add TypeScript, do not add a
`package.json`. Vercel serves a bare `index.html` with zero configuration. Every tool you add
here is a way for Phase 0 to fail at something that isn't the point. Vite arrives in Phase 1.

1. `git init`, commit the prototype **completely untouched** as `legacy/baseball-iq-prototype.html`.
   This is the known-good baseline to diff against forever. Never edit it again.
2. Copy it to `index.html`. Make exactly **one** code change: defect #1 — replace the
   `window.storage` calls with a `localStorage` wrapper that try/catches and falls back to an
   in-memory object (Safari private mode throws on write).
3. Extract the product name into a single constant near the top of the script
   (`const APP_NAME = "Baseball IQ";`) and reference it everywhere the name appears — `<title>`,
   the `<h1>`, the results screen. A rename must be a one-line change, not a find-and-replace.
   **Amended — see the Amendments section: deferred to Phase 1, build-time injection.**
4. Add `favicon.ico` / `apple-touch-icon.png` and `robots.txt`. **Skip OG images and any artwork
   carrying the name** — §10 explains why that's cheap to defer and expensive to redo.
5. **Verify locally before pushing:** serve it and play a complete game at all three levels.
   Confirm the score persists across a hard refresh. Confirm read-aloud works in Safari.
6. Push to GitHub. Create the Vercel project named exactly `baseball-iq` so the assigned URL is
   `baseball-iq.vercel.app`. No framework preset — it's a static site.
7. **Generate a QR code** for the live URL, committed as `docs/qr.png` plus a printable
   half-sheet PDF. This is how it actually gets distributed — taped in a dugout, handed out at a
   parent meeting. Nobody types a URL off a whiteboard.

**Done when:** `baseball-iq.vercel.app` loads on a phone and an iPad, a full 9-out game is
playable at every level, progress survives a refresh, and the QR code scans to it.

**Explicitly out of scope for Phase 0:** modules, TypeScript, tests, a service worker,
analytics, a custom domain, any change to the game's copy, scenarios, visuals, or animation.

### Phase 1 — Modularize and harden

1. **Now** introduce the toolchain: `npm create vite@latest -- --template vanilla-ts`, folded
   around the existing `index.html`. Confirm the built output still plays identically before
   touching anything else.
2. Split into modules (see §7). Move behavior, don't rewrite it. After each extraction, play a
   full game and confirm nothing changed.
3. Turn on `strict` TypeScript. Type the scenario model (§8) and the field geometry.
4. Fix defects #2–#8. Move the name into `APP_NAME`, injected at build time.
5. **PWA:** web manifest, maskable icons (192/512), a service worker that precaches the entire app shell. Verify: load once, turn off wifi, force-quit, reopen — full game still playable.
6. Privacy-respecting analytics with no cookies and no identifiers. Vercel Web Analytics or a self-hosted Plausible-style counter. Track only: session start, game completed, level chosen, aggregate per-concept accuracy. **Never** anything that could identify a child.
7. Lighthouse budget: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, PWA installable. Wire `lhci` into CI.

**Done when:** the app installs to an iPad home screen, plays offline, passes the Lighthouse budget, and `npm run check` is green.

---

### Phase 2 — Content system

This is what turns a demo into a product. 36 scenarios is one sitting; retention needs a pipeline.

1. Extract scenarios to `content/scenarios.json`, one object per play, conforming to §8. Give every scenario a stable `id` — these become analytics keys and must never be recycled.
2. Write `scripts/validate-scenarios.ts` implementing every rule in §8, including the **layout invariants**. Wire to `npm run validate` and make it part of `npm run check`.
3. Write `docs/AUTHORING.md`: how to add a scenario, the reading-level rules, the list of valid option keys, and how to run the validator locally. Written so a volunteer coach can follow it and open a PR.
4. Grow the bank from 36 toward 100+. Weight toward the concepts youth teams actually botch: force vs. tag, cutoffs and relays, backing up bases, and where to be before the pitch.
5. Add a `pack` field so scenarios can be grouped ("Little League Basics", "Cutoffs & Relays", "13U"). Ship the packs as a menu.

**Done when:** a new scenario can be added by editing one JSON file, the validator catches a bad one, and there are at least 60 live.

---

### Phase 3 — Retention

1. **Per-concept mastery**, persisted locally. Track rolling accuracy per concept, not just per session.
2. **"Fix my weak spot" mode** — builds a deck weighted toward the concepts the player misses.
3. **Share card** — render a canvas image of the result ("9 outs, 0 runs, 6 in a row") with the app URL. This is how a kids' game actually spreads; a coach posts it to the team GroupMe.
4. **Coach mode** — pick concepts and a length, generate a set, run it on a TV or projector for a team meeting. Bigger type, no timer, a "reveal" button instead of auto-advance.
5. **Spaced repetition** on missed scenarios: a miss reappears two plays later, then five, then twelve.

---

### Phase 4 — Backend (only if the trigger fires)

**Trigger:** a coach asks to see whether their players have actually practiced. Nothing before that justifies a database.

If it fires: Supabase or Cloudflare D1. Design constraint — **children never create accounts.** Coaches (adults) create an account and hold a roster of nicknames; a kid joins with a short code and stays anonymous. That keeps you out of the hardest part of COPPA. Revisit §10 with a lawyer before writing any of it.

---

## 7. Target structure

```
baseballIQ/
├─ index.html
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/            # 192, 512, maskable, apple-touch
│  └─ og.png
├─ content/
│  ├─ scenarios.json
│  └─ scenarios.schema.json
├─ src/
│  ├─ main.ts               # bootstrap + screen routing
│  ├─ game/
│  │  ├─ geometry.ts        # P table, badge offsets — PORT VERBATIM
│  │  ├─ engine.ts          # rAF loop, particles, trail, flyBall — PORT VERBATIM
│  │  ├─ field.ts           # drawFielders / drawRunners / drawTargets / forceArrows
│  │  ├─ deck.ts            # load, validate at runtime, shuffle, difficulty ramp
│  │  ├─ state.ts           # game state machine
│  │  ├─ audio.ts
│  │  └─ speech.ts
│  ├─ ui/
│  │  ├─ scoreboard.ts
│  │  ├─ options.ts
│  │  ├─ coach.ts
│  │  └─ results.ts
│  ├─ lib/
│  │  ├─ storage.ts         # localStorage wrapper w/ fallback
│  │  └─ analytics.ts
│  └─ styles/
├─ scripts/
│  └─ validate-scenarios.ts
├─ tests/
├─ docs/
│  ├─ BUILD_BRIEF.md        # this file
│  └─ AUTHORING.md
├─ legacy/
│  └─ baseball-iq-prototype.html   # frozen reference — never edit
└─ CLAUDE.md
```

---

## 8. Scenario content model

```ts
type FielderId = "F1"|"F2"|"F3"|"F4"|"F5"|"F6"|"F7"|"F8"|"F9";

type OptionKey =
  | "first" | "second" | "third" | "home" | "pitcher"   // anchored to a base/mound
  | "cut2" | "cut6" | "cut3" | "cut5"                   // anchored to a fielder
  | "tagbase" | "hold" | "tagrunner";                   // anchored to YOUR fielder

type Concept =
  | "Who has to run" | "Counting outs" | "Double plays" | "Bunts"
  | "Catches and tag ups" | "Long throws" | "Where to run"
  | "Infield in or back" | "Watching the runner" | "Rundowns"
  | "Infield fly" | "Tricky rules";

interface Scenario {
  id: string;                       // stable slug, e.g. "force-f4-1st2nd-2out-near"
  pack: string;
  level: 1 | 2 | 3;                 // Rookie / All-Star / Pro
  concept: Concept;
  fielder: FielderId;               // who the player is
  hit: "ground" | "bunt" | "line" | "fly" | "pop";
  runners: [boolean, boolean, boolean];   // 1st, 2nd, 3rd
  outs: 0 | 1 | 2;
  situation: string;                // "Runners on 1st and 2nd"
  extra?: string;                   // "Infield is in"
  question: string;                 // one sentence, plain words
  mode?: "throw" | "go";            // "go" switches labels to "Run to 2nd base"
  options: [OptionKey, OptionKey, OptionKey];
  answer: OptionKey;
  labels?: Partial<Record<OptionKey, string>>;
  takeaway: string;                 // the big headline, ≤ 46 chars
  coaching: string;                 // 1–3 short sentences
  showForceArrows?: boolean;        // default: true for ground/bunt
}
```

### Validator rules — `scripts/validate-scenarios.ts`

**Data**
1. `id` is unique across the bank and matches `^[a-z0-9-]+$`.
2. `answer` ∈ `options`.
3. Exactly 3 options, no duplicates.
4. Every option resolves to a label (built-in or `labels` override).
5. `takeaway.length ≤ 46`.
6. `coaching.length ≥ 40`.
7. Reading level: flag any word over 8 letters not in `docs/allowed-long-words.txt` (currently: shortstop, everybody, outfielders). This is a soft gate — it should warn and require the word be added to the allowlist deliberately.

**Layout invariants — the important ones**

Every option renders as a ring (r=30) on the field plus a numbered badge (r=18) offset by the `BADGE`/`BADGEF` tables. In field coordinates, for every scenario:

| Rule | Minimum distance |
|---|---|
| Badge ↔ any fielder marker | 34 |
| Badge ↔ any chalk base label `[676,616] [500,420] [324,616] [596,732]` | 36 |
| Ring ↔ another option's ring | 60 |
| Badge ↔ another option's badge | 40 |
| Badge ↔ another option's ring | 48 |
| Badge within bounds | x ∈ [58, 942], y ∈ [48, 762] |

Also assert all 3 options produce a field marker — a scenario where one choice has no on-field anchor breaks the number-matching design that the whole UI depends on.

**Why this matters — a real example.** A scenario had a first baseman choosing between `first` ("throw to 1st") and `tagbase` ("step on the bag"). Both resolve to essentially the same spot on the field — the two rings landed 45px apart and visually merged. The scenario read fine as text and was completely ambiguous as a picture. Only the geometric check caught it. **Any new scenario is a layout problem as much as a content problem.**

---

## 9. Quality gates

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "validate": "tsx scripts/validate-scenarios.ts",
    "test": "vitest run",
    "check": "npm run typecheck && npm run validate && npm run test && npm run build"
  }
}
```

- GitHub Actions on every PR: `npm run check` + Lighthouse CI against the preview deploy.
- Vercel build command: `npm run check` (so a bad scenario cannot reach production).
- Unit tests worth having: deck construction and difficulty ramp, force-arrow derivation (which runners are forced given a runner state), scoring math, and the storage wrapper's private-mode fallback.

---

## 10. Name, URL, and hosting

### 10.1 The decision

**Name: Baseball IQ. URL: `baseball-iq.vercel.app`. No custom domain.**

Scope is one Little League. Nobody finds this through search — they get a link or scan a QR code
from a coach. At that scope the name is a label, not a brand, and buying a domain is premature.

### 10.2 Keep the rename cheap

"Baseball IQ" is the generic term of art in the sport, so it is not defensible or searchable if
this ever grows. That's an acceptable trade *now*, on one condition: **the name must live in a
single constant** (`APP_NAME`), referenced from `<title>`, the `<h1>`, the results screen, the
manifest, and eventually the OG tags. Never hardcode it in markup, never bake it into an icon or
a social image until §10.4 is resolved. Done right, a rename later is one line plus artwork.

> **Phase 0 amendment:** the constant is deferred to Phase 1 and must be injected at **build
> time**, not at runtime. Runtime injection requires shipping an empty `<title>`, and link-preview
> scrapers do not execute JavaScript — which would break the texted-link distribution path in §1.
> The "never hardcode it in markup" rule is correct in spirit; the mechanism is a build step, not
> a DOM write.

### 10.3 Vercel plan — the one real gotcha

The free **Hobby** tier easily covers this: the app is ~19KB gzipped and fully static, so 200
players for a whole season is roughly 70MB against a 100GB monthly allowance, with zero function
invocations. Load isn't the constraint.

**Commercial use is.** Hobby is restricted to personal, non-commercial projects, and Vercel reads
that broadly — a paid tier, ads, or even accepting donations makes it commercial and requires Pro
at $20/user/month. A free tool for a league is fine. Flag it to Alex the moment any of the
following is proposed: a Limber-branded launch, a coach subscription, or a donate button.

Hobby also has no overage billing — hitting a cap pauses the deployment until the cycle resets.
The failure mode is downtime, not a surprise invoice. At this scale neither will happen.

### 10.4 If this outgrows the league — read before rebranding

The earlier name, "Diamond IQ", collides with at least three live products in youth baseball:
`diamondiq.app` (game-awareness training for baseball and softball — nearly the same concept),
`diamondiqbaseball.com`, and `getdiamondiq.com`, plus the matching Instagram and TikTok handles.
"Baseball IQ" is worse in a different way: it's the generic phrase everyone in the sport already
uses, there's a `Baseball_IQ` app on the App Store, and the competing Baseball Brains app markets
itself on telling you your "Baseball IQ."

If a real product name is ever needed, the strongest candidate is the game's own tagline —
**Where's the Play** — which is the literal question the game asks and the exact phrase a coach
yells at practice. *Heads Up Ball* and *Know the Play* are the alternates.

**Check all five before committing to any name.** Checking only the domain is what produced the
collision above.

1. `.com` availability
2. App Store **and** Google Play search for the exact name
3. Instagram + TikTok handles
4. USPTO trademark search (`tmsearch.uspto.gov`), classes 9 and 41
5. Google `"exact name" baseball`, first two pages

*Not legal advice. If this becomes a real product, have a lawyer run it.*

### 10.5 Buying a domain later

Get the `.com` — for this audience it beats `.app`, because parents type `.com` regardless of what
you tell them. Roughly $10–25/year. **Cloudflare Registrar** sells at wholesale with free WHOIS
privacy; buying through **Vercel** costs slightly more but auto-configures DNS and certificates.
Avoid GoDaddy.

To wire an external domain: add it in the Vercel project's Domains settings and use **the exact
DNS records Vercel displays** — not values from a tutorial, they change. The shape is an `A`
record on the apex and a `CNAME` on `www`. If DNS is at Cloudflare, set both to **DNS only**
(grey cloud) — proxying in front of Vercel stacks two CDNs and breaks certificates. Pick one
canonical host and 301 the other. Keep the `*.vercel.app` URL alive as a fallback.

---

## 11. Compliance notes for a kids' product

Not legal advice — flag these to Alex, and get a lawyer's read before Phase 4.

- **COPPA** applies to services directed at children under 13. The safest posture, and the one v1 takes, is to **collect nothing**: no accounts, no email, no cookies, no device identifiers, no behavioral analytics tied to a person. Keep it that way as long as possible.
- Analytics must be aggregate and identifier-free. Google Analytics is the wrong choice here.
- **No advertising**, and specifically no behavioral ad networks.
- A short, plain-English privacy page saying "this app stores your score on your own device and sends nothing to us" is worth writing even though nothing requires it. Parents and coaches read it. With no custom domain there's no branded contact address yet — use a personal email, or omit the contact line entirely while the app collects nothing.
- If the app is ever submitted to the App Store under a Kids category, the rules get stricter (no third-party analytics at all, no external links without a gate). Building to that standard now costs nothing.

---

## 12. `CLAUDE.md` at the repo root

Keep it under ~150 lines — long memory files get followed less consistently. Detail lives in this
brief; `CLAUDE.md` points at it. See the file itself for current content.

---

## 13. Decisions for Alex

These are product calls, not engineering calls. Claude Code should ask rather than assume.

1. **Relationship to the existing React Native app.** This is the highest-leverage decision in the project and it should be made before Phase 2. Three options:
   - *Web is the front door* — free, no install, drives the native app. Most likely right.
   - *Web replaces native* — a PWA covers most of what the RN app does, at a fraction of the maintenance.
   - *Shared content package* — publish `content/scenarios.json` plus its schema as a versioned package both apps consume. **Recommended regardless of the above.** Write scenarios once; the alternative is two banks that silently drift apart.

2. **Is this a Limber product, a McCabe Park thing, or a personal project?** Determines whether it needs a business entity, a privacy policy naming a company, and a support address.

3. **Free forever, or is there a paid coach tier?** Doesn't change v1, but it determines whether Phase 3 gets built as team-shaped or player-shaped — and it's the trigger that forces a move off Vercel's free tier (§10.3).

4. **Content help.** The fastest way to 100 scenarios is other coaches. Is the authoring path a GitHub PR (developer-shaped) or a form (coach-shaped)? Affects Phase 2's shape.

---

## 14. Reviewing a phase plan before approving it

Claude Code should produce a plan in plan mode before writing anything. Grade it against this
before hitting approve — a plan that fails any red-flag item should be sent back rather than
edited into shape.

### 🚩 Reject the plan if it proposes any of these

| Red flag | Why it's wrong |
|---|---|
| Any framework — React, Next, Svelte, Vue | §2. The animation engine is imperative by design. |
| Scaffolding Vite, TypeScript, or a `package.json` in Phase 0 | Phase 0 has no build step. Tooling is Phase 1. |
| Splitting the file into modules | Phase 1. |
| "Refactoring", "cleaning up", or "modernizing" the game code | The prototype is the spec. Port, don't improve. |
| Touching `flyBall`, the particle system, the `P` coordinate table, or the `BADGE`/`BADGEF` offsets | §3.1. These are tuned and were validated geometrically. |
| Any change to scenario text, option labels, or coaching copy | §3.2. Tuned to a 3rd-grade reading level. |
| Adding a runtime dependency | §2. Zero runtime deps. |
| Adding tests, a service worker, or analytics | Phase 1. |
| Buying a domain, or generating OG/social images with the name on them | §10.2. |
| More than **one** functional code change in Phase 0 | Only defect #1 (`window.storage` → `localStorage`) was in scope. |

### ✅ Signs it's a good plan

- Says it read `legacy/` in full before planning.
- Identifies **exactly one** required code fix, and it's the `window.storage` → `localStorage`
  swap — including the Safari private-mode try/catch fallback.
- Includes a **manual verification step on a real device** — playing a full game at all three
  levels, checking persistence across a refresh, checking read-aloud in Safari — *before* deploy,
  not after.
- Includes the QR code deliverable.
- Names the Vercel project `baseball-iq` and selects no framework preset.
- Touches roughly 5–7 files total. A Phase 0 plan listing 20 files is doing Phase 1.
- Asks a clarifying question rather than assuming, on anything this brief doesn't cover.

### If execution drifts

After approving, say explicitly: *"Implement the plan exactly as written. Don't add anything
that isn't in the plan."* If it starts refactoring mid-execution, stop it and point at §3.
