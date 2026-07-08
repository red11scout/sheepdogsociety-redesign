import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/Icon";

export const metadata = {
  title: "Give — Sheepdog Society",
  description:
    "Support the Sheepdog Society mission. Why we give and how to partner with us.",
};

const ways: { icon: IconName; roman: string; title: string; copy: string; cta: string; href: string }[] = [
  {
    icon: "key",
    roman: "I",
    title: "Give online",
    copy: "Secure one-time or recurring giving through our online platform.",
    cta: "Give now",
    href: "#give-online",
  },
  {
    icon: "mail",
    roman: "II",
    title: "Give by mail",
    copy: "Send a check to our mailing address. Contact us for details.",
    cta: "Contact us",
    href: "/contact",
  },
  {
    icon: "hands",
    roman: "III",
    title: "Partner with us",
    copy: "Become a Sheepdog Partner with ongoing monthly support.",
    cta: "Learn more",
    href: "#give-partner",
  },
];

export default function GivingPage() {
  return (
    <>
      {/* Lead */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">Give</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Fuel the brotherhood. <em className="text-oxblood">Support the mission.</em>
          </h1>
        </div>
      </section>

      {/* Why we give */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="grid gap-10 pt-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="section-mark">Why we give</p>
              <h2 className="display-xl mt-6 text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
                Always free <em className="text-oxblood">for every man.</em>
              </h2>
            </div>
            <div className="space-y-6 border-t border-foreground/15 pt-8 font-serif text-base leading-relaxed text-foreground/80 md:text-lg lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <p>
                Sheepdog Society is free for every man who walks through the
                door. Always has been. Always will be.
              </p>
              <p>
                Keeping this brotherhood running takes resources. Study guides,
                technology, events, camping trips. When you give, you invest
                in the spiritual growth of men across the country. Every dollar
                goes to the mission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The verse — the one ember moment */}
      <section className="ember-band">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="section-mark">The word on giving &middot; 2 Corinthians 9:7</p>
          <p className="mt-8 font-pullquote text-2xl italic leading-snug md:text-4xl">
            &ldquo;Each of you should give what you have decided in your heart
            to give, not reluctantly or under compulsion, for God loves a
            cheerful giver.&rdquo;
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-[#c9834a]/60" />
        </div>
      </section>

      {/* Ways to give */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="flex items-center gap-4">
            <span className="section-mark">Ways to give</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h2 className="display-xl mt-8 max-w-3xl text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
            Three ways to invest.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {ways.map((w) => (
              <article key={w.title} className="paper-card flex flex-col p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <span className="display-soft text-2xl leading-none text-brass">
                    {w.roman}.
                  </span>
                  <Icon
                    name={w.icon}
                    size={26}
                    strokeWidth={2}
                    className="text-brass"
                  />
                </div>
                <h3 className="display-soft mt-8 text-xl text-foreground md:text-2xl">
                  {w.title}
                </h3>
                <p className="mt-3 flex-1 font-serif text-base leading-relaxed text-foreground/80">
                  {w.copy}
                </p>
                <Link
                  href={w.href}
                  className="link-editorial folio mt-8 inline-flex min-h-[44px] items-center gap-2 !text-brass"
                >
                  {w.cta}
                  <Icon name="arrow-right" size={12} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="pt-14 text-center md:pt-20">
            <p className="section-mark">Sheepdog Partners</p>
            <h2 className="display-xl mt-6 text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
              Churches. Organizations. <em className="text-oxblood">Brothers.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-foreground/80">
              Our partners believe in the Sheepdog mission and stand with us
              through prayer, resources, and giving.
            </p>
            <div className="mt-9">
              <Link
                href="/contact"
                className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Become a partner
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
