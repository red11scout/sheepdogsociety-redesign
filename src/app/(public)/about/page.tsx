import Link from "next/link";
import { format } from "date-fns";
import { Icon } from "@/components/icons/Icon";
import { db } from "@/db";
import { testimonies, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// Stories are DB-backed; revalidate so newly approved testimonies appear
// without a rebuild (page was previously static and served stale).
export const revalidate = 60;

export const metadata = {
  title: "About — Sheepdog Society",
  description:
    "A brotherhood of men rooted in honorable Christian values, driven to be prepared in every aspect of life.",
};

async function getStories() {
  try {
    return await db
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
      .limit(6);
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const stories = await getStories();
  return (
    <>
      {/* Lead */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">About &middot; The watch</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            A brotherhood, <em className="text-oxblood">rooted and ready.</em>
          </h1>
          <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
            Men of faith, honorable values, prepared in every aspect of life. We
            protect our families. We sharpen each other. We follow Christ.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="rule-double text-foreground/70" />
          <div className="grid gap-10 pt-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <p className="section-mark">I &middot; Mission</p>
              <h2 className="display-xl mt-6 text-[clamp(1.9rem,4vw,3rem)] text-foreground">
                Our mission.
              </h2>
            </div>
            <div className="border-t border-foreground/15 pt-8 lg:col-span-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <p className="font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                We are a brotherhood of like-minded men, rooted in honorable
                Christian values, driven to be prepared in every aspect of life.
                We protect our faith, our families, ourselves, and anyone in
                need. We educate, communicate, and demonstrate faith through
                leadership and fellowship, with boldness, authority, strength,
                and grace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Foundation — the verse, the one ember moment */}
      <section className="ember-band">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="section-mark">II &middot; Foundation &middot; Acts 20:28</p>
          <p className="mt-8 font-pullquote text-2xl italic leading-snug md:text-4xl">
            &ldquo;Keep watch over yourselves and all the flock. Be shepherds of
            the church of God, which he bought with his own blood.&rdquo;
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-[#c9834a]/60" />
          <p className="folio mt-6 !text-[#b7a68b]">
            A call for every man to keep watch, shepherd, train, and be ready.
            Not a passive calling — it demands vigilance, courage, and
            faithfulness.
          </p>
        </div>
      </section>

      {/* Leadership model */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">III &middot; Leadership</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <h2 className="display-xl text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground lg:col-span-5">
              A starfish, <em className="text-oxblood">not a spider.</em>
            </h2>
            <div className="space-y-6 border-t border-foreground/15 pt-8 font-serif text-base leading-relaxed text-foreground/80 md:text-lg lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <p>
                Our leadership revolves around no single man. It revolves around
                Jesus Christ. We follow a decentralized model where every man is
                empowered and confident to lead.
              </p>
              <p>
                Cut a leg off a starfish, it grows back. That is us. No single
                point of failure. Every group stands on its own, connected by
                shared faith and shared mission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="rule-double text-foreground/70" />
          <div className="flex items-center gap-4 pt-12">
            <span className="section-mark">IV &middot; What we believe</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h2 className="display-xl mt-8 max-w-3xl text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
            Three convictions.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
            {[
              {
                icon: "scroll" as const,
                roman: "I",
                title: "Scripture is our guide.",
                copy: "The Bible is our foundation. We study it, discuss it, and live it out together. Not as scholars, but as men seeking truth.",
              },
              {
                icon: "flame" as const,
                roman: "II",
                title: "Grace transforms.",
                copy: "By God's grace, wolves become sheepdogs. Our strength is redeemed, not to destroy, but to protect and serve.",
              },
              {
                icon: "brothers" as const,
                roman: "III",
                title: "Brotherhood sharpens.",
                copy: "Iron sharpens iron. We are stronger together, carrying burdens, challenging complacency, building each other up.",
              },
            ].map((item) => (
              <article key={item.title} className="border-t-2 border-foreground/60 pt-6">
                <div className="flex items-center justify-between">
                  <span className="display-soft text-2xl leading-none text-brass">
                    {item.roman}.
                  </span>
                  <Icon
                    name={item.icon}
                    size={26}
                    strokeWidth={2}
                    className="text-brass"
                  />
                </div>
                <h3 className="display-soft mt-6 text-xl text-foreground md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 font-serif text-base leading-relaxed text-foreground/80">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">V &middot; Our culture</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h2 className="display-xl mt-8 max-w-3xl text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
            How we hold the line.
          </h2>
          <ol className="mt-12 divide-y divide-foreground/15 border-y border-foreground/15">
            {[
              {
                roman: "I",
                heading: "Safe brotherhood.",
                copy: "What is shared stays confidential. This is a place where men can be real.",
              },
              {
                roman: "II",
                heading: "No conflict.",
                copy: "We steer away from controversy, complicated subjects, and church politics. We focus on everyday issues men face.",
              },
              {
                roman: "III",
                heading: "Christ-centered.",
                copy: "Every discussion points back to Jesus. He is our leader, our model, our hope.",
              },
              {
                roman: "IV",
                heading: "Keep it simple.",
                copy: "We want any man, young or old, to feel confident walking in and participating. No barriers.",
              },
            ].map((item) => (
              <li
                key={item.heading}
                className="grid grid-cols-[48px_1fr] gap-6 py-8 md:grid-cols-[80px_280px_1fr] md:gap-12 md:py-12"
              >
                <span className="display-soft text-2xl leading-none text-brass md:pt-1">
                  {item.roman}.
                </span>
                <h3 className="display-soft col-span-1 text-xl text-foreground md:text-2xl">
                  {item.heading}
                </h3>
                <p className="col-span-2 font-serif text-base leading-relaxed text-foreground/80 md:col-span-1 md:text-lg">
                  {item.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ VI · Stories (moved from /stories) ============ */}
      <section id="stories" className="scroll-mt-20 bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="flex items-center gap-4">
            <span className="section-mark">VI &middot; Stories &middot; What God has done</span>
            <div className="hairline flex-1 text-foreground" />
            <Link href="/contact" className="link-editorial folio !text-brass">
              Share your story
            </Link>
          </div>
          <h2 className="display-xl mt-8 max-w-3xl text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
            Wolves transformed.
            <br />
            <em className="text-oxblood">Sheepdogs sent.</em>
          </h2>
          {stories.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <article key={story.id} className="paper-card p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="section-mark">Testimony</span>
                    <span className="folio">
                      {format(new Date(story.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                  <h3 className="display-soft mt-5 text-xl text-foreground">
                    {story.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 font-serif text-[0.95rem] leading-relaxed text-foreground/75">
                    {story.content.slice(0, 200)}
                    {story.content.length > 200 ? "..." : ""}
                  </p>
                  <div className="mt-6 border-t border-foreground/15 pt-3">
                    <span className="folio">— {story.authorFirstName || "A brother"}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-10 font-serif text-lg italic text-muted-foreground">
              Stories on the way. Brothers are writing them now.
            </p>
          )}
        </div>
      </section>

      {/* ============ Closing — where to go from here ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="mt-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            <p className="max-w-lg font-serif text-lg leading-relaxed text-foreground/80">
              That is who we are. If it sounds like where you belong, take the
              next step.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/join"
                className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Join the brotherhood
                <Icon name="arrow-right" size={15} />
              </Link>
              <Link
                href="/new-here"
                className="link-editorial inline-flex items-center gap-2 self-center font-serif text-[1.05rem] text-foreground/80"
              >
                New here? Start here
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
