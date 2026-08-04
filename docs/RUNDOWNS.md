# Removed: the six rundown-family scenarios — and the primitives that bring them back

Removed at bank 103 → 97 because the engine cannot draw what their text describes.
`drawRunners()` places runners ON bases and interpolates them *forward* along the basepath;
a rundown runner is **off a base and moving backward**. Every one of these scenarios showed a
runner standing on a bag while the copy said he was somewhere else — the picture-contradicts-
copy defect class, at the level of a missing primitive rather than a missing field.

## The six, for restoration

| id | band | premise |
|---|---|---|
| `ss-rundown-second` | Minors | runner caught between 2nd and 3rd |
| `1b-rundown-first` | Minors | runner caught between 1st and 2nd |
| `c-rundown-third` | Minors | runner caught between 3rd and home |
| `ss-rundown-lead-second` | Majors | lead runner caught, trailer creeping |
| `c-rundown-trail-third` | Majors | runner caught 3rd–home, trailer creeping |
| `1b-frozen-first` | Majors | **not a rundown** — a runner frozen OFF first. Recorded accurately: `breaks:true` draws him advancing, `false` draws him on the bag, and neither is *frozen off the bag*. It is the second client of the placement primitive. |

Their copy survives in git history (removed at the commit introducing this file); ids are
retired, not recycled — restoration should mint new ids only if the scenarios change shape.

## What it takes to bring them back

Two primitives, and they should land **together** — every "you already have the ball" premise
needs both:

1. **Runner placement**: a runner at a *fraction along a basepath*, movable in either
   direction (rundowns move backward; frozen runners don't move at all).
2. **Ball starts in the glove**: a scenario mode with no `flyBall()` flight and no bat crack —
   the play begins with the fielder holding the ball. (The steal scenarios currently
   approximate this with `ballTo`, which reads as the catcher's throw; rundowns can't be
   approximated the same way.)

## Third client, discovered during the same audit: legal tag-ups

`rf-tagup-home` (#17), `cf-tagup-third` (#27), and `lf-tagup-third` (MJ04) describe
**post-catch** running — "you catch it and the runner runs home." The animation ends at the
catch, so the picture shows the runner still at his base while the text says he is running.
These were deliberately **not** given `breaks`: a tag-up runner must be ON the bag at the
catch, so animating him during the flight would draw an *illegal early leave* — a worse lie
than a static runner. (Contrast `rf-behind-first` and `lf-fly-behind-second`, where the runner
genuinely left early — there `breaks` draws the truth and was applied.) Fixing tag-ups needs
**post-catch runner motion**, a small extension of the placement primitive.

## The gate that keeps the class out

`scripts/audit-bank.mjs` warns on runner-off-base language (`near/off/between/past/halfway` a
base, runner-scoped; `wandered/leaning/strayed/caught off/stuck between`) in a scenario with
no `breaks`. Silent on the current 97; fires on the pre-fix shapes.
