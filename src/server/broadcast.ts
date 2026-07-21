"use server";

import { and, desc, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth-compat";
import {
  members,
  memberNotificationPrefs,
  broadcastLog,
  users,
} from "@/db/schema";
import {
  type Recipient,
  dedupeRecipients,
  memberUnsubscribeUrl,
} from "@/server/audience-tokens";
import { getSubscriberRecipients, sendToRecipients } from "@/server/audience";

async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const [me] = await db.select().from(users).where(eq(users.id, userId));
  if (me?.role !== "admin") throw new Error("Forbidden");
  return me.id;
}

export type BlastAudience =
  | { type: "leaders" }
  | { type: "groups"; groupIds: string[] }
  | { type: "everyone" };

/** Active members who still want mail, joined to their unsubscribe token.
 *  `extra` narrows to leaders / specific groups. Respecting wants_newsletter
 *  everywhere keeps every send honest to the unsubscribe link. */
async function membersWithToken(extra?: SQL): Promise<Recipient[]> {
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
        isNull(members.deletedAt),
        extra
      )
    );
  return rows.map((r) => ({
    email: r.email,
    name: r.name,
    unsubscribeUrl: memberUnsubscribeUrl(r.token),
  }));
}

async function resolveBlastRecipients(
  audience: BlastAudience
): Promise<Recipient[]> {
  if (audience.type === "leaders") {
    return membersWithToken(inArray(members.role, ["leader", "asst_leader"]));
  }
  if (audience.type === "groups") {
    if (audience.groupIds.length === 0) return [];
    return membersWithToken(inArray(members.groupId, audience.groupIds));
  }
  // everyone: members who want mail + active subscribers, deduped (member wins)
  const [m, s] = await Promise.all([
    membersWithToken(),
    getSubscriberRecipients(),
  ]);
  return dedupeRecipients(m, s);
}

function escapeHtml(s: string): string {
  return s.replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string
  );
}

/** Wrap Jeremy's plain-text body in a minimal branded email shell with the
 *  per-recipient unsubscribe placeholder. */
function renderBlastEmail(body: string): { html: string; text: string } {
  const paras = body
    .trim()
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 1rem;line-height:1.6">${escapeHtml(p).replace(
          /\n/g,
          "<br>"
        )}</p>`
    )
    .join("");
  const html = `<!doctype html><html><body style="font-family:Georgia,'Times New Roman',serif;color:#211a11;background:#f4edde;margin:0;padding:24px"><div style="max-width:560px;margin:0 auto">${paras}<hr style="border:0;border-top:1px solid #d8cfbb;margin:2rem 0"><p style="font-size:12px;color:#77705f">Sheepdog Society &middot; <a href="{{UNSUBSCRIBE_URL}}" style="color:#96702a">Unsubscribe</a></p></div></body></html>`;
  const text = `${body.trim()}\n\n—\nUnsubscribe: {{UNSUBSCRIBE_URL}}`;
  return { html, text };
}

/** Recipient count for the compose UI (safe — returns a number, not emails). */
export async function countBlastRecipients(
  audience: BlastAudience
): Promise<number> {
  await requireAdmin();
  return (await resolveBlastRecipients(audience)).length;
}

export async function sendBlast(input: {
  subject: string;
  body: string;
  audience: BlastAudience;
}): Promise<{ sent: number; failed: number; recipientCount: number }> {
  const adminId = await requireAdmin();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!subject) throw new Error("A subject is required");
  if (!body) throw new Error("A message body is required");

  const recipients = await resolveBlastRecipients(input.audience);
  const { html, text } = renderBlastEmail(body);
  const { sent, failed } = await sendToRecipients(recipients, {
    subject,
    html,
    text,
  });

  await db.insert(broadcastLog).values({
    sentBy: adminId,
    subject,
    audienceType: input.audience.type,
    audienceDetail:
      input.audience.type === "groups"
        ? { groupIds: input.audience.groupIds }
        : {},
    recipientCount: recipients.length,
    status: failed === 0 ? "sent" : sent === 0 ? "failed" : "partial",
  });

  return { sent, failed, recipientCount: recipients.length };
}

export async function listRecentBlasts(limit = 20) {
  await requireAdmin();
  return db
    .select()
    .from(broadcastLog)
    .orderBy(desc(broadcastLog.createdAt))
    .limit(limit);
}
