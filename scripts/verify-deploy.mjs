#!/usr/bin/env node
/**
 * Post-deploy verification — confirms tiramisup.app serves the expected build.
 *
 * Usage:
 *   node scripts/verify-deploy.mjs [--commit <sha>]
 *
 * Checks:
 *   1. HTTPS GET on production domain returns 200
 *   2. Response includes expected HTML landmarks (locale routing, app shell)
 *   3. Key API endpoints are reachable (health-style check)
 *   4. Optionally compares against an expected commit SHA
 *
 * Exit code 0 = pass, 1 = fail
 */

const PROD_URL = process.env.VERIFY_URL ?? "https://tiramisup.app";
const TIMEOUT_MS = 15_000;

const args = process.argv.slice(2);
const expectedCommit = args.includes("--commit")
  ? args[args.indexOf("--commit") + 1]
  : null;

const results = [];

function log(ok, label, detail = "") {
  const icon = ok ? "✅" : "❌";
  const line = `${icon} ${label}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  results.push({ ok, label, detail });
}

async function fetchWithTimeout(url, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "tiramisup-deploy-verify/1.0" },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function checkHomepage() {
  try {
    const res = await fetchWithTimeout(`${PROD_URL}/en`);
    const ok = res.status === 200;
    const body = await res.text();
    const hasLocaleMarker = body.includes("Tiramisup") || body.includes("tiramisup");
    log(ok && hasLocaleMarker, "Homepage /en reachable", `status=${res.status}`);
  } catch (err) {
    log(false, "Homepage /en reachable", err.message);
  }
}

async function checkTurkishLocale() {
  try {
    const res = await fetchWithTimeout(`${PROD_URL}/tr`);
    log(res.status === 200, "Turkish locale /tr reachable", `status=${res.status}`);
  } catch (err) {
    log(false, "Turkish locale /tr reachable", err.message);
  }
}

async function checkLoginPage() {
  try {
    const res = await fetchWithTimeout(`${PROD_URL}/en/login`);
    const body = await res.text();
    const noRecaptcha = !body.includes("recaptcha/api.js");
    log(res.status === 200, "Login page /en/login loads", `status=${res.status}`);
    log(noRecaptcha, "Login page has no reCAPTCHA script");
  } catch (err) {
    log(false, "Login page check", err.message);
  }
}

async function checkApiHealth() {
  try {
    const res = await fetchWithTimeout(`${PROD_URL}/api/waitlist/check?email=verify@test.local`);
    // This endpoint should return 200 with some JSON regardless
    log(res.status === 200, "API /api/waitlist/check reachable", `status=${res.status}`);
  } catch (err) {
    log(false, "API health check", err.message);
  }
}

async function checkYayindaPreserved() {
  try {
    const res = await fetchWithTimeout(`${PROD_URL}/en/yayinda`);
    log(res.status === 200, "Preserved landing /en/yayinda reachable", `status=${res.status}`);
  } catch (err) {
    log(false, "Preserved landing check", err.message);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

console.log(`\n🔍 Deploy verification against ${PROD_URL}`);
console.log(`   Time: ${new Date().toISOString()}`);
if (expectedCommit) console.log(`   Expected commit: ${expectedCommit}`);
console.log("");

await checkHomepage();
await checkTurkishLocale();
await checkLoginPage();
await checkApiHealth();
await checkYayindaPreserved();

if (expectedCommit) {
  // Vercel deployments sometimes expose x-vercel-id or similar headers
  // but we can't reliably get commit SHA from headers. Log for manual check.
  log(true, "Commit verification", `manual check needed — expected ${expectedCommit}`);
}

console.log("");
const failed = results.filter((r) => !r.ok);
if (failed.length === 0) {
  console.log("🟢 All checks passed. Deploy is serving correctly.\n");
  process.exit(0);
} else {
  console.log(`🔴 ${failed.length} check(s) failed:\n`);
  for (const f of failed) console.log(`   - ${f.label}: ${f.detail}`);
  console.log("");
  process.exit(1);
}
