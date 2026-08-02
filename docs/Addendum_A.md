# Baseball IQ — Addendum A: post-launch findings & next work order

Supplements `BUILD_BRIEF.md`. Written after the Phase 0 deploy to
`baseball-iq-sandy.vercel.app`. Where this conflicts with the brief's phase ordering,
**this document wins** — §A4 explains why.

---

## A1. Fix now — one session, no build step

These are shippable against the current single-file `index.html`. Do them before
distributing a single QR code.

### A1.1 🔴 The QR code points at the wrong app

The QR encodes `https://baseball-iq.vercel.app`. The app is deployed at
`https://baseball-iq-sandy.vercel.app`. Vercel appended the suffix because the
`baseball-iq` project name was already claimed in this account — so the QR currently
resolves to **a different application**.

This is the distribution mechanism. A parent scans it and lands somewhere else.

Two options, in order of preference:

1. **Free the clean name.** Rename or delete the other Vercel project holding
   `baseball-iq`, then rename this project to `baseball-iq`. The QR becomes correct
   with no regeneration, and the URL is the one on any printed material.
2. **Regenerate the QR** against the actual `-sandy` URL.

Do not skip this by assuming the QR is fine because it decoded successfully — it decoded
to a URL that was never verified to be *this* deployment. Add to the acceptance checks:
*fetch the URL the QR decodes to and assert the response body contains the app's own
`<h1>`.* Decoding proves the encoder worked; fetching proves it points at us.

### A1.2 Results bars render empty (defect #9)

`.fill` is an `<i>` and therefore `display:inline`, so `height` and `transform` don't
apply to it — the box measures 0×0 and `scaleX()` animates nothing. Bars read empty even
at 3-of-3. This is the only feedback surface a kid gets.

```css
.fill{display:block;width:100%;height:100%;border-radius:99px;
      transform-origin:left;transform:scaleX(0);
      transition:transform .9s cubic-bezier(.2,.9,.3,1)}
```

`display:block` alone is sufficient (`.track` has a definite 11px height); `width:100%`
is insurance. Note the clock bar twenty lines earlier already does this correctly
(`.clock i{display:block}`) — that's the pattern to match.

### A1.3 The three "Where to run" scenarios animate a contradiction

Scenarios #23, #24, #34 (`mode:"go"`) describe the ball going somewhere *else* — "the
ball is hit to left field, you play right field" — but `nextPlay()` unconditionally flies
the ball from home to the player's own position. The kid watches the ball come straight at
them, then gets asked where they should run.

This lands on off-ball positioning, which is the single thing youth teams botch most and
the highest-value concept in the set. Shipping it backwards is worse than not shipping it.

**Fix:** add an optional `ballTo` field naming where the ball actually goes, and have
`nextPlay()` fly there instead of to `s.you`. Then, while the question is up, mark the
player's own fielder with a pulsing ring so "you are here, where do you go" reads visually.

```js
const dest = s.ballTo ? P[s.ballTo] : P[s.you];
```

- #23 → `ballTo:"F7"` (ball to left, you're RF)
- #24 → `ballTo:"F8"` (ball to center, you're P)
- #34 → `ballTo:"F9"` (ball to right, you're SS)

For `mode:"go"` scenarios the answer marker should also read as a destination, not a
throw — consider a distinct marker treatment (dashed ring, footprint icon) so the two
question types are visually distinguishable at a glance.

### A1.4 Rookie + Long feeds 13-year-old content to 8-year-olds

`buildDeck()` is `core.concat(lower, higher)`. Level 1 has 11 core scenarios. A Long game
is 18 outs ≈ 20 plays. So **plays 12–20 of a Rookie Long game are All-Star and Pro
scenarios** — measured: 9 of ~20 plays.

Short (6 outs) and Normal (9 outs) are clean today. Long is not, and it's the mode a kid
picks when they're enjoying it.

**Interim fix:** exhaust the level, then cycle *within* it rather than escalating.

```js
function buildDeck(d, target){
  const core = shuffle(BANK.filter(s => s.d === d));
  let deck = core.slice();
  while (deck.length < target + 6) deck = deck.concat(shuffle(core.slice()));
  return deck;                       // repeat before escalating
}
```

A repeat is a worse experience than a fresh scenario, but it is a far better experience
than an 8-year-old being asked about infield fly rule. This constraint dissolves once the
bank grows (§A3) — revisit then, and consider a deliberate ramp where the *last* couple of
plays step up a level as a stretch.

