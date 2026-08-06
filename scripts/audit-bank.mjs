#!/usr/bin/env node
/* Bank audit — the seed of the Phase 2 validator (BUILD_BRIEF §8).
   Zero dependencies; run as:  node scripts/audit-bank.mjs

   Reads the geometry tables and the scenario bank straight out of index.html —
   deliberately NOT a copy. If the tables move or get renamed, this script fails
   loudly instead of drifting into auditing stale geometry.

   Exit code: 0 = clean (warnings allowed), 1 = errors found, 2 = script/extraction
   failure. Per Addendum A: findings on scenarios nobody touched most likely mean a
   bug in THIS script — debug here before treating output as a findings list. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root, "index.html"), "utf8");

function slice(startMarker, endMarker) {
  const i = html.indexOf(startMarker);
  if (i < 0) throw new Error(`extraction marker not found: ${startMarker}`);
  const j = html.indexOf(endMarker, i);
  if (j < 0) throw new Error(`end marker not found after ${startMarker}: ${endMarker}`);
  return html.slice(i, j);
}

let P, anchorFor, label, BADGE, BADGEF, BANK, zoneOffset, nearestBase;
try {
  /* Geometry still comes from index.html — its single source of truth. */
  const src = [
    slice("const P = {", "const POS"),
    slice("function zoneOffset(", "/* Nearest bag"),
    slice("function nearestBase(", "/* Anchors are SEMANTIC"),
    slice("function anchorFor(", "/* two label sets"),
    slice("const L_THROW=", "/* spoken version"),          // L_THROW, L_GO, label
    slice("const BADGE=", "function drawTargets"),         // BADGE + BADGEF
    "return { P, anchorFor, label, BADGE, BADGEF, zoneOffset, nearestBase };",
  ].join("\n");
  ({ P, anchorFor, label, BADGE, BADGEF, zoneOffset, nearestBase } = new Function(src)());
  /* Scenarios come from the JSON — the file authors actually edit. */
  BANK = JSON.parse(readFileSync(join(root, "content/scenarios.json"), "utf8")).scenarios;
  if (!Array.isArray(BANK) || !BANK.length) throw new Error("scenarios.json has no scenarios array");
} catch (e) {
  console.error("EXTRACTION FAILED — index.html structure or scenarios.json changed?\n  " + e.message);
  process.exit(2);
}

/* ── ballZone chirality: assert the BASEBALL facts by name ──────────────────
   A 2B's right is toward second, his left toward first; a 3B's right is
   toward third/the line. These are checked against the real-world convention
   (facing south, your right hand points west), NOT against any scenario copy
   — the original inversion survived precisely because the check referenced
   copy that carried the same error. */
{
  const dot = (v, a, b) => v[0] * (P[b][0] - P[a][0]) + v[1] * (P[b][1] - P[a][1]);
  const facts = [
    ["F4 right → toward second", dot(zoneOffset("F4", "right"), "F4", "second") > 0],
    ["F4 left → toward first",   dot(zoneOffset("F4", "left"),  "F4", "first")  > 0],
    ["F5 right → toward third",  dot(zoneOffset("F5", "right"), "F5", "third")  > 0],
    ["F6 right → into the hole (toward third)", dot(zoneOffset("F6", "right"), "F6", "third") > 0],
  ];
  const broken = facts.filter(([, ok]) => !ok);
  if (broken.length) {
    console.error("CHIRALITY BROKEN:\n" + broken.map(([n]) => "  ✘ " + n).join("\n"));
    process.exit(2);
  }
}

/* ── invariant inputs (BUILD_BRIEF §8) ─────────────────────────────────────── */
const CHALK = [[676, 616], [500, 420], [324, 616], [596, 732]]; // 1st 2nd 3rd HOME labels
const FIELDERS = Object.entries(P).filter(([k]) => /^F\d$/.test(k));
const ALLOW = new Set(["shortstop", "everybody", "outfielders"]); // docs/allowed-long-words
const SELF = new Set(["tagbase", "hold", "tagrunner"]);           // anchored to YOUR fielder
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* ── band rules (Addendum B §B1/§B7) ─────────────────────────────────────────
   Rookie 8U · Minors 9–10 · Majors 11–12. Juniors deferred — McCabe Park tops
   out at Majors. ruleNote gates concepts illegal at lower bands per Little
   League rules, not preference. leadoff is ALWAYS an error: no leadoffs below
   13 means no pickoffs and no balks anywhere in scope. */
