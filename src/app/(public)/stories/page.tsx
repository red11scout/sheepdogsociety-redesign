export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { testimonies, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import { Icon } from "@/components/icons/Icon";

export const metadata = {
  title: "Stories — Sheepdog Society",
  description:
    "Real stories of transformation from brothers across the Sheepdog Society.",
};

export default async function StoriesPage() {
  const stories = await db
    .select({
      id: testimonies.id,
      title: testimonies.title,
      content: testimonies.content,
      createdAt: testimonies.createdAt,
      authorFirstName: users.firstName,
    })
    .from(testimonies)
    .leftJoin(users, eq(testimonies.userId, users.id))
    .where(eq(testimonies.isApproved, true))
    .orderBy(desc(testimonies.createdAt))
    .limit(20);

  return (
    <>
      {/* ============ Page lead ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">Stories</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">What God has done</span>
          </div>
          <h1 className="display-xl mt-10 max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Wolves transformed.
            <br />
            <em className="text-oxblood">Sheepdogs sent.</em>
          </h1>
          <p className="mt-7 max-w-2xl font-serif text-lg leading-relaxed text-foreground/80 md:text-xl">
            Real stories from brothers across the Sheepdog Society.
          </p>
        </div>
      </section>

      {/* ============ Testimonies ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
          <div className="flex items-center gap-4">
            <span className="section-mark">The testimonies</span>
            <div className="hairline flex-1 text-foreground" />
          </div>

          {stories.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {stories.map((story) => (
                <article
                  key={story.id}
                  className="paper-card lift p-8 md:p-10"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="section-mark">Testimony</span>
                    <span className="folio">
                      {format(new Date(story.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                  <h3 className="display-soft mt-6 text-2xl text-foreground md:text-3xl">
                    {story.title}
                  </h3>
                  <p className="mt-4 line-clamp-5 font-serif text-base leading-relaxed text-foreground/75">
                    {story.content.slice(0, 240)}
                    {story.content.length > 240 ? "..." : ""}
                  </p>
                  <div className="mt-8 border-t border-foreground/15 pt-4">
                    <span className="folio">
                      — {story.authorFirstName || "A brother"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-foreground/15 p-16 text-center">
              <Icon
                name="flame"
                size={48}
                strokeWidth={2}
                className="mx-auto text-brass"
              />
              <h3 className="display-soft mt-8 text-2xl text-foreground md:text-3xl">
                Stories on the way.
              </h3>
              <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-muted-foreground">
                Brothers are writing them now.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============ Ember band — the invitation ============ */}
      <section className="ember-band">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="section-mark">The invitation</p>
          <h2 className="display-xl mt-6 text-[clamp(2rem,5vw,3.5rem)]">
            Have a story?
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-pullquote text-xl italic leading-relaxed md:text-2xl">
            Send it to us. We share what God has done.
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="lift inline-flex h-12 items-center gap-3 bg-bone px-8 text-[0.95rem] font-medium text-iron transition-colors hover:bg-bone/90"
            >
              Share your story
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
