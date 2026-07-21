#!/usr/bin/env node
// Unauthenticated smoke crawl of a deployed staging URL. Proves the public
// surface renders and the redirect layer holds after the redesign merge.
// The authenticated write/email flows are hand-checked (see docs/STAGING_TEST.md).
//
// Usage:  BASE=https://sheepdogsociety-staging.vercel.app node scripts/verify-staging.mjs
//    or:  node scripts/verify-staging.mjs https://sheepdogsociety-staging.vercel.app

const BASE = (process.env.BASE ?? process.argv[2] ?? "").replace(/\/$/, "");
if (!BASE) {
  console.error("Set BASE or pass the staging URL as the first argument.");
  process.exit(2);
}

let fail = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${msg}`);
  if (!ok) fail++;
};

// a) every public room returns 200 (including the new /subscribe page)
const PAGES = [
  "/", "/letter", "/groups", "/events", "/resources", "/about", "/join",
  "/new-here", "/support", "/contact", "/acts-20-28", "/subscribe",
  "/privacy", "/sms-terms",
];
for (const p of PAGES) {
  try {
    const res = await fetch(BASE + p, { redirect: "manual" });
    check(res.status === 200, `${p} -> 200 (got ${res.status})`);
  } catch (e) {
    check(false, `${p} fetch failed (${e})`);
  }
}

// b) a representative set of retired URLs still redirect to their live room
const REDIRECTS = {
  "/encouragements": "/letter",
  "/locations": "/groups",
  "/get-started": "/new-here",
  "/giving": "/support",
  "/blog": "/letter",
  "/devotionals": "/letter",
};
for (const [from, to] of Object.entries(REDIRECTS)) {
  try {
    const res = await fetch(BASE + from, { redirect: "manual" });
    const loc = (res.headers.get("location") ?? "").replace(BASE, "").split("#")[0];
    check(
      [301, 302, 307, 308].includes(res.status) && loc === to,
      `${from} -> ${to} (got ${res.status} ${loc || "-"})`
    );
  } catch (e) {
    check(false, `${from} fetch failed (${e})`);
  }
}

// c) the public unsubscribe endpoint answers (no token -> a graceful 200 page)
try {
  const res = await fetch(BASE + "/api/public/unsubscribe", { redirect: "manual" });
  check(res.status === 200, `/api/public/unsubscribe responds (got ${res.status})`);
} catch (e) {
  check(false, `/api/public/unsubscribe fetch failed (${e})`);
}

console.log(fail ? `\n${fail} FAILURE(S)` : "\nALL STAGING SMOKE CHECKS PASSED");
process.exit(fail ? 1 : 0);