const BAND_ORDER = ["Rookie", "Minors", "Majors"];
const RULE_MIN = { bunt: "Minors", infieldFly: "Minors", dropped3rd: "Majors" };
const ZONES = ["at", "left", "right", "in", "deep"];

const errors = [], warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

const pairGroups = {};
const seenIds = new Set();
const alsoByTag = {};

BANK.forEach((s, idx) => {
  const id = `#${String(idx + 1).padStart(2)} [${s.you} ${s.tag}]`;

  /* ── band + schema rules ── */
  const bi = BAND_ORDER.indexOf(s.band);
  if (bi < 0) err(`${id} band "${s.band}" is not one of ${BAND_ORDER.join("/")}`);
  if ("d" in s) err(`${id} still carries the legacy numeric "d" — migration incomplete`);
  if (s.ballZone !== undefined && !ZONES.includes(s.ballZone))
    err(`${id} ballZone "${s.ballZone}" is not one of ${ZONES.join("/")}`);
  if (s.breaks !== undefined) {
    if (!Array.isArray(s.breaks) || s.breaks.length !== 3 || s.breaks.some(b => typeof b !== "boolean"))
      err(`${id} breaks must be exactly [bool,bool,bool] parallel to r`);
    else {
      s.breaks.forEach((b, bi) => {
        if (b && !s.r[bi]) err(`${id} breaks[${bi}] true but base ${bi + 1} is empty — phantom runner`);
      });
      if ((s.hit === "ground" || s.hit === "bunt") && s.ruleNote !== "dropped3rd") {
        /* Forced runners have no choice — but a squeeze or freeze play may be a
           legitimate exception, so this is a warning, not an error. Dropped third
           strike is exempt outright: the batter is out on the call, so the force
           calculation (which assumes a batter running) does not apply. */
        const forced = [s.r[0], s.r[0] && s.r[1], s.r[0] && s.r[1] && s.r[2]];
        forced.forEach((f, fi) => {
          if (f && s.r[fi] && s.breaks[fi] === false)
            warn(`${id} forced runner on base ${fi + 1} has breaks:false on a ${s.hit} — intended?`);
        });
      }
    }
  }
  if (s.ruleNote !== undefined) {
    if (s.ruleNote === "leadoff") err(`${id} ruleNote "leadoff" — no leadoffs below 13, so nothing in scope may carry it`);
    else if (!(s.ruleNote in RULE_MIN)) err(`${id} unknown ruleNote "${s.ruleNote}"`);
    else if (bi >= 0 && bi < BAND_ORDER.indexOf(RULE_MIN[s.ruleNote]))
      err(`${id} ruleNote "${s.ruleNote}" is illegal at ${s.band} (min: ${RULE_MIN[s.ruleNote]})`);
  }
  if (s.hit === "bunt" && s.ruleNote !== "bunt")
    err(`${id} hit:"bunt" without ruleNote:"bunt" — the band gate cannot see it`);
  /* ── batterRuns: no-batter plays must not draw a phantom batter ── */
  if (s.batterRuns !== undefined && typeof s.batterRuns !== "boolean")
    err(`${id} batterRuns must be boolean when present`);
  if (s.ruleNote === "infieldFly" && s.batterRuns !== false)
    warn(`${id} infield fly without batterRuns:false — the rule's premise is that the batter is out`);
  if (s.ruleNote === "dropped3rd" && s.r[0] && s.outs < 2 && s.batterRuns !== false)
    warn(`${id} dropped third strike with first occupied and under two outs — the batter is out automatically, set batterRuns:false`);
  /* ── picture vs copy: a runner described OFF a base needs breaks to draw it.
     Runner-scoped on purpose: "the ball pulls YOU way off first" is about the
     fielder and must not trip this. ── */
  const offBaseTxt = (s.ask + " " + s.sit);
  /* "takes off for home" is running, not off-base — the lookbehind keeps
     departure verbs from tripping the positional check. */
  const runnerOffBase =
    /runner[^.?!]*\b(near|(?<!takes\s)(?<!take\s)(?<!took\s)off|between|past|halfway)\b[^.?!]*\b(first|second|third|home)\b/i.test(offBaseTxt) ||
    /wandered|leaning|strayed|caught off|stuck between/i.test(offBaseTxt);
  if (runnerOffBase && !s.breaks)
    warn(`${id} describes a runner off a base but has no breaks — the picture will show him ON it (or nowhere)`);
  /* pairId: a string, or an array when one scenario belongs to several pairs
     (R05 sits in both lead-moves-ss and same-play-two-jobs). */
  if (s.pairId !== undefined) {
    const pids = Array.isArray(s.pairId) ? s.pairId : [s.pairId];
    if (!pids.length || pids.some(p => typeof p !== "string" || !p))
      err(`${id} pairId must be a non-empty string or array of strings`);
    else pids.forEach(p => (pairGroups[p] = pairGroups[p] || []).push({ id, band: s.band }));
  }
  /* id: REQUIRED — an analytics key, unique forever, never recycled. Carries
     no band prefix: an id is permanent and a band is not (three scenarios
     changed bands before analytics ever existed). */
  if (s.id === undefined) err(`${id} has no id — every scenario needs a stable analytics key`);
  else if (typeof s.id !== "string" || !/^[a-z0-9-]+$/.test(s.id))
    err(`${id} id "${s.id}" must match ^[a-z0-9-]+$`);
  else if (/^(rk|mn|mj)-/.test(s.id))
    err(`${id} id "${s.id}" carries a band prefix — bands change, ids cannot`);
  else if (seenIds.has(s.id)) err(`${id} duplicate id "${s.id}" — ids are never recycled`);
  else seenIds.add(s.id);
  /* alsoOk: dual-answer scenarios. Kept rare by design — two correct of three
     options means a random tap is right 67% of the time. */
  if (s.alsoOk !== undefined) {
    if (!Array.isArray(s.alsoOk) || !s.alsoOk.length || s.alsoOk.some(k => typeof k !== "string"))
      err(`${id} alsoOk must be a non-empty array of option keys (omit it entirely otherwise)`);
    else {
      s.alsoOk.forEach(k => {
        if (!s.opts.includes(k)) err(`${id} alsoOk "${k}" is not among its options`);
        if (k === s.ans) err(`${id} alsoOk "${k}" duplicates the primary answer`);
      });
      if (s.pairId !== undefined)
        err(`${id} has alsoOk AND pairId — a pair's whole job is that the answer changes`);
      (alsoByTag[s.tag] = alsoByTag[s.tag] || []).push(id.trim());
    }
  }

  /* ── data rules ── */
  if (!Array.isArray(s.opts) || s.opts.length !== 3) err(`${id} has ${s.opts?.length} options, need exactly 3`);
  if (new Set(s.opts).size !== s.opts.length) err(`${id} duplicate options: ${s.opts}`);
  if (!s.opts.includes(s.ans)) err(`${id} answer "${s.ans}" is not among its options`);
  for (const k of s.opts) if (label(k, s) === k) err(`${id} option "${k}" resolves to no label`);
  if (s.big.length > 46) err(`${id} takeaway is ${s.big.length} chars (max 46): "${s.big}"`);
  if (s.why.length < 40) err(`${id} coaching is ${s.why.length} chars (min 40)`);
  for (const w of (s.ask + " " + s.big + " " + s.why).toLowerCase().match(/[a-z']+/g) || []) {
    const bare = w.replace(/'/g, "");
    if (bare.length > 8 && !ALLOW.has(bare)) warn(`${id} long word "${bare}" — add to allowlist deliberately or rephrase`);
  }
  if (s.ballTo && !P[s.ballTo]) err(`${id} ballTo "${s.ballTo}" is not a fielder position`);

  /* ── distractor quality: the fallback branch must be learnable ──
     On any ground/bunt play with a live batter, some force-reachable out is
     always a real play; a scenario offering none of them can't test the
     choice it claims to teach (found by playtest: M03 offered only the tag,
     the taught-wrong bag, and an implausible base — solvable by elimination,
     with the "otherwise take the sure out" branch unlearnable). WARN, not
     error: a deliberate pure-tag drill could legitimately trip it. */
  if ((s.hit === "ground" || s.hit === "bunt") && s.mode !== "go"
      && s.tag !== "Rundowns" && !s.ruleNote) {
    const f = { first: true, second: !!s.r[0], third: !!(s.r[0] && s.r[1]), home: !!(s.r[0] && s.r[1] && s.r[2]) };
    const sure = s.opts.some(k =>
      (["first", "second", "third", "home"].includes(k) && f[k]) ||
      (k === "tagbase" && f[nearestBase(s.you)]));
    if (!sure) warn(`${id} offers no force-reachable out on a live-batter ${s.hit} — the sure-out branch can't be learned`);

    /* ── picture vs copy: hold-language with default all-advance motion ──
       Without breaks, the renderer advances EVERY runner on a ground ball.
       If the coaching note says a runner can stay, the animation contradicts
       the copy — right as text, wrong as an experience. */
    const holdLang = /(does not|doesn't|don't) have to (run|move)|can stay|stays? put|no force|not a force|can't force|cannot force/i;
    const unforcedOccupied = (s.r[0] && false) || (s.r[1] && !(s.r[0])) || (s.r[2] && !(s.r[0] && s.r[1]));
    if (!s.breaks && unforcedOccupied && (holdLang.test(s.why) || holdLang.test(s.big)))
      warn(`${id} note says a runner can stay, but with no breaks the picture animates him advancing — add breaks`);

    /* ── band simplification must be SITUATION-SAFE ──
       A band may omit a concept (Rookie teaches no DPs), but no scenario may
       depict a situation where an offered, untaught play strictly dominates
       the taught answer — a kid choosing better baseball must never be
       charged a run for it (found by playtest: 2b-r12-third taught a 233px
       cross-diamond throw while the 89px force at the fielder's own bag sat
       among the options, marked wrong). */
    if (["first", "second", "third", "home"].includes(s.ans) && !s.ballZone && s.extra !== "Infield is in") {
      const fpos = { first: P.first, second: P.second, third: P.third, home: P.home };
      const you = P[s.you];
      const dTo = b => Math.hypot(you[0] - fpos[b][0], you[1] - fpos[b][1]);
      const f = { first: true, second: !!s.r[0], third: !!(s.r[0] && s.r[1]), home: !!(s.r[0] && s.r[1] && s.r[2]) };
      const ansd = dTo(s.ans);
      for (const opt of s.opts) {
        if (opt === s.ans || !(opt in fpos) || !f[opt] || (s.alsoOk || []).includes(opt)) continue;
        /* Rule A: dominated force — an offered forced base less than ~half the
           throw is strictly better baseball than the taught answer. */
        if (dTo(opt) < 0.55 * ansd)
          err(`${id} taught throw ${s.ans}@${ansd.toFixed(0)}px is dominated by offered force ${opt}@${dTo(opt).toFixed(0)}px — a kid picking the better play gets punished`);
        /* Rule B: with two outs any force ends it — the taught force must be
           (near-)closest among offered forces. */
        else if (s.outs === 2 && f[s.ans] && dTo(opt) + 40 < ansd)
          warn(`${id} two outs: offered force ${opt}@${dTo(opt).toFixed(0)}px is meaningfully closer than taught ${s.ans}@${ansd.toFixed(0)}px`);
      }
    }
  }
  /* Fly-ball variant of picture-vs-copy: "ran when the ball was hit" language
     with no breaks means the copy asserts an early leave the picture never
     shows — and usually implies the real out is BEHIND the runner. */
  if (s.hit === "fly" && !s.breaks &&
      /(ran|left|took off) when the ball was hit|left (first|second|third) early/i.test(s.ask + " " + s.why))
    warn(`${id} fly-ball copy asserts the runner left on contact but has no breaks — picture contradicts copy, and the throw-behind may be the real out`);

  /* ── layout invariants ──
     Geometry is independent of the runtime option shuffle: order only recolors
     and renumbers. With ballZone the fielder ends the play displaced ~50px, so
     every check runs against BOTH positions — a badge that clears the home
     position may collide with the displaced one, and hold/tagrunner anchors
     MOVE with the fielder. */
  const zoff = zoneOffset(s.you, s.ballZone);
  const variants = [["home", P[s.you]]];
  if (zoff[0] || zoff[1]) variants.push(["displaced", [P[s.you][0] + zoff[0], P[s.you][1] + zoff[1]]]);

  for (const [vname, youAt] of variants) {
    const v = variants.length > 1 ? ` [${vname}]` : "";
    const marks = s.opts.map(k => {
      const a = anchorFor(k, s.you, youAt);
      if (!a) { if (vname === "home") err(`${id} option "${k}" produces NO field marker — breaks number-matching`); return null; }
      const off = k === "tagbase" ? (BADGE[nearestBase(s.you)] || [0, 42])
        : SELF.has(k) ? BADGEF[s.you] : (BADGE[k] || [0, 42]);
      return { k, ring: a, badge: [a[0] + off[0], a[1] + off[1]] };
    }).filter(Boolean);

    for (const m of marks) {
      for (const [fk, fv] of FIELDERS) {
        const fpos = fk === s.you ? youAt : fv;   // YOUR fielder stands at the variant position
        const d = dist(m.badge, fpos);
        if (d < 34) err(`${id}${v} badge(${m.k}) ↔ fielder ${fk} = ${d.toFixed(1)} (min 34)`);
      }
      for (const c of CHALK) {
        const d = dist(m.badge, c);
        if (d < 36) err(`${id}${v} badge(${m.k}) ↔ chalk label [${c}] = ${d.toFixed(1)} (min 36)`);
      }
      const [bx, by] = m.badge;
      if (bx < 58 || bx > 942 || by < 48 || by > 762) err(`${id}${v} badge(${m.k}) out of bounds at [${bx},${by}]`);
    }
    for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) {
      const a = marks[i], b = marks[j];
      const rr = dist(a.ring, b.ring), bb = dist(a.badge, b.badge);
      const br1 = dist(a.badge, b.ring), br2 = dist(b.badge, a.ring);
      if (rr < 60) err(`${id}${v} ring(${a.k}) ↔ ring(${b.k}) = ${rr.toFixed(1)} (min 60) — visually merged targets`);
      if (bb < 40) err(`${id}${v} badge(${a.k}) ↔ badge(${b.k}) = ${bb.toFixed(1)} (min 40)`);
      if (br1 < 48) err(`${id}${v} badge(${a.k}) ↔ ring(${b.k}) = ${br1.toFixed(1)} (min 48)`);
      if (br2 < 48) err(`${id}${v} badge(${b.k}) ↔ ring(${a.k}) = ${br2.toFixed(1)} (min 48)`);
    }
  }
});

/* ── alsoOk rarity: more than one per concept is the corrosive pattern ── */
for (const [tag, members] of Object.entries(alsoByTag))
  if (members.length > 1)
    warn(`concept "${tag}" has ${members.length} alsoOk scenarios (${members.join(", ")}) — cap is roughly one per concept`);

/* ── pairId groups: exactly two halves, same band ── */
for (const [pid, members] of Object.entries(pairGroups)) {
  if (members.length !== 2) err(`pairId "${pid}" has ${members.length} member(s), need exactly 2 (${members.map(m => m.id.trim()).join(", ")})`);
  else if (members[0].band !== members[1].band) err(`pairId "${pid}" spans bands ${members[0].band}/${members[1].band} — halves must sit together`);
}

/* ── report ── */
const perBand = {};
BANK.forEach(s => perBand[s.band] = (perBand[s.band] || 0) + 1);
console.log(`audited ${BANK.length} scenarios — ` + BAND_ORDER.map(b => `${b} ${perBand[b] || 0}`).join(" · "));
if (warns.length) { console.log(`\n${warns.length} warning(s):`); warns.forEach(w => console.log("  ⚠ " + w)); }
if (errors.length) { console.log(`\n${errors.length} ERROR(S):`); errors.forEach(e => console.log("  ✘ " + e)); }
else console.log("0 errors" + (warns.length ? "" : ", 0 warnings") + " — bank is clean");
process.exit(errors.length ? 1 : 0);
