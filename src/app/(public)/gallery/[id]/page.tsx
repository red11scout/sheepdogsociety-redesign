import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { getGalleryEvent } from "@/server/gallery";
import { Icon } from "@/components/icons/Icon";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ev = await getGalleryEvent(id);
  if (!ev) return { title: "Gallery — Sheepdog Society" };
  const cover = ev.photos[0]?.url;
  return {
    title: `${ev.title} — Gallery — Sheepdog Society`,
    description:
      ev.description ??
      `${ev.photos.length} photo${ev.photos.length === 1 ? "" : "s"} from ${ev.title}.`,
    openGraph: {
      title: ev.title,
      description: ev.description ?? undefined,
      images: cover ? [cover] : undefined,
    },
  };
}

/**
 * Gallery notice: dateline folio, display headline, particulars ruled off
 * under the title, then the plates. Paper first — the lightbox inside
 * PhotoGrid is the only dark surface.
 */
export default async function GalleryEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ev = await getGalleryEvent(id);
  if (!ev || ev.photos.length === 0) notFound();

  return (
    <article className="bg-background text-foreground">
      <header>
        <div className="mx-auto max-w-7xl px-6 pt-10 md:px-10 md:pt-14">
          <Link
            href="/gallery"
            className="link-editorial folio inline-flex min-h-[44px] items-center gap-2 !text-brass"
          >
            <Icon name="arrow-right" size={12} className="rotate-180" />
            All galleries
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <span className="folio">From the gallery</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">{format(ev.startTime, "MMMM d, yyyy")}</span>
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            {ev.title}
          </h1>
          <dl className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-5 border-t border-foreground/15 pt-6">
            <div>
              <dt className="folio">When</dt>
              <dd className="mt-1 font-serif text-lg text-foreground">
                {format(ev.startTime, "EEEE, MMMM d, yyyy")}
              </dd>
            </div>
            {ev.location && (
              <div>
                <dt className="folio">Where</dt>
                <dd className="mt-1 font-serif text-lg text-foreground">
                  {ev.location}
                </dd>
              </div>
            )}
            <div>
              <dt className="folio">Photos</dt>
              <dd className="mt-1 font-serif text-lg text-foreground">
                {ev.photos.length}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* Optional event description / recap. Description shows first
       *  (it's the public-facing pre-event copy), recap below if the
       *  admin wrote one after the event. Both are optional. */}
      {(ev.description || ev.recap) && (
        <section>
          <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
            {ev.description && (
              <p className="dropcap whitespace-pre-line font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                {ev.description}
              </p>
            )}
            {ev.recap && (
              <div className="mt-10 border-t border-foreground/15 pt-8">
                <div className="flex items-center gap-4">
                  <span className="section-mark">The recap</span>
                  <div className="hairline flex-1 text-foreground" />
                </div>
                <div className="mt-6 space-y-5">
                  {ev.recap.split(/\n\n+/).map((p, i) => (
                    <p
                      key={i}
                      className="font-serif text-lg leading-[1.75] text-foreground/85"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* The grid + lightbox. PhotoGrid handles the magical part. */}
      <section>
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-4 md:px-10 md:pb-28">
          <div className="mb-6 flex items-center gap-4">
            <span className="section-mark">The night, in pictures</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <PhotoGrid photos={ev.photos} eventTitle={ev.title} />
        </div>
      </section>

      {/* Footer CTA */}
      <section>
        <div className="mx-auto max-w-3xl px-6 pb-20 text-center md:px-10 md:pb-28">
          <Link
            href="/gallery"
            className="lift inline-flex h-12 items-center gap-2 border border-foreground/70 px-6 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:border-brass hover:text-brass"
          >
            <Icon name="arrow-right" size={12} className="rotate-180" />
            More galleries
          </Link>
        </div>
      </section>
    </article>
  );
}
