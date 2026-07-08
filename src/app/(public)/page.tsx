import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { LocationsPreview } from "@/components/LocationsPreview";

export const metadata = {
  title: "Sheepdog Society — Acts 20:28",
  description:
    "Find your brothers. A brotherhood of men anchored in Acts 20:28, who tell the truth and grow stronger in Christ together.",
  openGraph: {
    title: "Sheepdog Society — Find your brothers.",
    description: "Brothers who tell the truth and hear yours. Acts 20:28.",
    images: [{ url: "/api/og/verse", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og/verse"],
  },
};

/**
 * Ridge & Bone front page. The old dark aurora-poster homepage is retired;
 * this is a printed broadsheet: paper ground, Fraunces headline, Newsreader
 * deck, ruled columns, one ember band for the verse. Ink, not glow.
 */
export default function HomePage() {
  return (
    <>
      {/* ============ Front-page lead ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">The front page</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">Every man needs a watch to stand</span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <h1 className="display-xl text-[clamp(3.2rem,8.5vw,7.5rem)] text-foreground">
                Find your <em className="text-oxblood">brothers.</em>
              </h1>

              <p className="dropcap mt-9 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                You have walked alone a long time. There is honor in that, and a
                limit to it. Find brothers who will tell you the truth and hear
                yours, men who know the Word, who will stand watch beside you
                and grow stronger in Christ. That is the work. That is enough.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/locations"
                  className="lift group inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  <Icon name="map-pin" size={17} />
                  Find a group near you
                  <Icon
                    name="arrow-right"
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/encouragements"
                  className="link-editorial inline-flex items-center gap-2 font-serif text-[1.05rem] text-foreground/80"
                >
                  Read this week&rsquo;s Letter
                  <Icon name="arrow-right" size={13} />
                </Link>
              </div>
            </div>

            {/* Right column — the standing notice, ruled off like a sidebar box */}
            <aside className="border-t-2 border-foreground/60 pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-10 lg:pt-2">
              <p className="section-mark">Standing orders</p>
              <ul className="mt-6 space-y-5">
                <li className="flex gap-4">
                  <span className="display-soft text-2xl leading-none text-brass">I.</span>
                  <p className="font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                    We do not meet to perform. We meet to be honest with each
                    other, anchored in Scripture.
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="display-soft text-2xl leading-none text-brass">II.</span>
                  <p className="font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                    Diners, coffee shops, garages, gyms. Show up as you are;
                    leave steadier than you came.
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="display-soft text-2xl leading-none text-brass">III.</span>
                  <p className="font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                    One letter every Sunday morning. A scripture. A practice.
                    Carried the rest of the week.
                  </p>
                </li>
              </ul>
              <Link
                href="/how-we-gather"
                className="link-editorial folio mt-7 inline-block !text-brass"
              >
                How we gather
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ Ember band — the verse ============ */}
      <section className="ember-band">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="section-mark">The charge · Acts 20:28</p>
          <p className="mt-8 font-pullquote text-2xl italic leading-snug md:text-4xl">
            &ldquo;Keep watch over yourselves and all the flock of which the
            Holy Spirit has made you overseers. Be shepherds of the church of
            God, which he bought with his own blood.&rdquo;
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-[#c9834a]/60" />
          <p className="folio mt-6 !text-[#b7a68b]">
            Some men are sheep. Some are wolves. Some stand the watch.
          </p>
        </div>
      </section>

      {/* ============ Where men are gathering (map) ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pt-16 md:px-10 md:pt-24">
          <div className="flex items-center gap-4">
            <span className="section-mark">The outposts</span>
            <div className="hairline flex-1 text-foreground" />
            <Link href="/locations" className="link-editorial folio !text-brass">
              See every group
            </Link>
          </div>
          <h2 className="display-xl mt-8 max-w-3xl text-[clamp(2.2rem,5vw,4rem)] text-foreground">
            Where men are already gathering
          </h2>
          <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground/80">
            Sunday morning, before the day starts. Honest conversation over a
            bad cup of coffee — no performance, no debate.
          </p>
        </div>
        <LocationsPreview />
      </section>

      {/* ============ The Letter — subscription notice ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="rule-double text-foreground/70" />
          <div className="grid gap-10 pt-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p className="section-mark">The Letter</p>
              <h2 className="display-xl mt-6 text-[clamp(2.2rem,5vw,4.2rem)] text-foreground">
                Sunday morning,
                <br />
                <em className="text-oxblood">before the day starts.</em>
              </h2>
              <p className="mt-7 max-w-xl font-serif text-lg leading-[1.75] text-foreground/85">
                One letter a week. A scripture. A practice. Sent at sunrise,
                read in five minutes, carried the rest of the week. No fluff,
                no funnel — six hundred words to steady your week.
              </p>
            </div>
            <div className="flex flex-col justify-center border-t border-foreground/15 pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <p className="folio">Subscribe · free, weekly, no noise</p>
              <div className="mt-5">
                <NewsletterForm />
              </div>
              <Link
                href="/get-started"
                className="link-editorial folio mt-6 inline-flex items-center gap-2 !text-brass"
              >
                What to expect
                <Icon name="arrow-right" size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
