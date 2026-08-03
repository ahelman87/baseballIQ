# Baseball IQ — Addendum B: content architecture & skill tree

Derived from the youth-development scope-and-sequence research (USA Baseball ADM,
Little League, PCA). Supersedes the content guidance in Addendum §A3.3.

**Status: APPROVED.** §B7 resolved — see §B8. Scope narrowed to **three bands** (Rookie /
Minors / Majors); the 14U/Juniors band is deferred, since McCabe Park tops out at Majors.

---

## B1. Three bands, matching the developmental research

The original levels straddled the developmental bands:

```
  research:  8U (≤8)    10U (9–10)    12U (11–12)    [14U — out of scope]
  ours was:  Rookie (ages 8–10) ......  All-Star (11–12)  Pro (13+)
```

**The old Rookie spanned two bands with different cognitive ceilings.** An 8U player operates
in early concrete-operational thought — attention is on the ball, not on spatial relationships
between runners and bases. Decisions must be **single-variable**. A 10U player handles
**dual-variable conditional logic** — outs *and* runners, before the pitch. One tier cannot
serve both, and the old Rookie tier contained #11 (infield depth), a 12U concept.

**Three bands, shifted down — not the old three relabeled:**

| Band | Ages | Cognitive ceiling |
|---|---|---|
| **Rookie** | 8 & under | Single variable. Throw ahead of the lead runner. |
| **Minors** | 9–10 | Two variables. Outs + runners. Cutoffs, steals, rundowns, infield fly. |
| **Majors** | 11–12 | Multi-variable + conditional rules. DPs, depth, dropped third strike. |

### Why Juniors (13–14) is deferred

McCabe Park tops out at Majors, so 14U content would serve nobody today. Two things make the
deferral cheap to reverse:

- **Nothing in the existing 36 needs it.** All eleven current Pro scenarios fit Majors.
- **The three cells lost are exactly the three the renderer can't draw** — tandem cutoffs
  (two relay fielders), the wheel play (multi-fielder rotation), and holding runners/pickoffs
  (illegal below 13 regardless). The 14U tree data stays documented in §B3 for whenever it
  reopens.

Cost of the migration: re-tag 36 scenarios, shift the clock values, and rename the tiers.
**Three buttons stay three buttons — no layout work.** Do it before authoring; the same change
after 100 new scenarios is a rewrite.

## B2. Audit findings against the existing 36

**Genuinely misplaced:**

- **#11 — "Infield is back," tagged Rookie.** Dynamic infield depth is a 12U concept; the
  research's stated reason is that younger players lack the internal clock to calculate how
  depth alters throw timing. Move to Majors. This is the only *too-early* placement, and
  too-early is the direction that does harm.
- **#26 — Infield fly, tagged Pro.** Research introduces recognition at 10U. Move to Minors.
- **#29 — Dropped third strike, tagged Pro.** Research places it at 12U. Move to Majors.
  Also still carries `hit:"bunt"`, so it animates as a bunt.

**Not misplaced, despite what a naive band-mapping suggests:** the cutoff, tag-up, and
bunt scenarios currently at All-Star and Pro are the *advanced versions* of concepts
introduced earlier. They stay where they are; the gap is that the **introductory** versions
of those same concepts don't exist yet.

**Rules realism to enforce going forward:**

- Bunting is restricted or absent at 8U → **no bunt scenarios in the 8U tier.**
- Dropped third strike is barred in Little League Minors → **8U and 10U only.** Ours is
  correctly excluded from those tiers today.
- Open leadoffs are banned below 14U → **no pickoff or holding-runner scenarios below
  Juniors.** They aren't merely advanced; they're illegal at those levels.
- Steals begin once the pitch crosses the plate at 10U → steal-coverage scenarios are legal
  from Minors up.

---

## B3. The concept progression tree

*(14U column removed per §B1. Deferred cells: tandem cutoffs, wheel play,
holding runners/pickoffs — all 14U-only, all beyond the current renderer.)*

The core deliverable. Each concept has a **version per band**, not a single home. `—` means
the concept does not exist at that band.

### Ball-in-hand concepts

| Concept | Rookie (8U) | Minors (10U) | Majors (12U) |
|---|---|---|---|
| **Force plays** | Nobody on → throw to first. One target. | Force vs. tag: who *has* to run. Bases loaded → home. | Pick among several forces — closest, surest. |
| **Counting outs** | — | Two outs → any force ends it. | Outs change the *priority*: two outs vs. one run. |
| **Lead runner** | Stop the lead runner. Don't chase backward. | Look him back, then throw. | Read whether he broke or froze. |
| **Tag-ups** | — | Catch, then throw to the base he left. | Halfway reads; where he's going vs. where he was. |
| **Cutoffs & relays** | — | Single cutoff. SS for LF/CF, 2B for RF, 30–45 ft out. | Long throw → hit the cutoff, keep it low. |
| **Double plays** | — | — | Feed the bag, turn two. |
| **Bunts** | — *(restricted at 8U)* | Corner assignments; 2B covers first. | Bunt with runners on — who covers what. |
| **Rundowns** | — | Two throws max, run him back. | Rundown with a trailing runner. |
| **Infield depth** | — | — | In / back / DP depth and what each means. |

