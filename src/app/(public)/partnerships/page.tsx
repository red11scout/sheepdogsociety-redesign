import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/Icon";

export const metadata = {
  title: "Partnerships — Sheepdog Society",
  description:
    "Bring the Sheepdog brotherhood to your church, men's group, community, school, or athletic team.",
};

const partnerships: {
  icon: IconName;
  roman: string;
  title: string;
  copy: string;
}[] = [
  {
    icon: "watchtower",
    roman: "I",
    title: "Through a church",
    copy: "Partner your church's men's ministry with the Sheepdog framework. We provide the structure, study guides, and support. Your church provides the men and the meeting space. A natural extension of what many churches already do.",
  },
  {
    icon: "brothers",
    roman: "II",
    title: "Existing men's group",
    copy: "Already have a men's group? Adopt the Sheepdog format. Weekly Scripture study, peer-led discussions, Circle of Prayer. We help you integrate our resources and connect to the larger brotherhood.",
  },
  {
    icon: "compass",
    roman: "III",
    title: "Community group",
    copy: "Start a community-based group outside a church setting. Coffee shop, park, gym, someone's home. Two men and a Bible. We help you get started.",
  },
  {
    icon: "scroll",
    roman: "IV",
    title: "School or college",
    copy: "Launch a Sheepdog group for young men at your school, college, or university. We are building the next generation. Same principles, same format, tailored for younger men.",
  },
  {
    icon: "anchor",
    roman: "V",
    title: "Athletics",
    copy: "Pair faith-based study with your team or fitness group. Train the body and the spirit. Many groups pair a workout with their weekly study. Iron sharpening iron in every sense.",
  },
];

export default function PartnershipsPage() {
  return (
    <>
      {/* Lead */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">Partnerships</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Five ways to plant. <em className="text-oxblood">One brotherhood.</em>
          </h1>
        </div>
      </section>

      {/* Partnership types */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <ol className="divide-y divide-foreground/15 border-y border-foreground/15">
            {partnerships.map((p) => (
              <li
                key={p.title}
                className="grid gap-6 py-10 md:grid-cols-[80px_64px_1fr_auto] md:items-start md:gap-12 md:py-14"
              >
                <span className="display-soft text-3xl leading-none text-brass md:pt-1">
                  {p.roman}.
                </span>
                <Icon
                  name={p.icon}
                  size={36}
                  strokeWidth={2}
                  className="text-brass md:mt-1"
                />
                <div className="md:max-w-2xl">
                  <h2 className="display-soft text-2xl text-foreground md:text-3xl">
                    {p.title}
                  </h2>
                  <p className="mt-4 font-serif text-base leading-relaxed text-foreground/80 md:text-lg">
                    {p.copy}
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="link-editorial folio inline-flex min-h-[44px] items-center gap-2 !text-brass md:pt-2"
                >
                  Learn more
                  <Icon name="arrow-right" size={12} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="pt-14 text-center md:pt-20">
            <Icon
              name="hands"
              size={48}
              strokeWidth={2}
              className="mx-auto text-brass"
            />
            <h2 className="display-xl mt-8 text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
              Bring the brotherhood <em className="text-oxblood">to your community.</em>
            </h2>
            <div className="mt-9">
              <Link
                href="/contact"
                className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Start the conversation
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
