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
  /* Geometry still comes from index.html — its single source of truth. */
  const src = [
    slice("const P = {", "const POS"),
    slice("function anchorFor(", "/* two label sets"),
    slice("const L_THROW=", "/* spoken version"),          // L_THROW, L_GO, label
    slice("const BADGE=", "function drawTargets"),         // BADGE + BADGEF
    "return { P, anchorFor, label, BADGE, BADGEF };",
  ].join("\n");
  ({ P, anchorFor, label, BADGE, BADGEF } = new Function(src)());
  /* Scenarios come from the JSON — the file authors actually edit. */
  BANK = JSON.parse(readFileSync(join(root, "content/scenarios.json"), "utf8")).scenarios;
  if (!Array.isArray(BANK) || !BANK.length) throw new Error("scenarios.json has no scenarios array");
} catch (e) {
  console.error("EXTRACTION FAILED — index.html structure or scenarios.json changed?\n  " + e.message);
  process.exit(2);
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
/* Next session's renderer fields — a silently ignored field is worse than a
   missing one, so their presence is an error until the engine honors them. */
const NOT_YET = ["ballZone", "breaks"];

const errors = [], warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

const pairGroups = {};

BANK.forEach((s, idx) => {
  const id = `#${String(idx + 1).padStart(2)} [${s.you} ${s.tag}]`;

  /* ── band + schema rules ── */
  const bi = BAND_ORDER.indexOf(s.band);
  if (bi < 0) err(`${id} band "${s.band}" is not one of ${BAND_ORDER.join("/")}`);
  if ("d" in s) err(`${id} still carries the legacy numeric "d" — migration incomplete`);
  for (const f of NOT_YET) if (f in s) err(`${id} has "${f}" — the engine cannot honor it yet (next session)`);
  if (s.ruleNote !== undefined) {
    if (s.ruleNote === "leadoff") err(`${id} ruleNote "leadoff" — no leadoffs below 13, so nothing in scope may carry it`);
    else if (!(s.ruleNote in RULE_MIN)) err(`${id} unknown ruleNote "${s.ruleNote}"`);
    else if (bi >= 0 && bi < BAND_ORDER.indexOf(RULE_MIN[s.ruleNote]))
      err(`${id} ruleNote "${s.ruleNote}" is illegal at ${s.band} (min: ${RULE_MIN[s.ruleNote]})`);
  }
  if (s.hit === "bunt" && s.ruleNote !== "bunt")
    err(`${id} hit:"bunt" without ruleNote:"bunt" — the band gate cannot see it`);
  if (s.pairId) (pairGroups[s.pairId] = pairGroups[s.pairId] || []).push({ id, band: s.band });

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
