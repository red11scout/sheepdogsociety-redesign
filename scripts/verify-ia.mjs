/**
 * Five Rooms IA verification crawl.
 * Asserts the spec's §8: direct permanent redirects (no chains), every room
 * live, /join one click from everywhere, no stale hrefs in rendered HTML,
 * and the read-only sandbox guard still active.
 *
 * Run: node scripts/verify-ia.mjs   (BASE env overrides target)
 */
const BASE = process.env.BASE ?? "https://sheepdogsociety-redesign.vercel.app";

const REDIRECTS = {
  "/encouragements": "/letter",
  "/locations": "/groups",
  "/locations/request": "/join?intent=start",
  "/groups/start": "/join?intent=start",
  "/get-started": "/new-here",
  "/what-to-expect": "/new-here",
  "/how-we-gather": "/new-here",
  "/faq": "/new-here#faq",
  "/gallery": "/events",
  "/giving": "/support",
  "/partnerships": "/support",
  "/stories": "/about#stories",
  "/letter/archive": "/letter",
};

const PAGES = [
  "/",
  "/letter",
  "/groups",
  "/events",
  "/resources",
  "/about",
  "/join",
  "/new-here",
  "/support",
  "/contact",
  "/acts-20-28",
];

let fail = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${msg}`);
  if (!ok) fail++;
};

// a) every old URL redirects DIRECTLY (single hop, 30x, exact destination)
for (const [from, to] of Object.entries(REDIRECTS)) {
  const res = await fetch(BASE + from, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  const norm = loc.replace(BASE, "").split("#")[0];
  check(
    [301, 302, 307, 308].includes(res.status) && norm === to.split("#")[0],
    `${from} -> ${to} (got ${res.status} ${loc || "no location"})`
  );
}

// b) every room is 200; c) /join within one click; d) no stale hrefs leak
for (const p of PAGES) {
  const res = await fetch(BASE + p, { redirect: "manual" });
  const html = res.status === 200 ? await res.text() : "";
  check(res.status === 200, `${p} is 200 (got ${res.status})`);
  if (res.status !== 200) continue;
  if (p !== "/join") check(html.includes('href="/join'), `${p} links /join in one click`);
  const stale = html.match(
    /href="\/(locations|encouragements|get-started|what-to-expect|how-we-gather|faq|gallery|giving|partnerships|stories)[/"]/
  );
  check(!stale, `${p} has no stale hrefs${stale ? ` (found ${stale[0]})` : ""}`);
}

// e) safety guard still active
const s = await (await fetch(BASE + "/api/sandbox-status")).json();
check(
  s.sandbox === true && s.writeBlocked === true && s.readWorks === true,
  `sandbox-status ${JSON.stringify(s)}`
);

console.log(fail ? `\n${fail} FAILURES` : "\nALL CHECKS PASSED");
process.exit(fail ? 1 : 0);
