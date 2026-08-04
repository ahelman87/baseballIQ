# Majors band — scenario specs for review

**Addendum B §B8 step 3, band 3 of 3 — the last one.** Twenty new scenarios taking Majors from
17 → 37, and the bank from 82 → 102.

Same review method: **scan the Answer column, ask "is that what I'd tell the kid?"** ~10 minutes.

---

## The Majors rule

The three bands form a progression, and this is the top of it:

| Band | The idea |
|---|---|
| **Rookie** | One rule. *Throw ahead of the lead runner.* |
| **Minors** | The exception. *He only has to run if someone's behind him — otherwise tag him.* |
| **Majors** | **Weighing.** *Two things are both worth having. The count, the score, and where the ball is decide which one you take.* |

That's why Majors is where double plays, infield depth, and the conditional rules live. The kid
already knows what's possible; this band is about choosing.

---

## Position weighting

Majors is the most lopsided band: **zero pitcher scenarios**, and C, LF, 1B, RF at one each.
This batch corrects that deliberately — 16 of the 20 go to P, C, LF, RF, and 1B.

---

## Counting outs — the count changes the priority (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ01 | C | 3rd | 2 | Dribbler in front of the plate. He breaks for home. | 1st |
| MJ02 | CF | 2nd | 2 | Base hit. He's rounding third, digging for home. | home |

**MJ01 is the one that matters** — with two outs the instinct is to chase the run, but getting
the batter ends the inning and the run never counts.

## Reading the runner (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ03 | P | 3rd | 1 | Comebacker to the mound. The runner on third doesn't move. | 1st |

## Tag-ups — where he's going, not where he was (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ04 | LF | 2nd | 1 | Deep fly. You catch it. He tags and goes for third. | 3rd |

## Cutoffs and relays — long throw, hit the cutoff (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ05 | LF | 1st | 0 | Ball in the gap. He's rounding second, going for third. | relay — shortstop |
| MJ06 | CF | 2nd | 1 | Ball to the wall. He's coming all the way around to score. | relay — shortstop |

## Double plays — feed the bag (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ07 | 3B | 1st | 0 | Ground ball to you at third. | 2nd *(start two)* |

## Bunts — who covers what (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ08 | C | 1st, 2nd | 0 | Bunt down the third base line. The third baseman charges it. Where do **you** go? | cover 3rd |
| MJ09 | P | 1st, 2nd | 0 | Bunt right in front of the mound. You field it clean. | 1st |

**MJ08 is the Majors bunt lesson** — the corner charges, so somebody has to fill the bag he
left, and it's the catcher.

## Rundowns — with a trailing runner (4 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ10 | SS | 1st, 2nd | 1 | Lead runner caught between second and third. The other runner is right behind him. | 2nd *(run the lead man back)* |
| MJ11 | C | 2nd, 3rd | 1 | Runner caught between third and home. The runner from second is creeping up. | 3rd |
| MJ12 | 1B | 1st | 0 | He's caught off first. You have the ball and he's frozen. | 1st |

## Infield depth — in, back, or double-play (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ13 | 1B | 3rd | 0 | The infield is **in**. Ground ball to you. | home |

## Backing up — cover the bag the relay man left (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ14 | RF | 2nd | 1 | Base hit to left, throw going home. Where do **you** run? | back up 2nd |
| MJ15 | P | 1st | 1 | Base hit to right. The throw is going to third. Where do **you** run? | back up 3rd |

## Infield fly — what happens when it drops (2 new)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ16 | SS | 1st, 2nd | 1 | Infield fly called. **You drop it.** The runner on second takes off for third. | **tag him** |
| MJ17 | 2B | 1st, 2nd | 0 | Infield fly called. The ball drops. Nobody runs. | hold the ball |

**MJ16 is the best scenario in the batch.** The batter is already out, so no one is forced —
which means the bag is worthless and you have to tag him. It's the infield fly rule and the
force-vs-tag lesson in a single play, and it's exactly the moment youth teams fall apart.

