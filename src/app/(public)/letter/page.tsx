import Link from "next/link";
import Image from "next/image";
import { listPublishedEncouragements } from "@/server/encouragements";
import { Icon } from "@/components/icons/Icon";
import { LetterCover } from "@/components/letters/LetterCover";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Letter — Sheepdog Society",
  description:
    "One letter a week. Scripture, guidance, and a word from the Watch.",
};

export default async function EncouragementsListPage() {
  let rows: Awaited<ReturnType<typeof listPublishedEncouragements>> = [];
  try {
    rows = await listPublishedEncouragements();
  } catch {
    rows = [];
  }

  return (
    <>
      {/* ============ Front matter ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pt-12 md:px-10 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">The Letter</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">Published Sunday morning</span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <h1 className="display-xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
                One letter <em className="text-oxblood">a week.</em>
              </h1>
              <p className="mt-7 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                Scripture, guidance, a word from the Watch. Read it before the
                day starts. Save it, carry it, hand it to a brother.
              </p>
            </div>

            <aside className="border-t-2 border-foreground/60 pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-10 lg:pt-2">
              <p className="section-mark">How it reads</p>
              <p className="mt-5 font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                Five minutes on Sunday morning. A scripture, a practice,
                carried the rest of the week. No fluff, no funnel.
              </p>
              <Link
                href="/join?intent=letter"
                className="link-editorial folio mt-6 inline-block !text-brass"
              >
                Get it by email
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ The archive ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="rule-double text-foreground/70" />

          {rows.length === 0 ? (
            <div className="mt-12 border border-dashed border-foreground/25 p-12 text-center md:p-16">
              <Icon name="sparkles" size={40} className="mx-auto text-brass" />
              <h2 className="display-soft mt-6 text-2xl text-foreground md:text-3xl">
                The first letter is on the way.
              </h2>
              <p className="mx-auto mt-4 max-w-md font-serif text-base leading-relaxed text-muted-foreground">
                Brothers are writing it. Sign up to get it the moment it
                lands.
              </p>
            </div>
          ) : (
            <ul className="grid md:grid-cols-2 md:gap-x-14">
              {rows.map((row) => (
                <li key={row.id} className="border-b border-foreground/15">
                  <Link
                    href={`/letter/${row.slug}`}
                    className="group/card block py-10 md:py-12"
                  >
                    {/* Always render a cover. Real uploaded image wins;
                     *  otherwise fall back to a deterministic SVG keyed
                     *  by the letter's theme so the archive feels like
                     *  a designed series, not a list of titles. */}
                    <div className="aspect-[16/9] overflow-hidden border border-foreground/15">
                      {row.coverImageUrl ? (
                        <Image
                          src={row.coverImageUrl}
                          alt={row.coverImageAlt ?? ""}
                          width={1200}
                          height={675}
                          unoptimized
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        />
                      ) : (
                        <LetterCover
                          id={row.id}
                          title={row.title}
                          theme={row.theme}
                          className="h-full w-full transition-transform duration-500 group-hover/card:scale-105"
                        />
                      )}
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="folio !text-brass">
                        No. {row.issueNumber}
                      </span>
                      {row.publishDate && (
                        <span className="folio">
                          {format(new Date(row.publishDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                    <h3 className="display-soft mt-4 text-2xl text-foreground md:text-[1.7rem]">
                      {row.title}
                    </h3>
                    {row.intro && (
                      <p className="mt-3 line-clamp-3 font-serif text-base leading-relaxed text-muted-foreground">
                        {row.intro}
                      </p>
                    )}
                    <span className="link-editorial mt-5 inline-flex items-center gap-2 font-serif text-[0.95rem] text-foreground/80">
                      Read the letter
                      <Icon
                        name="arrow-right"
                        size={13}
                        className="transition-transform group-hover/card:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
