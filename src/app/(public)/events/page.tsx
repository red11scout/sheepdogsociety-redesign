import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/db";
import { events } from "@/db/schema";
import { and, asc, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import { Icon } from "@/components/icons/Icon";
import { format } from "date-fns";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gatherings — Sheepdog Society",
  description:
    "Breakfasts, prayer nights, leader huddles, service days. Come once. Come often.",
};

async function getUpcoming() {
  try {
    const now = new Date();
    return await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startTime: events.startTime,
        endTime: events.endTime,
        eventType: events.eventType,
        imageUrl: events.imageUrl,
        registrationUrl: events.registrationUrl,
      })
      .from(events)
      .where(and(gte(events.startTime, now), eq(events.isPast, false)))
      .orderBy(asc(events.startTime))
      .limit(24);
  } catch {
    return [];
  }
}

/**
 * Past events that have either a recap or photos. Anything older without
 * either is still in the DB but not surfaced — admins might not have
 * gotten around to writing it up yet.
 */
async function getPast() {
  try {
    return await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        startTime: events.startTime,
        endTime: events.endTime,
        eventType: events.eventType,
        recap: events.recap,
        photos: events.photos,
      })
      .from(events)
      .where(
        and(
          or(eq(events.isPast, true), lt(events.endTime, new Date())),
          or(
            sql`length(coalesce(${events.recap}, '')) > 0`,
            sql`jsonb_array_length(coalesce(${events.photos}, '[]'::jsonb)) > 0`
          )
        )
      )
      .orderBy(desc(events.startTime))
      .limit(24);
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcoming(), getPast()]);

  return (
    <>
      {/* ============ Page lead — the gatherings notice ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">Gatherings</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">Come once · Come often</span>
          </div>
          <h1 className="display-xl mt-10 max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Bring a brother. <em className="text-oxblood">Bring a friend.</em>
          </h1>
          <p className="mt-7 max-w-2xl font-serif text-lg leading-relaxed text-foreground/80 md:text-xl">
            Weekly tables. Monthly breakfasts. Prayer nights. Camping. The
            calendar below is what is on the books.
          </p>
        </div>
      </section>

      {/* ============ Upcoming — the calendar column ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
          <div className="flex items-center gap-4">
            <span className="section-mark">Upcoming</span>
            <div className="hairline flex-1 text-foreground" />
          </div>

          {upcoming.length > 0 ? (
            <ul className="mt-10 divide-y divide-foreground/10 border-y border-foreground/15">
              {upcoming.map((ev) => {
                const start = new Date(ev.startTime);
                return (
                  <li key={ev.id}>
                    <Link
                      href={`/events/${ev.id}`}
                      className="group grid gap-4 py-8 transition-colors hover:bg-foreground/[0.03] md:grid-cols-[140px_1fr_auto] md:items-start md:gap-8"
                    >
                      <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1">
                        <span className="folio !text-brass">
                          {format(start, "MMM")}
                        </span>
                        <span className="display-soft text-4xl text-foreground">
                          {format(start, "d")}
                        </span>
                      </div>
                      <div>
                        {ev.eventType && (
                          <span className="section-mark">{ev.eventType}</span>
                        )}
                        <h3 className="display-soft mt-2 text-xl text-foreground transition-colors group-hover:text-brass md:text-2xl">
                          {ev.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Icon name="clock" size={14} />
                            {format(start, "EEEE · h:mm a")}
                          </span>
                          {ev.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="map-pin" size={14} />
                              {ev.location}
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="mt-3 max-w-prose font-serif text-base leading-relaxed text-foreground/75">
                            {ev.description}
                          </p>
                        )}
                      </div>
                      <span className="folio self-start transition-colors group-hover:!text-brass">
                        Details →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-10 border border-dashed border-foreground/15 p-12 text-center">
              <Icon
                name="calendar"
                size={32}
                className="mx-auto text-foreground/30"
              />
              <p className="mt-4 font-serif text-xl italic text-muted-foreground">
                No gatherings on the books yet.
              </p>
              <p className="mt-3 font-serif text-base text-muted-foreground">
                Check back soon, or{" "}
                <Link href="/locations" className="link-editorial text-foreground/80">
                  find a weekly group
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events — only renders sections with at least one recap'd event */}
      {past.length > 0 && (
        <section className="bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
            <div className="rule-double text-foreground/70" />
            <div className="mt-12 flex items-center gap-4">
              <span className="section-mark">Past gatherings</span>
              <div className="hairline flex-1 text-foreground" />
            </div>
            <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-foreground/75">
              The brothers who showed up, and what they came home with.
            </p>
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((ev) => {
                const photos = (ev.photos as Array<{ url: string; alt?: string; caption?: string }> | null) ?? [];
                const cover = photos[0];
                const start = new Date(ev.startTime);
                return (
                  <li key={ev.id}>
                    <Link
                      href={`/events/${ev.id}`}
                      className="paper-card lift group/past block overflow-hidden"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground/5">
                        {cover ? (
                          <Image
                            src={cover.url}
                            alt={cover.alt ?? ev.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover/past:scale-[1.03]"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-foreground/25">
                            <Icon name="calendar" size={48} />
                          </div>
                        )}
                        {photos.length > 1 && (
                          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex h-6 items-center gap-1 bg-foreground/85 px-2 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-background">
                            <Icon name="image" size={10} />
                            {photos.length} photos
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="folio">
                          {format(start, "MMMM d, yyyy")}
                          {ev.eventType && <> · {ev.eventType}</>}
                        </p>
                        <h3 className="display-soft mt-2 text-xl text-foreground transition-colors group-hover/past:text-brass md:text-2xl">
                          {ev.title}
                        </h3>
                        {ev.recap && (
                          <p className="mt-3 line-clamp-3 font-serif text-sm leading-relaxed text-muted-foreground">
                            {ev.recap}
                          </p>
                        )}
                        <p className="link-editorial folio mt-4 inline-flex items-center gap-2 !text-brass">
                          See the night
                          <Icon
                            name="arrow-right"
                            size={12}
                            className="transition-transform group-hover/past:translate-x-1"
                          />
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
