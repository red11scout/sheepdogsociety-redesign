import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/Icon";

export const metadata = {
  title: "Get Started — Sheepdog Society",
  description:
    "New here? The five core principles, what to expect at your first study, and how to find a group.",
};

const principles: { icon: IconName; roman: string; title: string; copy: string }[] = [
  {
    icon: "gate",
    roman: "I",
    title: "Free of charge.",
    copy: "Always free. No dues, no fees, no cost. This is a gift of brotherhood.",
  },
  {
    icon: "brothers",
    roman: "II",
    title: "Open to all men.",
    copy: "Every man is welcome regardless of background, denomination, or where he is in his walk.",
  },
  {
    icon: "hands",
    roman: "III",
    title: "Peer led.",
    copy: "No hierarchy. Any man can lead. We sharpen each other as equals before God.",
  },
  {
    icon: "flame",
    roman: "IV",
    title: "Ends with prayer.",
    copy: "Every gathering closes with the Circle of Prayer, where we lift one another up.",
  },
  {
    icon: "cross",
    roman: "V",
    title: "Christ-centered.",
    copy: "Jesus is our leader and foundation. Scripture is our guide. The Gospel is our hope.",
  },
];

const expectations = [
  {
    roman: "I",
    title: "Weekly study",
    copy: "Groups of two to twelve men meet weekly at a set time and place. Each man reads aloud from Scripture. We discuss, sharpen, and encourage.",
  },
  {
    roman: "II",
    title: "Signal between",
    copy: "Groups use Signal for secure communication between meetings. Share prayer requests, coordinate, stay connected.",
  },
  {
    roman: "III",
    title: "The Circle of Prayer",
    copy: "Every gathering ends with men standing together in prayer. Burdens shared and lifted. Confidential. Sacred. Powerful.",
  },
];

export default function GetStartedPage() {
  return (
    <>
      {/* ============ Lead ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">Get started</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">No application · no interview</span>
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            New here?
            <br />
            <em className="text-oxblood">Welcome, brother.</em>
          </h1>
          <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
            Sheepdog Society is a brotherhood of men gathering weekly in small
            groups. We study Scripture. We sharpen each other. We live out our
            calling as protectors of the faith.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/locations"
              className="lift group inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <Icon name="map-pin" size={17} />
              Find a group
              <Icon
                name="arrow-right"
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/locations/request"
              className="link-editorial inline-flex items-center gap-2 font-serif text-[1.05rem] text-foreground/80"
            >
              Start a group where you live
              <Icon name="arrow-right" size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Five core principles ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="rule-double text-foreground/70" />
          <div className="mt-10 flex items-center gap-4">
            <span className="section-mark">Five core principles</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h2 className="display-xl mt-8 max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] text-foreground">
            Five things to know.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8 lg:grid-cols-5">
            {principles.map((p, i) => (
              <article
                key={p.title}
                className={`border-t border-foreground/15 pt-6 md:border-t-0 md:pt-0 ${
                  i > 0 ? "md:border-l md:border-foreground/15 md:pl-8" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    name={p.icon}
                    size={30}
                    strokeWidth={2}
                    className="text-brass"
                  />
                  <span className="display-soft text-2xl leading-none text-brass">
                    {p.roman}.
                  </span>
                </div>
                <h3 className="display-soft mt-6 text-xl text-foreground">
                  {p.title}
                </h3>
                <p className="mt-3 font-serif text-[0.95rem] leading-relaxed text-foreground/75">
                  {p.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ What to expect ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="flex items-center gap-4">
            <span className="section-mark">What to expect</span>
            <div className="hairline flex-1 text-foreground" />
            <Link href="/what-to-expect" className="link-editorial folio !text-brass">
              The full rhythm
            </Link>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <h2 className="display-xl text-[clamp(2rem,4.5vw,3.5rem)] text-foreground lg:col-span-5">
              Three rhythms,
              <br />
              <em className="text-oxblood">every week.</em>
            </h2>
            <ol className="space-y-8 border-t-2 border-foreground/60 pt-6 lg:col-span-7 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-12 lg:pt-0">
              {expectations.map((e) => (
                <li key={e.title} className="flex gap-5 md:gap-7">
                  <span className="display-soft shrink-0 text-2xl leading-none text-brass md:text-3xl">
                    {e.roman}.
                  </span>
                  <div>
                    <h3 className="display-soft text-xl text-foreground md:text-2xl">
                      {e.title}
                    </h3>
                    <p className="mt-3 font-serif text-base leading-relaxed text-foreground/80 md:text-lg">
                      {e.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ Ember band — the charge to show up ============ */}
      <section className="ember-band">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="section-mark">How to join</p>
          <h2 className="display-xl mt-8 text-[clamp(2.2rem,5vw,4rem)]">
            No application.
            <br />
            No interview.
            <br />
            Just show up.
          </h2>
          <p className="mx-auto mt-8 max-w-xl font-pullquote text-xl italic leading-relaxed md:text-2xl">
            Find a group near you. Come as you are. Be honest. Be real. This is
            a safe place for men.
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-[#c9834a]/60" />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/locations"
              className="lift inline-flex h-12 items-center gap-3 bg-bone px-7 text-[0.95rem] font-medium text-iron transition-colors hover:bg-bone/90"
            >
              <Icon name="map-pin" size={17} />
              Find a group
            </Link>
            <Link
              href="/locations/request"
              className="lift inline-flex h-12 items-center gap-3 border border-[#efe7d5]/40 px-7 text-[0.95rem] font-medium text-[#efe7d5] transition-colors hover:border-[#efe7d5]"
            >
              Start a group
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
