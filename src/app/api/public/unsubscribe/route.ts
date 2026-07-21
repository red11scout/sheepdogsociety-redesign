import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberNotificationPrefs, newsletterSubscribers } from "@/db/schema";
import { verifySubscriberToken } from "@/server/audience-tokens";

// Public unsubscribe. GET shows a confirm page (no mutation, so email-client
// prefetch can't unsubscribe anyone). POST flips the flag — used by both the
// confirm form and the RFC-8058 one-click List-Unsubscribe header.

type Target =
  | { kind: "member"; token: string }
  | { kind: "subscriber"; email: string };

function parseTarget(url: URL): Target | null {
  const m = url.searchParams.get("m");
  if (m) return { kind: "member", token: m };
  const e = url.searchParams.get("e");
  const s = url.searchParams.get("s");
  if (e && s && verifySubscriberToken(e, s)) return { kind: "subscriber", email: e };
  return null;
}

async function unsubscribe(t: Target): Promise<boolean> {
  try {
    if (t.kind === "member") {
      await db
        .update(memberNotificationPrefs)
        .set({ wantsNewsletter: false })
        .where(eq(memberNotificationPrefs.emailUnsubscribeToken, t.token));
    } else {
      await db
        .update(newsletterSubscribers)
        .set({ isActive: false })
        .where(eq(newsletterSubscribers.email, t.email));
    }
    return true;
  } catch {
    // Read-only sandbox blocks writes; treat as "couldn't process".
    return false;
  }
}

function page(title: string, body: string): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Sheepdog Society</title><style>body{font-family:ui-serif,Georgia,'Times New Roman',serif;background:#f4edde;color:#211a11;display:grid;place-items:center;min-height:100vh;margin:0;padding:1.5rem}.card{max-width:34rem;text-align:center;line-height:1.6}h1{font-weight:600;font-size:1.75rem;margin:0 0 .5rem}button{font:inherit;font-size:1rem;background:#211a11;color:#f4edde;border:0;padding:.75rem 1.75rem;cursor:pointer}a{color:#96702a}p{margin:.75rem 0}</style></head><body><div class="card">${body}</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const t = parseTarget(new URL(request.url));
  if (!t) {
    return page(
      "Unsubscribe",
      "<h1>Link expired</h1><p>This unsubscribe link is invalid or has expired.</p>"
    );
  }
  return page(
    "Unsubscribe",
    `<h1>Stop the Letter?</h1>
     <p>You will no longer receive the weekly Letter from Sheepdog Society.</p>
     <form method="post"><button type="submit">Unsubscribe me</button></form>
     <p><a href="/">Never mind — keep me on the list</a></p>`
  );
}

export async function POST(request: Request) {
  const t = parseTarget(new URL(request.url));
  if (!t) {
    return page(
      "Unsubscribe",
      "<h1>Link expired</h1><p>This unsubscribe link is invalid or has expired.</p>"
    );
  }
  const ok = await unsubscribe(t);
  return page(
    ok ? "Unsubscribed" : "Unsubscribe",
    ok
      ? "<h1>Done.</h1><p>You have been unsubscribed. Grace and peace.</p>"
      : "<h1>Something went wrong</h1><p>We could not process that just now. Please try again later.</p>"
  );
}
