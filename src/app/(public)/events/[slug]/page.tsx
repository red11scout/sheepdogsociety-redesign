import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Icon } from "@/components/icons/Icon";
import { format } from "date-fns";

export const revalidate = 60;

async function getEvent(id: string) {
  try {
    const [row] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) return { title: "Gathering — Sheepdog Society" };
  return {
    title: `${ev.title} — Sheepdog Society`,
    description: ev.description ?? undefined,
    openGraph: {
      title: ev.title,
      description: ev.description ?? undefined,
      images: ev.imageUrl ? [ev.imageUrl] : undefined,
    },
  };
}

/**
 * Broadsheet notice: dateline folio up top, display-soft title, the body
 * copy in the main column, and the particulars ruled off in a sidebar.
 */
export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) notFound();

  const start = new Date(ev.startTime);
  const end = ev.endTime ? new Date(ev.endTime) : null;
  const isPast =
    ev.isPast || (end ? end < new Date() : start < new Date());
  const photos = (ev.photos as Array<{ url: string; alt?: string; caption?: string }> | null) ?? [];
  const recap = ev.recap ?? "";

  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20">
        {/* Notice dateline */}
        <div className="flex items-center gap-4">
          <span className="folio">Gathering notice</span>
          <div className="hairline flex-1 text-foreground" />
          <span className="folio">{format(start, "EEEE, MMMM d, yyyy")}</span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Main column — the notice itself */}
          <div className="lg:col-span-8">
            {ev.eventType && (
              <p className="section-mark capitalize">{ev.eventType}</p>
            )}
            <h1 className="display-soft mt-4 text-[clamp(2.2rem,5vw,3.8rem)] text-foreground">
              {ev.title}
            </h1>

            {/* Description (always shown — pre-event copy) */}
            {ev.description ? (
              <p className="dropcap mt-8 max-w-2xl whitespace-pre-line font-serif text-lg leading-[1.75] text-foreground/85">
                {ev.description}
              </p>
            ) : (
              <p className="mt-8 font-serif text-xl italic text-muted-foreground">
                More details coming soon.
              </p>
            )}

            {/* Recap (only for past events that have one) */}
            {isPast && recap && (
              <section className="mt-14 border-t border-foreground/15 pt-10">
                <div className="flex items-center gap-4">
                  <span className="section-mark">The recap</span>
                  <div className="hairline flex-1 text-foreground" />
                </div>
                <div className="mt-6 space-y-5">
                  {recap.split(/\n\n+/).map((p, i) => (
                    <p
                      key={i}
                      className="max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Back nav */}
            <div className="mt-14 border-t border-foreground/15 pt-8">
              <Link
                href="/events"
                className="link-editorial folio inline-flex min-h-[44px] items-center gap-2 !text-brass"
              >
                ← All gatherings
              </Link>
            </div>
          </div>

          {/* Particulars — ruled sidebar column */}
          <aside className="border-t-2 border-foreground/60 pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-10 lg:pt-1">
            <p className="section-mark">The particulars</p>
            <dl className="mt-6 space-y-6">
              <div>
                <dt className="folio">When</dt>
                <dd className="mt-2 font-serif text-lg leading-snug text-foreground">
                  {format(start, "EEEE, MMMM d")}
                  <br />
                  <span className="text-foreground/70">
                    {format(start, "h:mm a")}
                    {end ? ` – ${format(end, "h:mm a")}` : ""}
                  </span>
                </dd>
              </div>
              {ev.location && (
                <div>
                  <dt className="folio">Where</dt>
                  <dd className="mt-2 font-serif text-lg leading-snug text-foreground">
                    {ev.location}
                  </dd>
                </div>
              )}
              {ev.eventType && (
                <div>
                  <dt className="folio">Type</dt>
                  <dd className="mt-2 font-serif text-lg capitalize leading-snug text-foreground">
                    {ev.eventType}
                  </dd>
                </div>
              )}
            </dl>

            {/* RSVP (skip for past events) */}
            {!isPast && ev.registrationUrl && (
              <a
                href={ev.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="lift mt-8 inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
              >
                RSVP
                <Icon name="arrow-up-right" size={16} />
              </a>
            )}
          </aside>
        </div>
      </div>

      {/* Photo gallery — only renders when there are photos. Full-bleed
       *  out of the prose container so the images get the room they need. */}
      {photos.length > 0 && (
        <section className="bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
            <div className="rule-double text-foreground/70" />
            <div className="mt-12 flex items-center gap-4">
              <span className="section-mark">
                The night, in pictures ({photos.length})
              </span>
              <div className="hairline flex-1 text-foreground" />
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p, i) => (
                <li key={p.url} className="space-y-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-foreground/15 bg-foreground/5">
                    <Image
                      src={p.url}
                      alt={p.alt ?? ev.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                      priority={i < 2}
                      unoptimized
                    />
                  </div>
                  {p.caption && (
                    <p className="font-serif text-sm italic text-muted-foreground">
                      {p.caption}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
