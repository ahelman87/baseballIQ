# Minors band — scenario specs for review

**Addendum B §B8 step 3, band 2 of 3.** Twenty-five new scenarios taking Minors from 13 → 38.

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
| M04 | 2B | 1st, 3rd | 1 | Ground ball to you at second. | step on the bag *(don't chase 3rd)* |
| M05 | 1B | 2nd, 3rd | 1 | Ground ball to you next to the bag. | step on the bag |
| M06 | C | 3rd | 1 | Ball at your feet. He breaks for home. | **tag him** |
| M07 | C | loaded | 1 | Ball at your feet. He breaks for home. | step on the plate |
| M08 | 3B | 2nd, 3rd | 0 | Ground ball right at you. Both runners hold. | 1st |

**M08 is the counterintuitive one** — two runners on base and *nobody* is forced. There are
currently zero scenarios in the whole app with runners on second and third.

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
| M25 | 3B | 1st, 2nd | 0 | Pop up drifting toward you. Umpire calls infield fly. | hold the ball |

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

Position spread runs 8–18% (SS highest at 7 of 38, 2B/C/LF/P lowest at 3 each) — inside the
guideline. **"Tag the runner" becomes a correct answer for the first time** (M03, M06).

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

## What I need marked

1. **M04** — 2B with first and third, ground ball. I have him stepping on second and ignoring
   the runner on third. Some coaches want a look home first at this age.
2. **M09** — shortstop deep in the hole with two outs, throwing to second rather than third.
   That's "closest force ends it." Confirm you'd teach the short throw over the lead runner
   here, since it directly contradicts the Rookie rule.
3. **M17** — first baseman charging a bunt and throwing to first with the second baseman
   covering. Is that how your league plays it, or does the pitcher take that bag?
4. **M13/M14/M15** — cutoff responsibilities. Research says shortstop for left and center,
   second baseman for right. Confirm, or tell me how you assign it.
5. **Anything missing** on force-vs-tag specifically. You said it's what comes up most — nine
   scenarios is my read of "largest cluster," but if there's a version of the mistake you see
   that isn't in here, that's the one worth adding.
