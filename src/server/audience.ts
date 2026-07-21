import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  members,
  memberNotificationPrefs,
  newsletterSubscribers,
} from "@/db/schema";
import { resend } from "@/lib/email";
import {
  type Recipient,
  dedupeRecipients,
  chunk,
  personalize,
  memberUnsubscribeUrl,
  subscriberUnsubscribeUrl,
} from "@/server/audience-tokens";

export type { Recipient } from "@/server/audience-tokens";

export const FROM_SHEPHERD =
  process.env.RESEND_FROM_SHEPHERD ?? "shepherd@acts2028sheepdogsociety.com";

/** Members who opted into the newsletter (active, not soft-deleted). */
export async function getMemberLetterRecipients(): Promise<Recipient[]> {
  const rows = await db
    .select({
      email: members.email,
      name: members.name,
      token: memberNotificationPrefs.emailUnsubscribeToken,
    })
    .from(members)
    .innerJoin(
      memberNotificationPrefs,
      eq(memberNotificationPrefs.memberId, members.id)
    )
    .where(
      and(
        eq(memberNotificationPrefs.wantsNewsletter, true),
        eq(members.isActive, true),
        isNull(members.deletedAt)
      )
    );
  return rows.map((r) => ({
    email: r.email,
    name: r.name,
    unsubscribeUrl: memberUnsubscribeUrl(r.token),
  }));
}

/** Non-member subscribers (wives / kids) who are still active. */
export async function getSubscriberRecipients(): Promise<Recipient[]> {
  const rows = await db
    .select({
      email: newsletterSubscribers.email,
      name: newsletterSubscribers.firstName,
    })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, true));
  return rows.map((r) => ({
    email: r.email,
    name: r.name ?? "",
    unsubscribeUrl: subscriberUnsubscribeUrl(r.email),
  }));
}

/** The weekly Letter audience: members(wants_newsletter) + subscribers, deduped
 *  (member record wins). */
export async function getLetterRecipients(): Promise<Recipient[]> {
  const [m, s] = await Promise.all([
    getMemberLetterRecipients(),
    getSubscriberRecipients(),
  ]);
  return dedupeRecipients(m, s);
}

/**
 * Send one email per recipient from shepherd@, batched (≤100/call). Each carries
 * a personalized unsubscribe link ({{UNSUBSCRIBE_URL}} in the body + a
 * List-Unsubscribe header). In the read-only sandbox `resend()` is a no-op stub,
 * so this counts every send as sent without reaching anyone.
 */
export async function sendToRecipients(
  recipients: Recipient[],
  msg: { subject: string; html: string; text?: string }
): Promise<{ sent: number; failed: number }> {
  const client = resend();
  let sent = 0;
  let failed = 0;
  for (const group of chunk(recipients, 100)) {
    const payload = group.map((r) => ({
      from: FROM_SHEPHERD,
      to: [r.email],
      replyTo: FROM_SHEPHERD,
      subject: msg.subject,
      html: personalize(msg.html, r),
      ...(msg.text ? { text: personalize(msg.text, r) } : {}),
      headers: {
        "List-Unsubscribe": `<${r.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));
    try {
      const res = await client.batch.send(payload);
      if (res.error) failed += group.length;
      else sent += group.length;
    } catch {
      failed += group.length;
    }
  }
  return { sent, failed };
}
