# Minors band — scenario specs for review

**Addendum B §B8 step 3, band 2 of 3.** Twenty-six new scenarios taking Minors from 13 → 39.

Same review method: **scan the Answer column, ask "is that what I'd tell the kid?"** Roughly
twelve minutes. Claude Code writes the copy afterward.

---

## The Minors rule

Rookie taught one rule: *throw ahead of the lead runner.* Minors teaches **the exception**:

> **He only has to run if someone's right behind him. If he doesn't have to run, the bag means
> nothing — you have to tag him.**

Per Alex, this is the most common real-world error at this age, and the app has never tested
it: **"tag the runner" is the correct answer in zero of the current 56 scenarios.** It appears
once, as a distractor. This band fixes that.

`breaks` makes it drawable — the picture now shows a runner planted on the bag instead of the
kid inferring it from text.

---

## Force vs. tag — the spine (9 total: 8 new + existing #7)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M01 | 3B | 2nd | 1 | Ground ball right at you. He stays on the bag. | 1st |
| M02 | 3B | 1st, 2nd | 1 | Ground ball right at you. | step on the bag |
| M03 | SS | 2nd | 0 | Ground ball to you. He takes off for third — you're right in his path. | **tag him** |
| M04a | 2B | 1st, 3rd | **2** | Ground ball to you at second. | step on the bag |
| M04b | 2B | 1st, 3rd | **1** | Ground ball to you. The runner on third breaks for home. | **step on the bag OR throw home — both count** |
| M05 | 1B | 2nd, 3rd | 1 | Ground ball to you next to the bag. | step on the bag |
| M06 | C | 3rd | 1 | Ball at your feet. He breaks for home. | **tag him** |
| M07 | C | loaded | 1 | Ball at your feet. He breaks for home. | step on the plate |
| M08 | 3B | 2nd, 3rd | 0 | Ground ball right at you. Both runners hold. | 1st |

**M08 is the counterintuitive one** — two runners on base and *nobody* is forced. There are
currently zero scenarios in the whole app with runners on second and third.

### M04a / M04b — the first dual-answer scenarios

Alex: *"it is number of outs dependent"* and *"both are right… the answer detail weighs the two
against each other, with the final sentence being check with your coach during the game."*

**M04a (2 outs)** — one answer. Step on second, inning over. The run doesn't count even if he
crosses the plate first. Straightforward.

**M04b (1 out)** — **both `tagbase` and `home` are correct.** Third option (`third`) is the
clean distractor: nobody is going to third.

> **Takeaway:** "Both work. Ask your coach."
> **Why:** "Stepping on second is the sure out, and the run scores. Throwing home can stop the
> run, but it's a long throw and a miss puts two runners in scoring position. Ask your coach
> what he wants — it depends on the score and the inning."

Option-set geometry pre-verified clean for a 2B: rings at second/home/third, all pairwise
distances well past the invariants.

### The rule that keeps this rare

Dual answers are powerful and would wreck the game if they spread. The line:

- **Deciding factor visible in the picture** — outs, runners, ball location → **split into two
  scenarios.** The kid should learn to read it. *(This is why M04 splits on outs at all.)*
- **Deciding factor outside the picture** — score, inning, who's running, whose arm → **dual
  answer, ending in "ask your coach."** *(This is why M04b stays dual at one out.)*

**Guessability:** two correct of three options means a random tap is right 67% of the time,
versus 33%. Negligible at 2 of 38; corrosive at 20%. Cap dual-answer scenarios at **roughly one
per concept cluster**, and never inside a contrast pair — a pair's whole job is that the answer
changes.

### Engine change required

`alsoOk?: OptionKey[]` — optional, defaults empty, backward compatible with all 56 existing
scenarios.

- `answer()`: correct if `key === ans || alsoOk.includes(key)`. Scoring, streak, and outs behave
  normally — an out is an out.
- **Both correct options render `✓`**, the chosen one highlighted. The kid must see that the
  other one was also fine, or the note contradicts the screen.
- Callout stays `OUT!`; the small line reads `ALSO GOOD` when the player picked an `alsoOk`
  answer rather than the primary.
- The correct-answer replay animates the player's own choice, not the primary.
- **Validator:** `alsoOk` entries must be in `options` and must not equal `ans`; a scenario with
  `alsoOk` must not carry a `pairId`; warn if more than one scenario per concept has it.

Small session — same class as `toFielder`, and the two should ship together before Majors.

## Counting outs (4 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M09 | SS | 1st, 2nd | 2 | Ground ball deep in the hole. Third is a long throw. | 2nd *(closest force ends it)* |
| M10 | 1B | 3rd | 2 | Ground ball to you. He breaks for home. | step on the bag |

## Lead runner (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M11 | CF | 1st | 0 | Base hit to center. The lead runner is rounding second hard. | 3rd |

## Tag-ups (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M12 | LF | 2nd | 1 | Fly ball you catch. He wandered too far off second. | 2nd |

## Cutoffs and relays (4 total)

Research: shortstop is the cutoff for left and center, second baseman for right, 30–45 feet out.

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M13 | LF | 1st | 1 | Ball into the gap. He's going first to third. | relay — shortstop |
| M14 | CF | 2nd | 0 | Ball rolls to the fence. He's coming home. | relay — shortstop |
| M15 | RF | 1st | 0 | Base hit past you. He's digging for third. | relay — 2nd baseman |

