import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/Icon";

export const metadata = {
  title: "Support the work — Sheepdog Society",
  description:
    "Give to the work, or partner with us to plant groups through churches, men's groups, communities, schools, and teams.",
};

const WAYS: { icon: IconName; roman: string; title: string; copy: string }[] = [
  {
    icon: "flame",
    roman: "I",
    title: "Give online",
    copy: "Secure one-time or recurring giving through our online platform.",
  },
  {
    icon: "scroll",
    roman: "II",
    title: "Give by mail",
    copy: "Send a check to our mailing address. Write to us for details.",
  },
  {
    icon: "brothers",
    roman: "III",
    title: "Become a Partner",
    copy: "Ongoing monthly support that keeps every group free for every man.",
  },
];

const LANES: { roman: string; title: string; copy: string }[] = [
  {
    roman: "I",
    title: "Through a church",
    copy: "Partner your church's men's ministry with the Sheepdog framework. We provide the structure, study guides, and support. Your church provides the men and the meeting space.",
  },
  {
    roman: "II",
    title: "An existing men's group",
    copy: "Already have a men's group? Adopt the Sheepdog format. Weekly Scripture study, peer-led discussion, the Circle of Prayer. We help you integrate and connect to the larger brotherhood.",
  },
  {
    roman: "III",
    title: "A community group",
    copy: "Outside a church setting. Coffee shop, park, gym, someone's home. Two men and a Bible. We help you get started.",
  },
  {
    roman: "IV",
    title: "A school or college",
    copy: "Launch a group for young men at your school, college, or university. Same principles, same format, tailored for the next generation.",
  },
  {
    roman: "V",
    title: "A team",
    copy: "Pair faith-based study with your team or fitness group. Train the body and the spirit. Iron sharpening iron in every sense.",
  },
];

export default function SupportPage() {
  return (
    <>
      {/* ============ Lead ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">Support</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">Every group stays free</span>
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Fuel the <em className="text-oxblood">work.</em>
          </h1>
          <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
            Sheepdog Society costs every man nothing. That is on purpose, and
            it is not free to keep it that way. Giving covers study guides,
            gatherings, and planting new groups. Partnering plants a table
            where you already stand.
          </p>
        </div>
      </section>

      {/* ============ Ways to give ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <div className="rule-double text-foreground/70" />
          <p className="section-mark mt-10">Ways to give</p>
          <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
            {WAYS.map((w, i) => (
              <article
                key={w.title}
                className={`border-t border-foreground/15 pt-6 md:border-t-0 md:pt-0 ${
                  i > 0 ? "md:border-l md:border-foreground/15 md:pl-8" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon name={w.icon} size={28} strokeWidth={2} className="text-brass" />
                  <span className="display-soft text-2xl leading-none text-brass">{w.roman}.</span>
                </div>
                <h2 className="display-soft mt-5 text-xl text-foreground">{w.title}</h2>
                <p className="mt-3 font-serif text-[0.95rem] leading-relaxed text-foreground/75">
                  {w.copy}
                </p>
              </article>
            ))}
          </div>
          <p className="folio mt-10">
            To give, or to ask how a gift is used,{" "}
            <Link href="/contact" className="link-editorial !text-brass">
              write to us
            </Link>
            . 2 Corinthians 9:7 — God loves a cheerful giver.
          </p>
        </div>
      </section>

      {/* ============ Partner with us — five lanes ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <p className="section-mark">Partner with us · five ways to plant</p>
          <ul className="mt-6 divide-y divide-foreground/10 border-y border-foreground/15">
            {LANES.map((l) => (
              <li key={l.roman} className="grid gap-2 py-6 md:grid-cols-[64px_240px_1fr] md:gap-8">
                <span className="display-soft text-2xl leading-none text-brass">{l.roman}.</span>
                <span className="display-soft text-lg leading-tight text-foreground">{l.title}</span>
                <p className="font-serif text-[0.95rem] leading-relaxed text-foreground/75">{l.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ Closing CTA (quiet paper, no ember) ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="paper-card flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <h2 className="display-soft text-2xl text-foreground">Ready to plant or partner?</h2>
              <p className="mt-2 font-serif text-[0.95rem] text-muted-foreground">
                Tell us where you stand. We will walk the rest with you.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Write to us
                <Icon name="arrow-right" size={15} />
              </Link>
              <Link
                href="/join?intent=start"
                className="link-editorial inline-flex items-center gap-2 self-center font-serif text-[1.05rem] text-foreground/80"
              >
                Start a group instead
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
