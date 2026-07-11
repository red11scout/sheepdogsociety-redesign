// Auth.js v5 middleware (Clerk replaced 2026-04-29).
//
// Strategy:
// - Public routes are explicitly enumerated (the brand site, Letter,
//   Devotionals, Groups, Events, Resources, Subscribe, Merch, plus
//   sitemap/robots/feed and the auth API).
// - The `(app)` member-area routes still need a session AND an approved
//   user record (users.status = 'active' or 'approved') — that gate is
//   enforced by `(app)/layout.tsx` server-side, not here, because the
//   approval check needs DB access which middleware can't do on edge.
// - The `/admin` admin-area routes need ADMIN_EMAILS allowlist; that gate
//   is enforced by Auth.js's signIn callback (in auth.config.ts) at
//   sign-in time, plus a server-side admin check on each /admin page.

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Five Rooms IA public surface. Retired routes (encouragements, locations,
// get-started, devotionals, blog, subscribe, …) are NOT listed here — they
// forward to a live room via next.config.ts redirects(), which run before auth.
const PUBLIC_ROUTES = [
  /^\/$/,
  /^\/about(\/.*)?$/,
  /^\/contact(\/.*)?$/,
  /^\/letter(\/.*)?$/,
  /^\/groups(\/.*)?$/,
  /^\/events(\/.*)?$/,
  /^\/resources(\/.*)?$/,
  /^\/acts-20-28$/,
  /^\/new-here(\/.*)?$/,
  /^\/support(\/.*)?$/,
  /^\/privacy(\/.*)?$/,
  /^\/sms-terms(\/.*)?$/,
  /^\/join(\/.*)?$/,
  // Auth pages and API routes
  /^\/admin\/sign-in(\/.*)?$/,
  /^\/admin\/check-email(\/.*)?$/,
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/public(\/.*)?$/,
  /^\/api\/og(\/.*)?$/,           // verse plate + covenant card
  /^\/api\/members(\/.*)?$/,      // public signup POST
  /^\/api\/webhooks(\/.*)?$/,
  /^\/api\/cron(\/.*)?$/,
  /^\/api\/sandbox-status$/, // read-only sandbox self-test (safe: booleans only)
  // SEO files
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/feed\.xml$/,
];

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((re) => re.test(pathname));
}

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes pass through.
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Everything else requires a session.
  if (!req.auth) {
    const signInUrl = new URL("/admin/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on every route except Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
