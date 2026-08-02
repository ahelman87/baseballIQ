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

let P, anchorFor, label, BADGE, BADGEF, BANK;
try {
  const src = [
    slice("const P = {", "const POS"),
    slice("function anchorFor(", "/* two label sets"),
    slice("const L_THROW=", "/* spoken version"),          // L_THROW, L_GO, label
    slice("const BADGE=", "function drawTargets"),         // BADGE + BADGEF
    slice("const BANK=[", "/* ═══════ SOUND"),
    "return { P, anchorFor, label, BADGE, BADGEF, BANK };",
  ].join("\n");
  ({ P, anchorFor, label, BADGE, BADGEF, BANK } = new Function(src)());
} catch (e) {
  console.error("EXTRACTION FAILED — index.html structure changed?\n  " + e.message);
  process.exit(2);
}

/* ── invariant inputs (BUILD_BRIEF §8) ─────────────────────────────────────── */
const CHALK = [[676, 616], [500, 420], [324, 616], [596, 732]]; // 1st 2nd 3rd HOME labels
const FIELDERS = Object.entries(P).filter(([k]) => /^F\d$/.test(k));
const ALLOW = new Set(["shortstop", "everybody", "outfielders"]); // docs/allowed-long-words
const SELF = new Set(["tagbase", "hold", "tagrunner"]);           // anchored to YOUR fielder
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const errors = [], warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

BANK.forEach((s, idx) => {
  const id = `#${String(idx + 1).padStart(2)} [${s.you} ${s.tag}]`;

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

  /* ── layout invariants ──
     Geometry is independent of the runtime option shuffle: order only recolors
     and renumbers; anchors and badge offsets depend on the key and s.you alone. */
  const marks = s.opts.map(k => {
    const a = anchorFor(k, s.you);
    if (!a) { err(`${id} option "${k}" produces NO field marker — breaks number-matching`); return null; }
    const off = SELF.has(k) ? BADGEF[s.you] : (BADGE[k] || [0, 42]);
    return { k, ring: a, badge: [a[0] + off[0], a[1] + off[1]] };
  }).filter(Boolean);

  for (const m of marks) {
    for (const [fk, fv] of FIELDERS) {
      const d = dist(m.badge, fv);
      if (d < 34) err(`${id} badge(${m.k}) ↔ fielder ${fk} = ${d.toFixed(1)} (min 34)`);
    }
    for (const c of CHALK) {
      const d = dist(m.badge, c);
      if (d < 36) err(`${id} badge(${m.k}) ↔ chalk label [${c}] = ${d.toFixed(1)} (min 36)`);
    }
    const [bx, by] = m.badge;
    if (bx < 58 || bx > 942 || by < 48 || by > 762) err(`${id} badge(${m.k}) out of bounds at [${bx},${by}]`);
  }
  for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) {
    const a = marks[i], b = marks[j];
    const rr = dist(a.ring, b.ring), bb = dist(a.badge, b.badge);
    const br1 = dist(a.badge, b.ring), br2 = dist(b.badge, a.ring);
    if (rr < 60) err(`${id} ring(${a.k}) ↔ ring(${b.k}) = ${rr.toFixed(1)} (min 60) — visually merged targets`);
    if (bb < 40) err(`${id} badge(${a.k}) ↔ badge(${b.k}) = ${bb.toFixed(1)} (min 40)`);
    if (br1 < 48) err(`${id} badge(${a.k}) ↔ ring(${b.k}) = ${br1.toFixed(1)} (min 48)`);
    if (br2 < 48) err(`${id} badge(${b.k}) ↔ ring(${a.k}) = ${br2.toFixed(1)} (min 48)`);
  }
});

/* ── report ── */
console.log(`audited ${BANK.length} scenarios`);
if (warns.length) { console.log(`\n${warns.length} warning(s):`); warns.forEach(w => console.log("  ⚠ " + w)); }
if (errors.length) { console.log(`\n${errors.length} ERROR(S):`); errors.forEach(e => console.log("  ✘ " + e)); }
else console.log("0 errors" + (warns.length ? "" : ", 0 warnings") + " — bank is clean");
process.exit(errors.length ? 1 : 0);
