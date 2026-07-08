import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { format } from "date-fns";
import { listEventsWithPhotos } from "@/server/gallery";
import { Icon } from "@/components/icons/Icon";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery — Sheepdog Society",
  description:
    "Brothers gathering. Breakfast tables, prayer nights, retreats, and the men who showed up. Photos from every Sheepdog Society event.",
};

export default async function GalleryPage() {
  const eventsWithPhotos = await listEventsWithPhotos();

  return (
    <>
      {/* ============ Page lead ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">The gallery</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">The record, kept honest</span>
          </div>
          <h1 className="display-xl mt-10 max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            The brothers <em className="text-oxblood">who showed up.</em>
          </h1>
          <p className="mt-7 max-w-2xl font-serif text-lg leading-relaxed text-foreground/80 md:text-xl">
            Breakfast tables. Prayer nights. Long retreats. The photos that
            keep the memory honest.
          </p>
        </div>
      </section>

      {/* ============ Event grid ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
          <div className="flex items-center gap-4">
            <span className="section-mark">The evenings on record</span>
            <div className="hairline flex-1 text-foreground" />
          </div>

          {eventsWithPhotos.length === 0 ? (
            <div className="mt-10 border border-dashed border-foreground/15 p-16 text-center">
              <Icon name="image" size={48} className="mx-auto text-brass" />
              <h2 className="display-soft mt-6 text-2xl text-foreground md:text-3xl">
                The first photos are coming.
              </h2>
              <p className="mx-auto mt-3 max-w-md font-serif text-base italic text-muted-foreground">
                Once a gathering wraps and someone posts the photos, the
                gallery fills in here.
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventsWithPhotos.map((ev) => {
                const cover = ev.photos[0];
                return (
                  <li key={ev.id}>
                    <Link
                      href={`/gallery/${ev.id}`}
                      className="paper-card lift group/event block overflow-hidden"
                    >
                      {/* Cover photo. aspect-[4/5] gives a magazine
                       *  feel that frames most uploads cleanly without
                       *  the tile-grid look we get from aspect-square. */}
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-foreground/5">
                        {cover && (
                          <Image
                            src={cover.url}
                            alt={cover.alt ?? ev.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover/event:scale-[1.04]"
                            priority={false}
                            unoptimized
                          />
                        )}
                        {ev.photos.length > 1 && (
                          <span className="pointer-events-none absolute right-3 top-3 inline-flex h-6 items-center gap-1.5 bg-foreground/85 px-2 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-background">
                            <Icon name="image" size={10} />
                            {ev.photos.length}
                          </span>
                        )}
                      </div>

                      {/* Caption block — ruled off under the plate. */}
                      <div className="p-5">
                        <p className="folio">
                          {format(ev.startTime, "MMM d, yyyy")}
                          {ev.eventType && <> · {ev.eventType}</>}
                        </p>
                        <h3 className="display-soft mt-2 text-xl text-foreground transition-colors group-hover/event:text-brass md:text-2xl">
                          {ev.title}
                        </h3>
                        {ev.location && (
                          <p className="mt-2 font-serif text-sm text-muted-foreground">
                            {ev.location}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