### Off-ball concepts — the ones youth teams botch most

| Concept | Rookie (8U) | Minors (10U) | Majors (12U) |
|---|---|---|---|
| **Don't swarm** | Everyone moves on every pitch — but only one player fields it. | — | — |
| **Backing up** | Pitcher backs up first on balls to the left side. OF charge in as a second wall. | Back up the base the throw is going to. | Cover the bag the relay man vacated. |
| **Steal coverage** | — | SS covers 2nd vs. RH batter, 2B vs. LH. The other backs up. | Same, plus timing off the catcher's release. |

### Rules that surprise kids

| Concept | Rookie (8U) | Minors (10U) | Majors (12U) |
|---|---|---|---|
| **Infield fly** | — | Umpire calls it → batter is out, no force left. | What to do if it's dropped. |
| **Dropped third strike** | — *(barred)* | — *(barred)* | First base open or two outs → throw to first. |

---

## B4. Renderer expressiveness — do this BEFORE authoring

**This is the finding that reorders the plan.** The scenario model can express distinctions
the *renderer cannot draw*, and the affected distinctions are exactly the ones the content
plan depends on.

### The problem, measured

Both contrast pairs in the bank animate identically:

| Pair | Difference in the text | Difference on screen |
|---|---|---|
| #12 / #13 | ball at you vs. in the hole to your right | **none** — same fielder, hit, runners, outs |
| #31 / #32 | runner on 3rd breaks vs. freezes | **none** — `moveRunners()` applies one style to all runners |

Different correct answers, same picture. A kid who reads well enough to catch "it drags you
toward first base" gets it; a kid relying on the animation — which is who this app is for —
sees two identical plays with two different answers and concludes it's arbitrary.

The engine currently varies exactly two things: where the ball lands (`ballTo`), and whether
runners advance or hold *as a group*. **Writing more contrast pairs against this multiplies a
broken thing.** Fix it before the content push.

### Required additions

**`ballZone?: "at" | "left" | "right" | "in" | "deep"`** — default `"at"`. Ball location
*relative to the player's position*, not absolute coordinates: easier to author, and the
validator can bound the offset instead of policing raw pixels. The engine offsets the
landing point ~50px in that direction and slides the fielder to meet it — **`slideYou()`
already exists** from the `mode:"go"` fix and does exactly this.

**`breaks?: [boolean, boolean, boolean]`** — which runners take off, parallel to `r`.
`moveRunners()` takes a per-runner style instead of one global style. #32 becomes
`breaks:[true,false,false]` (the forced runner goes, the man on third holds); #31 becomes
`breaks:[true,false,true]`. This is what makes "read the runner" a readable picture rather
than a sentence.

**`band: "8U" | "10U" | "12U" | "14U"`** — replaces the numeric `level`, per §B1.

**`pairId?: string`** — links contrast pairs so the validator can require them, and the deck
builder can avoid serving both halves back-to-back, which would give the second one away.

**`ruleNote?: string`** — flags band-dependent legality so the validator can assert no bunt
at 8U, no dropped third strike below 12U, no pickoff below 14U.

### Dropped from the earlier draft

**`batter: "R" | "L"` — cut.** It existed only for steal coverage, and steal coverage isn't a
handedness problem, it's a *different question type*: there's no batted ball at all, so the
app's entire ball-comes-to-you loop doesn't apply. Handedness has one narrow legitimate
post-hit use — a lefty starts a step closer and beats out slow rollers — but that's subtle,
absent from the research, and 14U at the earliest.

**Steal coverage survives, reframed as an off-ball question** using the existing
`mode:"go"`: *"Runner steals second. The shortstop is covering the bag. You're the second
baseman — where do you go?"* Renders today with no new machinery, and it teaches the actual
signature error, which isn't *who covers* but both middle infielders converging on the bag
with nobody backing up.

### No longer a concern

Tandem cutoffs and the wheel play were the two cells needing renderer work beyond the above.
Both were 14U-only and left with the Juniors band (§B1), so `ballZone` and `breaks` are the
complete list of renderer additions required.

## B5. Content targets

The position picker is deferred (§B6), so the content shape is driven by the **concept ×
band tree in §B3**, not by a position grid.

