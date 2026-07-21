import { db } from "@/db";
import { groups } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { listRecentBlasts } from "@/server/broadcast";
import { EmailComposer } from "./email-composer";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  let groupList: { id: string; name: string }[] = [];
  try {
    groupList = await db
      .select({ id: groups.id, name: groups.name })
      .from(groups)
      .where(eq(groups.isActive, true))
      .orderBy(asc(groups.name));
  } catch {
    groupList = [];
  }

  let recent: {
    id: string;
    subject: string;
    audienceType: string;
    recipientCount: number;
    status: string;
    createdAt: string;
  }[] = [];
  try {
    // broadcast_log may not exist until the Phase B migration is applied.
    const rows = await listRecentBlasts(20);
    recent = rows.map((b) => ({
      id: b.id,
      subject: b.subject,
      audienceType: b.audienceType,
      recipientCount: b.recipientCount,
      status: b.status,
      createdAt: (b.createdAt instanceof Date
        ? b.createdAt
        : new Date(b.createdAt as unknown as string)
      ).toISOString(),
    }));
  } catch {
    recent = [];
  }

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Email the brotherhood
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Send from shepherd@acts2028sheepdogsociety.com to leaders, selected
        groups, or everyone. Anyone who has unsubscribed is skipped, and every
        email carries a one-click unsubscribe link.
      </p>
      <EmailComposer groups={groupList} recent={recent} />
    </div>
  );
}
