import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Pure audience helpers — no db / Resend imports, so they stay unit-testable.
 * Used by src/server/audience.ts (recipients + sending) and the /unsubscribe route.
 */

export type Recipient = { email: string; name: string; unsubscribeUrl: string };

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acts2028sheepdogsociety.com";

function secret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.UNSUBSCRIBE_SECRET ??
    "dev-only-unsubscribe-secret"
  );
}

/** HMAC an email so non-member subscribers get an unsubscribe link with no DB
 *  column. `signSubscriberToken` + email in the URL, verified server-side. */
export function signSubscriberToken(email: string): string {
  return createHmac("sha256", secret())
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function verifySubscriberToken(email: string, sig: string): boolean {
  const expected = Buffer.from(signSubscriberToken(email));
  const given = Buffer.from(sig ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function subscriberUnsubscribeUrl(email: string): string {
  return `${BASE}/api/public/unsubscribe?e=${encodeURIComponent(
    email
  )}&s=${signSubscriberToken(email)}`;
}

/** Members carry a stored token in member_notification_prefs. */
export function memberUnsubscribeUrl(token: string): string {
  return `${BASE}/api/public/unsubscribe?m=${encodeURIComponent(token)}`;
}

/** Merge recipient lists, deduping by lowercased email. Earlier lists win — so
 *  pass members BEFORE subscribers to prefer the member record. */
export function dedupeRecipients(...lists: Recipient[][]): Recipient[] {
  const seen = new Map<string, Recipient>();
  for (const list of lists) {
    for (const r of list) {
      const key = r.email.trim().toLowerCase();
      if (key && !seen.has(key)) seen.set(key, r);
    }
  }
  return [...seen.values()];
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Replace {{UNSUBSCRIBE_URL}} and {{NAME}} per recipient. */
export function personalize(template: string, r: Recipient): string {
  return template
    .split("{{UNSUBSCRIBE_URL}}")
    .join(r.unsubscribeUrl)
    .split("{{NAME}}")
    .join(r.name?.trim() || "brother");
}
