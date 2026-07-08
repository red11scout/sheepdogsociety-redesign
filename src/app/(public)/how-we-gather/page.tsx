import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How We Gather — Sheepdog Society",
  description:
    "Weekly studies, monthly meals, quarterly gatherings, and annual camping. Four rhythms that hold the brotherhood together.",
};

const rhythms = [
  {
    icon: "scroll" as const,
    roman: "I",
    title: "Weekly studies",
    cadence: "Every week",
    sub: "The core",
    copy: "Small groups of two to twelve men meet weekly at a consistent time and place. This is the heartbeat of Sheepdog Society. Each man reads Scripture aloud. We discuss what God is showing us, sharpen one another, and end with a Circle of Prayer.",
    notes: [
      "Group size: two to twelve men (ideal range)",
      "Each man reads aloud from Scripture",
      "Open discussion on real-life application",
      "Every gathering ends with the Circle of Prayer",
      "Any man is welcome to lead",
    ],
  },
  {
    icon: "table" as const,
    roman: "II",
    title: "Monthly meals",
    cadence: "Every month",
    sub: "Break bread",
    copy: "Once a month, share a meal with your brothers. Deepen relationships. Connect beyond the study. Combine with another local group when you want to widen the table.",
    notes: [],
  },
  {
    icon: "calendar" as const,
    roman: "III",
    title: "Quarterly gatherings",
    cadence: "Every quarter",
    sub: "All groups converge",
    copy: "Four times a year, all local small groups gather for a convergence. Bigger events with guest speakers, stories from group leaders, competitions, cookouts, and food trucks. A reminder that you are part of something bigger.",
    notes: [],
  },
  {
    icon: "mountain" as const,
    roman: "IV",
    title: "Annual camping",
    cadence: "Every year",
    sub: "The big gathering",
    copy: "Once a year, we head to the wilderness. Campfires under the stars. Stories of transformation. Teaching that goes deep. Time away from the noise to hear God clearly and bond with brothers from across the region.",
    notes: [],
  },
];

const guidelines = [
  {
    label: "Ideal size: two to twelve men.",
    body: "Small enough for real conversation. Large enough for iron to sharpen iron.",
  },
  {
    label: "If you routinely get over twelve, split.",
    body: "Don't split because twenty showed up one weekend. Split when it is consistently over twelve.",
  },
  {
    label: "When you split, plant.",
    body: "Apply for a new location and identify new leadership. This creates more leaders and extends the brotherhood.",
  },
];

export default function HowWeGatherPage() {
  return (
    <>
      {/* Lead */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">How we gather</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Four rhythms. <em className="text-oxblood">One brotherhood.</em>
          </h1>
          <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
            Weekly. Monthly. Quarterly. Yearly. We gather in person, eat
            together, climb together, and stand watch together.
          </p>
        </div>
      </section>

      {/* Rhythms */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <ol className="divide-y divide-foreground/15 border-y border-foreground/15">
            {rhythms.map((r) => (
              <li key={r.title} className="py-10 md:py-16">
                <div className="grid gap-6 md:grid-cols-[120px_1fr_200px] md:gap-12">
                  <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-5">
                    <span className="display-soft text-3xl leading-none text-brass">
                      {r.roman}.
                    </span>
                    <Icon
                      name={r.icon}
                      size={36}
                      strokeWidth={2}
                      className="text-brass"
                    />
                  </div>
                  <div>
                    <span className="folio">{r.sub}</span>
                    <h2 className="display-xl mt-3 text-[clamp(1.7rem,3.5vw,2.8rem)] text-foreground">
                      {r.title}
                    </h2>
                    <p className="mt-5 max-w-2xl font-serif text-base leading-relaxed text-foreground/80 md:text-lg">
                      {r.copy}
                    </p>
                    {r.notes.length > 0 && (
                      <ul className="mt-7 space-y-2 font-serif text-[0.95rem] text-foreground/75">
                        {r.notes.map((note) => (
                          <li
                            key={note}
                            className="flex items-start gap-3 leading-relaxed"
                          >
                            <span
                              className="mt-3 inline-block h-px w-3 shrink-0 bg-brass"
                              aria-hidden
                            />
                            {note}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="md:border-l md:border-foreground/15 md:pl-8 md:text-right">
                    <span className="section-mark">{r.cadence}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Guidelines */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="flex items-center gap-4 pt-12">
            <span className="section-mark">Group size guidelines</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <h2 className="display-xl text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground lg:col-span-5">
              Two to twelve. <em className="text-oxblood">Then plant another.</em>
            </h2>
            <div className="space-y-8 border-t border-foreground/15 pt-8 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              {guidelines.map((g) => (
                <div key={g.label}>
                  <p className="display-soft text-lg text-foreground md:text-xl">
                    {g.label}
                  </p>
                  <p className="mt-2 font-serif text-base leading-relaxed text-foreground/80">
                    {g.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="pt-14 text-center md:pt-20">
            <Icon
              name="sheepdog-rest"
              size={56}
              strokeWidth={2}
              className="mx-auto text-brass"
            />
            <h2 className="display-xl mt-8 text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
              Find a group, or plant one.
            </h2>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="lift h-12 rounded-none bg-foreground px-7 text-[0.95rem] font-medium text-background hover:bg-foreground/90"
              >
                <Link href="/locations">
                  <Icon name="map-pin" size={17} className="mr-2" />
                  Find a group
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="lift h-12 rounded-none border border-ink/70 bg-transparent px-7 text-[0.95rem] text-foreground hover:border-brass hover:bg-brass/10 hover:text-brass"
              >
                <Link href="/locations/request">
                  Start a group
                  <Icon name="arrow-right" size={15} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
