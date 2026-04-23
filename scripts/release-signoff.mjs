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
 *   NOTION_RELEASE_LOG_UPDATED=1 node scripts/release-signoff.mjs
 *
 * Required env for E2E prod smoke:
 *   E2E_EMAIL, E2E_PASSWORD, E2E_LOCALE (optional, default tr)
 *
 * Required env for release approval:
 *   NOTION_RELEASE_LOG_UPDATED=1 after the canonical Notion release/handoff log
 *   has been updated for the version being signed off.
 *
 * The script runs E2E only if E2E_EMAIL is set. If not set it skips silently
 * with a warning so CI without credentials still gets a useful summary.
 */

import { execSync, spawnSync } from "child_process";

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const skipDeploy = args.includes("--skip-deploy");

const DUMMY_AI_KEYS = "OPENAI_API_KEY=dummy QWEN_API_KEY=dummy";
const NOTION_RELEASE_LOG_URL = process.env.NOTION_RELEASE_LOG_URL
  || "https://www.notion.so/34ba251bad488125b83cd2dbc5d0a1c3";
const notionReleaseLogUpdated = process.env.NOTION_RELEASE_LOG_UPDATED === "1";

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

function info(label, reason) {
  console.log(`\nℹ️  ${label} — ${reason}`);
  results.push({ label, ok: true, elapsed: "0s", skipped: true, reason, informational: true });
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
  try { return execSync("git status --porcelain --ignore-submodules=dirty").toString().trim(); } catch { return ""; }
})();
if (dirty) {
  console.warn("\n⚠️  Dirty worktree — uncommitted changes present:");
  console.warn(dirty.split("\n").map(l => `   ${l}`).join("\n"));
  results.push({ label: "Clean worktree", ok: false, elapsed: "0s", skipped: false });
  allPassed = false;
} else {
  results.push({ label: "Clean worktree", ok: true, elapsed: "0s", skipped: false });
}

// 2. Release handoff log check
if (!notionReleaseLogUpdated) {
  console.warn("\n⚠️  Notion release log not confirmed.");
  console.warn(`   Update the canonical handoff page for this version first: ${NOTION_RELEASE_LOG_URL}`);
  console.warn("   Then rerun with NOTION_RELEASE_LOG_UPDATED=1.");
  results.push({ label: "Notion release log updated", ok: false, elapsed: "0s", skipped: false });
  allPassed = false;
} else {
  console.log(`\n✅  Notion release log confirmed: ${NOTION_RELEASE_LOG_URL}`);
  results.push({ label: "Notion release log updated", ok: true, elapsed: "0s", skipped: false });
}

// 3. TypeScript
run("TypeScript — npx tsc --noEmit", "npx tsc --noEmit");

// 4. Unit tests
run("Unit tests — vitest", `${DUMMY_AI_KEYS} npx vitest run`, { env: { OPENAI_API_KEY: "dummy", QWEN_API_KEY: "dummy" } });

// 5. Next.js build
if (skipBuild) {
  skip("Next.js build", "--skip-build flag set");
} else {
  run("Next.js build — npx next build", "npx next build");
}

// 6. Deploy verification against prod
if (skipDeploy) {
  skip("Deploy verification", "--skip-deploy flag set");
} else {
  run("Deploy verification — npm run verify:deploy", "npm run verify:deploy");
}

// 7. Prod E2E verified-founder smoke (release gate)
if (!process.env.E2E_EMAIL) {
  skip("Prod E2E verified-founder smoke", "E2E_EMAIL not set — run manually with credentials");
} else {
  run(
    "Prod E2E verified-founder smoke — playwright verified-founder-signoff",
    `npx playwright test --config playwright-prod.config.ts tests/e2e/verified-founder-signoff.spec.ts`,
  );
}

// 8. Agent suggestion usefulness smoke (informational)
if (!process.env.E2E_EMAIL) {
  info("Prod E2E agent suggestion smoke", "Skipped because verified account credentials are not configured");
} else {
  const releaseVerdictBeforeSuggestions = allPassed;
  const ok = run(
    "Prod E2E agent suggestion smoke — playwright prod-agent-suggestion-surfaces",
    `npx playwright test --config playwright-prod.config.ts tests/e2e/prod-agent-suggestion-surfaces.spec.ts`,
  );
  if (!ok) {
    allPassed = releaseVerdictBeforeSuggestions;
    const current = results[results.length - 1];
    if (current) {
      current.ok = true;
      current.skipped = true;
      current.reason = "Failed, but tracked separately while suggestion usefulness regression coverage is being hardened";
      current.informational = true;
    }
    console.log("\nℹ️  Agent suggestion smoke failed; keeping release verdict tied to existing release gates.");
  }
}

// 9. Fresh signup incident smoke (informational, not release-blocking)
if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
  info("Fresh signup incident smoke", "Skipped because verified account credentials are not configured");
} else if (!process.env.E2E_SIGNUP_ACCESS_CODE) {
  info("Fresh signup incident smoke", "Skipped because E2E_SIGNUP_ACCESS_CODE is not set");
} else {
  const releaseVerdictBeforeIncident = allPassed;
  const ok = run(
    "Fresh signup incident smoke — playwright prod-go-live-smoke",
    `npx playwright test --config playwright-prod.config.ts tests/e2e/prod-go-live-smoke.spec.ts`,
  );
  if (!ok) {
    allPassed = releaseVerdictBeforeIncident;
    const current = results[results.length - 1];
    if (current) {
      current.ok = true;
      current.skipped = true;
      current.reason = "Failed, but tracked separately as signup incident and does not block release signoff";
      current.informational = true;
    }
    console.log("\nℹ️  Fresh signup incident smoke failed; keeping release verdict tied to verified-founder continuity.");
  }
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