The tree has **27 live cells** (concept/band combinations that aren't `—`), down from 39
when Juniors was in scope.

1. **Every live cell ≥ 3 scenarios**, including at least one contrast pair. Floor ≈ 81;
   target **~100**, weighting foundational cells (force plays, backing up) higher than
   narrow ones (infield fly).
2. **Position spread is now a constraint, not a driver.** Since the goal is a kid learning
   what *every* position does, no position should fall below ~7% of the bank or rise above
   ~15%. Today shortstop is 25% and catcher is 5.5%. This is the same fix as before, for a
   better reason.
3. **Contrast pairs are mandatory.** The best existing scenarios are pairs — #12/#13 (same
   situation, ball near the bag vs. pulling you away, different answers) and #31/#32 (runner
   breaks vs. freezes). They teach the real lesson: *the situation alone doesn't determine
   the play.* Require ≥1 pair per live cell. **These will not come out of any curriculum
   document** — they come from having watched kids get it wrong.
4. **Flatten the answer distribution.** Currently `first` 31%, `third` 3%, `cut2` 3%. Every
   base should be roughly equally correct so kids rehearse all of them.

### The Rookie spine: the four-base lead-runner ladder

At 8U the concept is **not** "who is forced" — that's conditional logic the band can't carry.
It's **"throw ahead of the lead runner,"** one rule applied to a visible situation. Framed that
way, force outs at all four bases are single-variable and fully 8U-appropriate.

| Runners | Lead runner is going to | Coverage today |
|---|---|---|
| Nobody on | 1st | 3 |
| Runner on 1st | 2nd | 3 |
| 1st & 2nd | 3rd | **0 — gap** |
| Bases loaded | Home | 2 |

Nothing in the current Rookie tier has runners on first and second. That rung matters most:
it's the one that teaches the lead runner isn't always the one nearest home.

Build the ladder from several positions — it's the same rule seen from different places on
the field, which is exactly the "learn what all nine positions do" goal from §B6.

**The cross-band arc this creates:** at Rookie the rule is absolute — *get the lead runner*.
At Minors you learn its exception (#6, the slow chopper you can't beat, so take the sure out
at first). Learn the rule, then learn when it breaks. Every Rookie concept should have a
Minors scenario that complicates it.

### Where Rookie is actually thin

Not force plays — **off-ball**. The research names three 8U off-ball concepts and the bank has
zero of all three: don't all swarm the ball, pitcher backs up first on balls hit to the left
side, outfielders charge in as a second wall. That's half of what 8U is meant to be, and it's
the half that produces "gaggle defense."

**Sequence:** the §B4 renderer work lands *before* authoring begins. Then by band, bottom-up — finish 8U, then 10U, then 12U, then 14U. A kid can
play a complete, correctly-pitched 8U game long before the bank is finished, which means
content ships incrementally instead of in one 140-scenario batch.

Within each band, write the weakest positions first: C, LF, P, 1B, CF, RF, then top up
2B/3B. Resist writing more shortstop; it's already a quarter of the bank precisely because
it's the most fun to write.

## B6. Position picker — deferred, and replaced by rotation

**Decision: the position picker is deferred indefinitely.** The product goal is a player who
understands what *all nine* positions do, not one who drills the position he identifies with.

The research supports this directly: **prevent early positional specialization.** Players at
8U, 10U, and 12U should rotate through both infield and outfield; specialization is deferred
to 14U so every player develops complete spatial awareness. A position filter would work
against the app's own purpose at three of the four bands.

### What replaces it: rotation, which is deck logic rather than a feature

The underlying request — "my kid plays catcher and never sees catcher questions" — is about
**representation, not filtering**, and rotation answers it better:

- **No position twice in a row** in a deck. Same repair-pass pattern already used for
  scenario adjacency in `buildDeck()`.
- **Spread across a game**: a 9-out game should touch at least 5 distinct positions.
- **Surface it on the results screen** — "You played: C, SS, RF, 1B, CF…" This makes the
  all-positions goal visible to the kid instead of implicit, and it's a better answer to the
  original request than a filter would have been.

Rotation costs a few lines in the deck builder and no UI.

### The condition under which this reopens

The research endorses specialization at **14U**. If the Juniors band ever gets deep enough
per position, a position filter there is defensible. Nowhere below it.

## B7. Resolved

1. **Three bands** — Rookie / Minors / Majors (§B1). Juniors deferred.
2. **League rules** — confirmed against Little League official rules:
   - **Dropped third strike:** Majors and above only. In Minor League and Tee Ball the batter
     is out on strike three regardless of a drop. *(One local check: a league may elect to
     apply the Minor rule to Majors for the regular season.)*
   - **Leadoffs:** not permitted below 13, so **no pickoffs and no balks anywhere in scope.**
   - **Steals:** legal from Minors up, but only once the pitch reaches the batter.
3. **Tree** — accepted as written in §B3.
4. **Contrast pairs** — drafted from the research's "common youth errors" column for Alex to
   react to rather than generate. Does not block the migration session.
5. **Nothing cut** from the tree beyond the deferred 14U cells.

## B8. Session order

1. **Migration** — extract `content/scenarios.json`, three-band schema, retag the 36,
   validator band-legality, position rotation. *No renderer work.*
2. **Renderer** — `ballZone` and `breaks` (§B4). Must land before authoring.
3. **Content** — Rookie first (§B5 ladder), then Minors, then Majors.