## Bunts (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M16 | 3B | 1st | 0 | Bunt up the third base line. You charge and field it. | 1st |
| M17 | 1B | 1st | 0 | Bunt down the first base line. You charge off the bag. | 1st *(2B is covering)* |

## Rundowns (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M18 | 1B | 1st | 1 | He's caught between first and second. You have the ball. | 1st *(run him back)* |
| M24 | C | 3rd | 1 | He's caught between third and home. | 3rd *(run him back)* |

## Backing up (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M19 | P | 2nd | 1 | Base hit to left, throw going to third. Where do **you** run? | back up 3rd |

## Steal coverage (3 total) — currently zero coverage

Reframed as off-ball questions with coverage already assigned, so no batter-handedness field is
needed. The signature error isn't *who* covers — it's **both middle infielders converging on
the bag with nobody backing up.**

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M20 | 2B | 1st | 0 | He steals. The shortstop calls that he's covering. Where do **you** go? | back up 2nd |
| M21 | SS | 1st | 0 | He steals. You called it — you're covering. Where do **you** go? | 2nd |
| M22 | CF | 1st | 1 | He steals. The catcher throws. Where do **you** run? | back up 2nd |

## Infield fly (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| M23 | 2B | 1st, 2nd | 1 | Pop up. Umpire calls infield fly. You catch it. | hold the ball |
| M25 | **P** | 1st, 2nd | 0 | Pop up right over your head on the mound. Umpire calls infield fly. | hold the ball |

---

## Contrast pairs

| Pair | Halves | What it teaches |
|---|---|---|
| `forced-or-not-3b` | M01 / M02 | **The anchor.** Same fielder, same ground ball. Runner on second alone → he can stand there, so go get the batter. Add a runner on first → now he *has* to run, and the bag under your foot is the out. |
| `tag-or-plate-c` | M06 / M07 | Same catcher, same ball at his feet, same runner breaking from third. Nobody else on → you must tag him. Bases loaded → the plate is enough. **The runner did the identical thing; only what's behind him changed.** |
| `who-covers-the-steal` | M20 / M21 | Same steal, two jobs. As the shortstop you take the bag; as the second baseman you get behind it. Directly targets both-middle-infielders-converging. |

`tag-or-plate-c` is the sharpest statement of the concept in the whole set — the runner's
behavior is identical in both frames, and only the other two bases differ.

---

## Resulting Minors band: 38 scenarios

| Cell | Before | After |
|---|---|---|
| **Force vs. tag** | 1 | **9** |
| Counting outs | 2 | 4 |
| Lead runner | 2 | 3 |
| Tag-ups | 2 | 3 |
| Cutoffs and relays | 1 | 4 |
| Bunts | 1 | 3 |
| Rundowns | 1 | 3 |
| Backing up | 2 | 3 |
| **Steal coverage** | 0 | **3** |
| Infield fly | 1 | 3 |

Position spread after moving M25 from 3B to P: **3B 6 (16%), SS 6 (16%)**, 1B 5, CF 4, RF 4,
P 4, 2B 3, C 3, LF 3. Inside the guideline.

*(An earlier draft said "SS highest at 7" — wrong; 3B was the hot one at 7 before the M25 move.
Five new force-vs-tag and infield-fly scenarios are third basemen, which is what tipped it.)*

**"Tag the runner" becomes a correct answer for the first time** (M03, M06).

**Note for the Majors batch: Majors currently has zero pitcher scenarios** (2B 4, SS 4, 3B 3,
CF 2, then RF/LF/C/1B at 1 each, P at 0). Weight that batch toward P, C, LF, and 1B.

---

## One schema gap this surfaced — not blocking

Two legitimate concepts have no option key and can't be authored yet:

- **"Run out and be the cutoff man"** — the infielder's half of a relay. Only the outfielder's
  half (`cut6`, `cut2`) is expressible.
- **"Back up another fielder"** — as opposed to backing up a base. There's no key for
  *"go stand behind the center fielder."*

Both need a `toFielder` option key resolving to `P[Fn]`. Small addition, but it's renderer
work and this batch is content — worth doing before Majors, since tandem-relay-adjacent
scenarios will want it.

---

## What I need marked — narrowed to two

Three of my original five are settled by the research already in hand. They're flagged
**confirm-or-override**, not decisions: say nothing and they ship as written.

- **M09** *(confirm-or-override)* — two outs, shortstop deep in the hole, short force at second
  rather than the lead runner at third. Research: *"If there are two outs, any force out ends
  the half-inning."* Deliberately contradicts the Rookie rule; that contrast is the lesson.
- **M17** *(confirm-or-override)* — second baseman covers first when the first baseman charges
  a bunt. Research names *"first baseman charging without second baseman covering first base"*
  as a common youth error, so 2B covering is the standard. Override if your pitcher takes it.
- **M13/M14/M15** *(confirm-or-override)* — shortstop is the cutoff for left and center, second
  baseman for right, 30–45 feet out. Straight from the research.

**Resolved:** M04 → split into M04a (2 outs, one answer) and M04b (1 out, dual answer). See
above.

**The one that still needs you:**

1. **Force-vs-tag gaps.** You said it's what comes up most. Nine scenarios is my read of
   "largest cluster" — but if there's a version of the mistake you watch every Saturday that
   isn't in here, that's the highest-value addition in the batch. The nine cover: he's not
   forced so throw to first (M01, M08), he's not forced and running so tag him (M03, M06),
   he's forced so use the bag (M02, M07), and mixed states where one runner is forced and one
   isn't (M04, M05, plus existing #7).
