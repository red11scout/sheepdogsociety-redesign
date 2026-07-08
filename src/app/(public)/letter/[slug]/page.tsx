import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublishedEncouragementBySlug } from "@/server/encouragements";
import { Icon } from "@/components/icons/Icon";
import { LetterCover } from "@/components/letters/LetterCover";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let row;
  try {
    row = await getPublishedEncouragementBySlug(slug);
  } catch {
    row = null;
  }
  if (!row) return { title: "Encouragement — Sheepdog Society" };
  return {
    title: `${row.title} — Sheepdog Society`,
    description: row.intro ?? "Weekly encouragement.",
    openGraph: {
      title: row.title,
      description: row.intro ?? undefined,
      images: row.coverImageUrl ? [{ url: row.coverImageUrl }] : undefined,
    },
  };
}

export default async function EncouragementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let row;
  try {
    row = await getPublishedEncouragementBySlug(slug);
  } catch {
    row = null;
  }
  if (!row) notFound();

  const theme = (row as { theme?: string | null }).theme ?? null;
  const scriptures = Array.isArray(row.scriptures)
    ? (row.scriptures as { ref: string; note?: string }[])
    : [];
  const updatesLines = (row.updates ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const guidanceParas = (row.guidance ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  /* The letter body — Newsreader at a generous measure, oxblood
   * drop cap on the lead paragraph. */
  const guidanceBlock =
    guidanceParas.length > 0 ? (
      <div key="guidance">
        <div className="flex items-center gap-4">
          <span className="section-mark">The word</span>
          <div className="hairline flex-1 text-foreground" />
        </div>
        <div className="mt-9 max-w-[68ch] space-y-6">
          {guidanceParas.map((para, i) => (
            <p
              key={i}
              className={`whitespace-pre-line font-serif text-lg leading-[1.8] text-foreground/85${
                i === 0 ? " dropcap" : ""
              }`}
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    ) : null;

  const scriptureBlock =
    scriptures.length > 0 ? (
      <div key="scriptures">
        <div className="flex items-center gap-4">
          <span className="section-mark">Scriptures</span>
          <div className="hairline flex-1 text-foreground" />
        </div>
        <ul className="mt-8 space-y-7">
          {scriptures.map((s, i) => (
            <li key={i} className="border-l-2 border-brass/50 pl-5">
              <div className="display-soft text-xl text-foreground">
                {s.ref}
              </div>
              {s.note && (
                <p className="mt-2 font-pullquote text-lg italic leading-relaxed text-muted-foreground">
                  {s.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const updatesBlock =
    updatesLines.length > 0 ? (
      <div key="updates">
        <div className="flex items-center gap-4">
          <span className="section-mark">This week</span>
          <div className="hairline flex-1 text-foreground" />
        </div>
        <ul className="mt-7 space-y-4">
          {updatesLines.map((line, i) => (
            <li
              key={i}
              className="flex gap-4 font-serif text-base leading-relaxed text-foreground/80"
            >
              <span
                className="mt-3 inline-block h-px w-4 shrink-0 bg-brass"
                aria-hidden
              />
              {line.replace(/^[-*•]\s*/, "")}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  // Lead column gets the letter itself; anything else rides the ruled
  // sidebar. If the letter has no body, promote the next block up.
  const mainBlock = guidanceBlock ?? scriptureBlock ?? updatesBlock;
  const sideBlocks = [updatesBlock, scriptureBlock].filter(
    (b) => b !== null && b !== mainBlock
  );

  return (
    <>
      {/* ============ Letter header ============ */}
      <article className="bg-background text-foreground">
        <header className="mx-auto max-w-7xl px-6 pt-12 md:px-10 md:pt-20">
          <div className="flex items-center gap-4">
            <Link
              href="/letter"
              className="link-editorial folio inline-flex min-h-[44px] items-center gap-2 !text-brass"
            >
              <Icon name="arrow-right" size={11} className="rotate-180" />
              All letters
            </Link>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">The Letter</span>
          </div>

          <div className="mx-auto mt-12 max-w-4xl text-center md:mt-16">
            <p className="folio">
              No. {row.issueNumber}
              {row.publishDate && (
                <> &middot; {format(new Date(row.publishDate), "MMMM d, yyyy")}</>
              )}
              {theme && <> &middot; {theme}</>}
            </p>
            <h1 className="display-xl mt-6 text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
              {row.title}
            </h1>
            {row.intro && (
              <p className="mx-auto mt-7 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                {row.intro}
              </p>
            )}
            <div className="rule-double mt-10 text-foreground/70 md:mt-12" />
          </div>

          {/* Cover. Real uploaded image wins; otherwise the deterministic
           *  SVG keyed off the letter's theme so every published letter
           *  carries a visual anchor — no naked title pages in the
           *  archive. */}
          <div className="mx-auto mt-10 max-w-4xl md:mt-12">
            <div className="aspect-[16/9] overflow-hidden border border-foreground/15">
              {row.coverImageUrl ? (
                <Image
                  src={row.coverImageUrl}
                  alt={row.coverImageAlt ?? ""}
                  width={1600}
                  height={900}
                  unoptimized
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <LetterCover
                  id={row.id}
                  title={row.title}
                  theme={theme}
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </header>

        {/* ============ Letter body ============ */}
        {mainBlock && (
          <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
            {sideBlocks.length > 0 ? (
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-8">{mainBlock}</div>
                <aside className="space-y-12 border-t border-foreground/15 pt-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                  {sideBlocks}
                </aside>
              </div>
            ) : (
              <div className="mx-auto max-w-[68ch]">{mainBlock}</div>
            )}
          </div>
        )}
      </article>

      {/* ============ Notes from the Watch — the one ember moment ============ */}
      {row.notes && (
        <section className="ember-band">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
            <p className="section-mark">Notes from the Watch</p>
            <div className="mt-8 whitespace-pre-wrap font-pullquote text-xl italic leading-relaxed md:text-2xl">
              {row.notes}
            </div>
            <div className="mx-auto mt-10 h-px w-24 bg-[#c9834a]/60" />
          </div>
        </section>
      )}

      {/* ============ Colophon CTAs ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="rule-double text-foreground/70" />
          <div className="flex flex-col items-center gap-6 pt-12 text-center">
            <p className="folio">Carried the rest of the week</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/letter"
                className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
              >
                All letters
                <Icon name="arrow-right" size={15} />
              </Link>
              <Link
                href="/join"
                className="lift inline-flex h-12 items-center gap-2 border border-foreground/70 px-7 text-xs font-medium uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground"
              >
                Join the brotherhood
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
