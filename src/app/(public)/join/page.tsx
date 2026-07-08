import type { Metadata } from "next";
import Link from "next/link";
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

/** URL intent vocabulary -> MemberSignup's internal intent values. */
const INTENT_MAP = {
  join: "join",
  start: "start",
  letter: "just_keep_posted",
} as const;

const INTENTS = [
  {
    key: "join",
    roman: "I",
    title: "Find me a group",
    line: "Point me to a table near me. I will show up.",
  },
  {
    key: "start",
    roman: "II",
    title: "I will start one",
    line: "No table nearby. Give me the playbook and the backing.",
  },
  {
    key: "letter",
    roman: "III",
    title: "Just send the Letter",
    line: "Not ready to sit down yet. Write to me on Sundays.",
  },
] as const;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; intent?: string }>;
}) {
  const groups = await getGroupOptions();
  const sp = await searchParams;
  const preselectedGroupId = sp.group;
  const urlIntent =
    sp.intent && sp.intent in INTENT_MAP
      ? (sp.intent as keyof typeof INTENT_MAP)
      : "join";

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20">
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
          You do not need to have your life cleaned up. Tell us where you
          stand. We will walk the rest with you.
        </p>

        {/* Intent cards — server-rendered selection via ?intent= */}
        <div className="mt-10 grid gap-px border border-foreground/15 bg-foreground/15 md:grid-cols-3">
          {INTENTS.map((it) => {
            const selected = urlIntent === it.key;
            const params = new URLSearchParams();
            params.set("intent", it.key);
            if (preselectedGroupId) params.set("group", preselectedGroupId);
            return (
              <Link
                key={it.key}
                href={`/join?${params.toString()}`}
                aria-current={selected ? "true" : undefined}
                className={`block bg-background p-6 transition-colors ${
                  selected
                    ? "shadow-[inset_0_-3px_0_0_var(--color-brass)]"
                    : "hover:bg-foreground/5"
                }`}
              >
                <p className={`folio ${selected ? "!text-brass" : ""}`}>{it.roman}.</p>
                <h2 className="display-soft mt-2 text-xl text-foreground">{it.title}</h2>
                <p className="mt-2 font-serif text-[0.9rem] leading-relaxed text-muted-foreground">
                  {it.line}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="rule-double mt-12 text-foreground/70" />
        <div className="mt-10">
          <MemberSignup
            key={urlIntent + (preselectedGroupId ?? "")}
            groups={groups}
            preselectedGroupId={preselectedGroupId}
            initialIntent={INTENT_MAP[urlIntent]}
            source="/join"
          />
        </div>
      </div>
    </section>
  );
}