## Dropped third strike (3 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ18 | C | 1st | 1 | Strike three gets past you — but **first base is occupied** and there's one out. | hold the ball |
| MJ19 | 1B | — | 2 | Strike three gets past the catcher. Two outs. Where do **you** go? | cover 1st |

**MJ18 is the rule's other half.** Every dropped-third-strike scenario so far teaches "he can
run." This one teaches when he can't — first occupied with fewer than two outs and the batter
is out automatically.

## Force choice — pick the surest one (4 total)

| ID | Pos | On | Outs | Play | Answer |
|---|---|---|---|---|---|
| MJ20 | P | loaded | 1 | Comebacker to the mound. | home |

**Deliberate contrast with existing #15** (SS, bases loaded, one out → second to start two).
From the mound home is a five-foot toss and a certain out; from short it's a long throw that
gets one when two were available. *Same bases, same count, different answer because of where
you're standing.* Not a formal pair — different fielders — but the coach notes should point
at each other.

---

## Contrast pairs

| Pair | Halves | What it teaches |
|---|---|---|
| `drop-or-hold-if` | MJ16 / MJ17 | Same call, same drop, same two runners. One runs — you tag him. Nobody runs — you hold. **The batter being out already is what makes the bag worthless.** |
| `can-he-run-3rd-strike` | MJ18 / existing #29 | Strike three gets past the catcher. First base empty → he runs, throw to first. First base occupied with under two outs → he's out, hold it. Both halves are Majors. |

---

## Resulting Majors band: 37 scenarios

| Cell | Before | After |
|---|---|---|
| Force choice | 3 | 4 |
| Counting outs | 1 | 3 |
| Reading the runner | 2 | 3 |
| Tag-ups | 2 | 3 |
| Cutoffs and relays | 1 | 3 |
| Double plays | 2 | 3 |
| Bunts | 1 | 3 |
| **Rundowns** | 0 | **3** |
| Infield depth | 2 | 3 |
| Backing up | 1 | 3 |
| **Infield fly (dropped)** | 0 | **2** |
| Dropped third strike | 1 | 3 |

**Position spread:** SS 6, C 5, 2B 5, 3B 5, P 5, LF 3, CF 4, RF 3, 1B 4 — hot position drops
from 24% to 16%, and **P goes from zero to five.**

**Bank total: 102** — Rookie 26, Minors 39, Majors 37.

---

## `toFielder`: recommend dropping it permanently

Nothing in these twelve cells is blocked by it. The only concept that wants a non-base target
is the *infielder's* half of a relay — "run out and line up" — and the outfielder's half is
already covered by `cut2`/`cut6`.

More importantly it's the **wrong primitive**: a cutoff man doesn't stand on the outfielder, he
stands ~40 feet in front of him on the line to the target base. That's a computed point. If the
concept ever becomes necessary, the right field is something like
`relay:{from:"F7", to:"home"}` with the anchor computed along that line — not a fielder id.

Adding a field that's semantically wrong for its single use case is worse than not having it.

---

## What I need marked

1. **MJ20** — pitcher, bases loaded, one out, comebacker. I have him throwing home rather than
   starting two, on the grounds that from the mound it's a short certain out. That's the
   deliberate opposite of #15 from shortstop. Confirm, because it's the one place in the bank
   where the same situation gets two different answers by position.
2. **MJ09** — pitcher fields a bunt with runners on first and second. I have him taking the
   sure out at first. If you'd want a clean early field to go to third, that's an `alsoOk`
   candidate — bunts currently have none.
3. **MJ13** — infield in with nobody out, ground ball to the first baseman, throw home. First
   basemen are usually the weakest arm on a youth team. Is that a throw you'd want, or would
   you rather he take the out?
4. **Anything the Majors kids blow** that isn't in the twelve cells — same question that
   produced the force-vs-tag spine for Minors, and it's the highest-value input here too.
