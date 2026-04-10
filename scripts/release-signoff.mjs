#!/usr/bin/env node
/**
 * Release signoff runner — S3-3
 *
 * Runs every pre-release gate in sequence. Exits 0 only if every step passes.
 * Prints a structured summary at the end so the result can be pasted into
 * a release note or team handoff.
 *
 * Usage:
 *   node scripts/release-signoff.mjs
 *   node scripts/release-signoff.mjs --skip-build     # skip next build (slow)
 *   node scripts/release-signoff.mjs --skip-deploy    # skip verify:deploy (needs internet)
 *
 * Required env for E2E prod smoke:
 *   E2E_EMAIL, E2E_PASSWORD, E2E_LOCALE (optional, default tr)
 *
 * The script runs E2E only if E2E_EMAIL is set. If not set it skips silently
 * with a warning so CI without credentials still gets a useful summary.
 */

import { execSync, spawnSync } from "child_process";

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const skipDeploy = args.includes("--skip-deploy");

const DUMMY_AI_KEYS = "OPENAI_API_KEY=dummy QWEN_API_KEY=dummy";

const results = [];
let allPassed = true;

function run(label, cmd, opts = {}) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log(`   ${cmd}`);
  console.log(`${"─".repeat(60)}`);

  const start = Date.now();
  const result = spawnSync(cmd, {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, ...opts.env },
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const ok = result.status === 0;
  if (!ok) allPassed = false;
  results.push({ label, ok, elapsed: `${elapsed}s`, skipped: false });
  return ok;
}

function skip(label, reason) {
  console.log(`\n⏭  ${label} — skipped (${reason})`);
  results.push({ label, ok: true, elapsed: "0s", skipped: true, reason });
}

// ─── Header ───────────────────────────────────────────────────────────────
const sha = (() => {
  try { return execSync("git rev-parse --short HEAD").toString().trim(); } catch { return "unknown"; }
})();
const branch = (() => {
  try { return execSync("git rev-parse --abbrev-ref HEAD").toString().trim(); } catch { return "unknown"; }
})();

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║          Tiramisup — Release Signoff Runner             ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log(`  Branch : ${branch}`);
console.log(`  Commit : ${sha}`);
console.log(`  Time   : ${new Date().toISOString()}`);

// ─── Gates ────────────────────────────────────────────────────────────────

// 1. Dirty worktree check
const dirty = (() => {
  try { return execSync("git status --porcelain").toString().trim(); } catch { return ""; }
})();
if (dirty) {
  console.warn("\n⚠️  Dirty worktree — uncommitted changes present:");
  console.warn(dirty.split("\n").map(l => `   ${l}`).join("\n"));
  results.push({ label: "Clean worktree", ok: false, elapsed: "0s", skipped: false });
  allPassed = false;
} else {
  results.push({ label: "Clean worktree", ok: true, elapsed: "0s", skipped: false });
}

// 2. TypeScript
run("TypeScript — npx tsc --noEmit", "npx tsc --noEmit");

// 3. Unit tests
run("Unit tests — vitest", `${DUMMY_AI_KEYS} npx vitest run`, { env: { OPENAI_API_KEY: "dummy", QWEN_API_KEY: "dummy" } });

// 4. Next.js build
if (skipBuild) {
  skip("Next.js build", "--skip-build flag set");
} else {
  run("Next.js build — npx next build", "npx next build");
}

// 5. Deploy verification against prod
if (skipDeploy) {
  skip("Deploy verification", "--skip-deploy flag set");
} else {
  run("Deploy verification — npm run verify:deploy", "npm run verify:deploy");
}

// 6. Prod E2E founder smoke
if (!process.env.E2E_EMAIL) {
  skip("Prod E2E founder smoke", "E2E_EMAIL not set — run manually with credentials");
} else {
  run(
    "Prod E2E founder smoke — playwright prod-founder-takeover",
    `npx playwright test --config playwright-prod.config.ts prod-founder-takeover`,
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────
console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║                  Release Signoff Summary                ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log(`  Branch : ${branch}  Commit : ${sha}`);
console.log(`  Time   : ${new Date().toISOString()}\n`);

for (const r of results) {
  const icon = r.skipped ? "⏭" : r.ok ? "✅" : "❌";
  const suffix = r.skipped ? `(skipped — ${r.reason})` : `(${r.elapsed})`;
  console.log(`  ${icon}  ${r.label}  ${suffix}`);
}

const failed = results.filter(r => !r.ok && !r.skipped);
const skipped = results.filter(r => r.skipped);

console.log("");
if (failed.length === 0) {
  console.log(`🟢 Signoff PASSED — ${results.length - skipped.length} gates OK, ${skipped.length} skipped`);
  console.log("   Safe to ship.\n");
  process.exit(0);
} else {
  console.log(`🔴 Signoff FAILED — ${failed.length} gate(s) did not pass:`);
  for (const f of failed) console.log(`   ✗ ${f.label}`);
  console.log("\n   Do not ship until all gates are green.\n");
  process.exit(1);
}
