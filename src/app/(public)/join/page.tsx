import type { Metadata } from "next";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { MemberSignup, type GroupOption } from "@/components/MemberSignup";

export const metadata: Metadata = {
  title: "Join — Sheepdog Society",
  description:
    "Find a table near you. Or plant one where you live. Either way, do not stand alone.",
};

export const revalidate = 60;

async function getGroupOptions(): Promise<GroupOption[]> {
  try {
    const rows = await db
      .select({
        id: locations.id,
        name: locations.name,
        city: locations.city,
        state: locations.state,
        meetingDay: locations.meetingDay,
        meetingTime: locations.meetingTime,
      })
      .from(locations)
      .where(eq(locations.status, "active"))
      .orderBy(asc(locations.city), asc(locations.name))
      .limit(50);

    return rows.map((r) => {
      const place = [r.city, r.state].filter(Boolean).join(", ");
      const time = [r.meetingDay, r.meetingTime].filter(Boolean).join(" ");
      const head = r.name && r.name.trim() ? r.name : place || "Group";
      const tail = [place && head !== place ? place : null, time].filter(Boolean).join(" · ");
      return { id: r.id, label: tail ? `${head} — ${tail}` : head };
    });
  } catch {
    return [];
  }
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const groups = await getGroupOptions();
  const sp = await searchParams;
  const preselectedGroupId = sp.group;

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20">
        <div className="flex items-center gap-4">
          <span className="section-mark">Sit at the table</span>
          <div className="hairline flex-1 text-foreground" />
        </div>
        <h1 className="display-xl mt-8 text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
          There is a chair.
          <br />
          <em className="text-oxblood">Sit in it.</em>
        </h1>
        <p className="mt-7 max-w-2xl font-serif text-lg leading-relaxed text-foreground/80">
          You do not need to have your life cleaned up. Tell us where you are.
          We will help you find a table.
        </p>

        <div className="rule-double mt-12 text-foreground/70" />
        <div className="mt-10">
          <MemberSignup
            groups={groups}
            preselectedGroupId={preselectedGroupId}
            source="/join"
          />
        </div>
      </div>
    </section>
  );
}
