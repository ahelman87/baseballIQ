# Rookie band — scenario specs for review

**Addendum B §B8 step 3, band 1 of 3.** Twenty new scenarios taking Rookie from 6 → 26.

**STATUS: APPROVED** by Alex. One change applied — R09 moved to 2 outs (§review notes).
Ready for authoring.

These are **specs, not copy.** Review the baseball, not the wording — Claude Code writes the
kid-facing text afterward using the existing 36 as few-shot examples.

**How to review:** scan the Answer column and ask "is that what I'd tell the kid?" Anything
you'd coach differently, mark it. Roughly ten minutes.

---

## The Rookie rule

Everything here teaches one thing: **throw ahead of the lead runner.** Not "who is forced" —
that's conditional logic Minors handles. One rule, applied to a picture.

Rungs 1–4 are the same rule with the lead runner one base further along each time.

---

## Ladder rung 1 — nobody on, lead runner is the batter → **1st**

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| R01 | 3B | — | 0 | Ground ball to you at third. | 1st |
| R02 | P | — | 1 | Ball comes right back to you on the mound. | 1st |
| R03 | C | — | 0 | Ball dribbles in front of the plate. You grab it. | 1st |
| R04 | LF | — | 0 | Base hit to left. The batter is running to first. | 2nd *(throw ahead of him)* |