### A1.5 Duplicate takeaway

#17 and #22 both headline "He's going home. Throw home." Both are All-Star, so a kid can
see both in one game. Rewrite one — #22 is the outfield-corner play, so lead on the
distance: *"Long way? Hit your cutoff man."*

### A1.6 Viewport blocks pinch-zoom

`maximum-scale=1, user-scalable=no` in the viewport meta prevents zoom. Remove both tokens.

---

## A2. Corrections to the repo assessment

Two claims in the Phase 0 assessment don't survive measurement. Recording them so they
don't propagate into planning.

| Claim | Measured | Verdict |
|---|---|---|
| "A kid hits repeats inside their first game" | `buildDeck()` returns all 36 scenarios; the first 13 plays are unique | **Wrong.** Repeats start in game *two*. Still a real retention problem, just not a game-one one. |
| "Nine of 36 answers are Throw to 1st — a kid scores 25% always picking first" | 11 of 36 (31%), vs. random-of-3 = 33% | **Not an exploit.** Always picking first is *worse* than guessing. The skew is worth correcting for teaching balance — kids should rehearse every base — but it is not a scoring loophole and shouldn't be prioritized as one. |

Everything else in the assessment holds: the concept starvation, the position skew, the
`hit:"bunt"` mislabel on the dropped-third-strike scenario (#29), and the duplicate
takeaways all check out.

---

## A3. Position selection — the feature *and* the content roadmap

**Requested:** let a player pick a position and play every question at it, or take a mix.

This is the right feature. It's also currently **blocked by content**, and that turns out
to be the useful part — the feature gives the content growth a target shape instead of a
vague "get to 100."

### A3.1 Current coverage

```
        L1  L2  L3   total
  P      1   2   0     3
  C      1   0   1     2      <- a kid who plays catcher barely appears
  1B     2   0   1     3
  2B     2   2   1     5
  3B     1   2   2     5
  SS     3   3   3     9      <- 25% of the entire bank
  LF     0   2   0     2
  CF     1   0   2     3
  RF     0   3   1     4

  Infield 27   Outfield 9
```

A position-locked 9-out game needs ~12 unique scenarios to avoid repeating. **No position
clears that.** Shipping a position picker today means a catcher gets two questions on loop.

### A3.2 Ship in two stages

**Stage 1 — now, works with the existing bank.** Offer a coarse picker:

- **Mix it up** (all 36) — default
- **Infield** (27) — comfortable at 9 outs
- **Outfield** (9) — cap at Short (6 outs) until the bank grows

Specific positions appear but are **locked with a count** — "Catcher · 2 plays · more
coming." Kids understand locked content from every game they play; it sets expectation
and it quietly tells you which position to write next.

**Stage 2 — unlock a position at 12 scenarios** (≥4 per level). Threshold in code, not
hand-maintained:

```js
const READY = 12;
const countFor = pos => BANK.filter(s => s.you === pos).length;
const unlocked = pos => countFor(pos) >= READY;
```

### A3.3 What this makes the content target

Every position × every level ≥ 4 scenarios = **108 scenarios**. That's the brief's
vague "100+" with an actual shape, and it fixes four problems at once: deck exhaustion,
concept starvation, the shortstop skew, and the catcher kid who never sees himself.

Write in **position-major order**, weakest first: C, LF, P, 1B, CF, RF, then top up 2B/3B.
Resist writing more shortstop scenarios — it's the position that's already covered and the
one that's most fun to write, which is exactly why it's over-represented.

While filling gaps, also flatten the answer distribution (currently `first` 31%, `third`
3%, `cut2` 3%) and lift the single-scenario concepts — Rundowns, Infield fly, Tricky
rules — to at least 4 each, or the results-screen bars keep reporting "1 of 1", which is
noise, and Phase 3's remediation mode has nothing to build a deck from.

### A3.4 Do the extraction first

Hand-editing 70 new scenarios into an inline array in a 68KB HTML file is exactly how the
visually-ambiguous scenario documented in §8 gets reintroduced. **Extract
`content/scenarios.json` and write the validator before writing bulk content** — including
the layout invariants, which are what caught that bug.

Both are standalone Node scripts. Neither requires Vite, TypeScript, or the module split.

---

## A4. Coach features — what's feasible, and in what order

**Requested:** a coach views his players' results and tracks progress across the team;
eventually loads GameChanger play logs to generate scenarios from real games.

The instinct that this needs chunking is correct. The three layers have wildly different
costs, and the cheapest one delivers most of the value.

### Layer 1 — Projector mode (no backend, no accounts, ~a day)

Already sketched as Phase 3 in the brief. Coach picks concepts and a length, runs it on a
TV or iPad at a team meeting, big type, no timer, a manual **Reveal** button instead of
auto-advance. The team answers out loud.

This is worth building first because of what a coach actually wants to know: *does my team
know where to throw with runners on first and second?* That's a **team aggregate**, and one
projector session answers it better than a dashboard would — the coach watches which kids
hesitate, which is information no database captures.

### Layer 2 — Result sharing (no backend, ~a day)

Kid finishes, taps **Send to coach**, gets a canvas-rendered card: name they typed, outs,
runs, per-concept bars. They text or AirDrop it. Coach collects them in the team thread.

Crude, and roughly 80% of "track my team" for 0% of the infrastructure. This is also how a
kids' game actually spreads — a coach posts a good one to the team GroupMe.

### Layer 3 — Real accounts and a roster (weeks, and a different product)

Only worth starting when a coach has asked twice, unprompted. What it drags in:

- **A backend and a database.** Supabase or D1.
- **COPPA.** The moment identifiable results are tied to named children you're in
  regulated territory. The brief's design is the right one: *coaches* hold accounts, kids
  join with a short code and exist only as a nickname, and nothing about a child is ever
  collected. Get a lawyer's read before writing any of it.
- **Vercel Pro.** A coach tier — paid, donation-supported, or Limber-branded — is
  commercial use and Hobby prohibits it. $20/user/month.
- **A privacy policy naming a real entity**, which forces §13.2 (is this Limber, a league
  project, or personal?) to be answered.

None of that is unreasonable. It's just a different project with a different budget, and
it should be triggered by demand rather than anticipation.

### Layer 4 — GameChanger, reframed

**There is no public GameChanger API** — no developer portal, no OAuth, no documented
endpoints, and no announced roadmap for one. Coaches have been asking for years. What
exists is manual CSV and PDF export from the app, and there's precedent for parsing it:
Dugout, an independent tool, is built entirely on those exports with no partnership.

So the integration is "parse a file a coach uploads," not "call an API." That's tractable —
but it's Layer 3 infrastructure plus a parser, and it should be sequenced accordingly.

**The more valuable reframe:** the interesting idea isn't tracking kids against real games,
it's *turning last Saturday's game into this week's quiz*. That's a **scenario authoring
tool for the coach**, and the simplest version needs no GameChanger at all — a form where a
coach enters runners, outs, position, and ball type, and the app generates a playable
scenario and validates it against §8. Ship that, see whether coaches use it, and let that
answer whether the export parser is worth building.

---

## A5. Recommended sequence

1. **§A1 fix list** — one session, no build step. QR first; it's the only one that's
   actively wrong in the wild.
2. **Service worker.** ~30 lines against the single file. Do **not** wait for the Vite
   refactor — the brief bundles these and it shouldn't; offline is the requirement that
   decides whether this works in a dugout, and it's independent of modularization.
3. **Extract `scenarios.json` + write the validator.** Standalone Node scripts, no Vite.
   This is the half of Phase 1 that unblocks content safely — and it's the only part of
   Phase 1 that's actually on the critical path.
4. **Content growth to the §A3.3 matrix**, position-major, weakest position first.
5. **Position picker**, Stage 1 immediately, Stage 2 as positions cross 12.
6. **Projector mode**, then result-sharing cards.
7. **Vite / TypeScript / full modularization** — whenever. It buys maintainability, not
   users, and nothing above is blocked on it.

The through-line: **content is the binding constraint, and the position picker is what
gives content its shape.** Architecture is not on the critical path right now.

---

## A6. Still unanswered — blocks step 4

Brief §13.1. Two other baseball applications are live in the same Vercel account, at
`baseball-iq.vercel.app` and `baseballiq.vercel.app` — which is why this deploy landed on
a `-sandy` suffix.

Before writing ~70 new scenarios, decide whether this is the front door, the replacement,
or a sibling. Regardless of which, **publish `scenarios.json` and its schema as a
versioned package that every app consumes.** Writing this content twice is the expensive
mistake, and content is the thing that gets added to for years.