*(existing #1 SS, #2 1B step-on-bag also live here)*

## Ladder rung 2 — runner on 1st, lead runner → **2nd**

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| R05 | SS | 1st | 0 | Ground ball to you at short. | 2nd |
| R06 | 1B | 1st | 1 | Ground ball to you, and you're off the bag. | 2nd |
| R07 | CF | 1st | 0 | Base hit to center. The lead runner rounds second. | 3rd *(throw ahead)* |

*(existing #4 2B step-on-second also live here)*

## Ladder rung 3 — 1st & 2nd, lead runner → **3rd**  ← the gap

**Zero coverage today.** This is the rung that teaches the lead runner isn't always the one
closest to home.

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| R08 | SS | 1st, 2nd | 0 | Ground ball to you at short. | 3rd |
| R09 | 3B | 1st, 2nd | **2** | Ground ball right at you. | step on the bag |
| R10 | 2B | 1st, 2nd | 1 | Ground ball to you at second. | 3rd |
| R11 | RF | 1st, 2nd | 0 | Base hit to right. Lead runner heading for third. | 3rd |
| R20 | LF | 1st, 2nd | 0 | Base hit to left. Lead runner rounding third for home. | home |

## Ladder rung 4 — bases loaded, lead runner → **home**

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| R12 | SS | loaded | 0 | Ground ball to you at short. | home |
| R13 | 3B | loaded | 1 | Ground ball to you at third. | home |
| R14 | 2B | loaded | 0 | Ground ball to you at second. | home |

*(existing #3 P, #9 C also live here)*

---

## Off-ball — the half of 8U that has zero coverage today

The research names these explicitly and the bank has none of them. All use `mode:"go"`
plus `ballTo`, which the renderer now supports.

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| R15 | P | — | 0 | Ground ball to the shortstop. Where do **you** run? | back up 1st |
| R16 | RF | — | 0 | Ground ball to third, throw going to first. Where do **you** run? | back up 1st |
| R17 | CF | 1st | 0 | Ground ball to the shortstop. Where do **you** run? | back up 2nd |
| R18 | 1B | — | 0 | Ground ball to the third baseman. Where do **you** run? | cover 1st |
| R19 | 3B | 1st | 0 | The shortstop calls for the ground ball. Where do **you** go? | cover 3rd |

**R15 is the single most-cited 8U rule in the research** — pitcher backs up first on every
ball to the left side. **R19 is the anti-gaggle scenario**: the fix for four kids swarming one
ground ball isn't "don't chase it," it's "go stand on your base."

---

## Contrast pairs

| Pair | Halves | What it teaches |
|---|---|---|
| `lead-moves-ss` | R05 / R08 | Same fielder, same ground ball. One runner on vs. two. The answer moves from 2nd to 3rd. **The lead runner is not always the one closest to you.** |
| `same-play-two-jobs` | R05 / R17 | The *identical play* — ground ball to short, runner on first. As the SS you throw to second; as the CF you run in behind it. **Every play has nine jobs, and eight of them don't involve the ball.** |
| `bag-or-throw-3b` | R01 / R09 | Same fielder, same ground ball. Nobody on → throw across to first. Two on → the out is under your foot. |

`same-play-two-jobs` is the one worth getting right. It's the clearest possible statement of
what this app is for, and nothing in the current bank does it.

---

## Resulting Rookie band

**26 scenarios.** Repetition drops from 1.8× to 0.4× at Normal length, and from 3.3× to 0.8×
at Long — no repeats in a normal game. **Flip `G.band` default back to `"Rookie"`** once this
ships (the TEMPORARY comment in the migration marks the spot).

| Position | Count | Share |
|---|---|---|
| SS | 5 | 19% |
| 3B | 4 | 15% |
| P | 3 | 12% |
| 1B | 3 | 12% |
| 2B | 3 | 12% |
| CF | 2 | 8% |
| RF | 2 | 8% |
| C | 2 | 8% |
| LF | 2 | 8% |

SS runs slightly hot at 19% against the ~15% ceiling. If you want it trimmed, R08 is the one
to reassign — but it's half of `lead-moves-ss`, so moving it costs the pair. My call is leave
it; the ratio corrects as Minors and Majors fill.

**Answer spread:** 1st ×5, 2nd ×5, 3rd ×5, home ×5, bag ×2, cover/back-up ×5. Deliberately
flat — the ladder produces this for free, which is why it's a good spine.

---

## Rules check

- **No bunts** — barred at Rookie; every ground ball here is a swinging dribbler or a
  routine grounder.
- **No dropped third strike** — Majors only.
- **No leadoffs, pickoffs, or balks** — out of scope entirely.
- **No tag-ups, no force-vs-tag, no out-count logic.** R02, R06, R10, R13 state an out count
  for realism, but the answer never depends on it. If reviewing turns up one where it does,
  that scenario belongs in Minors.

---

## Review outcome

1. **Outfield "throw ahead of the runner" plays (R04, R07, R11, R20)** — approved as specced.
2. **R09 → 2 outs.** Alex: *"it also is number of outs dependent. if it is 2 outs then
   stepping on third is the best option."* Changed. The answer is step-on-third at any out
   count, so the scenario stays single-variable — the out count is stated for realism, not as
   the deciding variable, same as R02/R06/R10/R13. A Majors companion (0 outs, step on third
   **then** throw to first for two) belongs in the double-play cell.
3. **R13 approved** — bases loaded, 3B throws home. Lead-runner rule holds.
4. **Force vs. tag is the most common real error.** Alex: *"the difference between tagging the
   base in a force out and having to tag the runner is the thing that comes up the most."*
   This does **not** change Rookie — see below — but it reshapes Minors.

### Why force-vs-tag stays out of Rookie

Rookie teaches one rule: *throw ahead of the lead runner.* Force-vs-tag requires reading base
occupancy to decide whether a runner even has to move — a second variable, and the research
places it at 10U for exactly that reason.

The ladder is the **prerequisite** that makes it learnable. Rookie: the lead runner has to run.
Minors: *except when he doesn't.* Learn the rule, then learn the exception. Introducing both at
Rookie collapses the progression.

### What it means for Minors — measured

| | Count |
|---|---|
| Scenarios where "tag the runner" is the **answer** | **0 of 36** |
| Scenarios offering it as an option at all | 1 (a distractor in the rundown) |
| Scenarios whose lesson is force-vs-tag | 2 (#7, #16) |
| Scenarios with runners on 2nd & 3rd (nobody forced) | 0 |

A kid can play a hundred games and never be asked to tag anyone. **Force-vs-tag becomes the
largest cluster in the Minors band**, not one scenario among many.

`breaks` (shipped last session) is what makes this newly teachable — the picture can now show a
runner planted on the bag rather than the kid inferring it from text. The anchor pair writes
itself: *same fielder, same ground ball, runner on 2nd alone vs. runners on 1st and 2nd.* In one
he can stay put and you have to tag him; in the other he's forced and the bag is enough.
