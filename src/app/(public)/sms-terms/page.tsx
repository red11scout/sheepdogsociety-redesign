import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Terms — Sheepdog Society",
  description:
    "What we will text you, how often, and how to stop. Plain talk for a federal-law thing.",
};

const SECTIONS = [
  {
    heading: "Program name",
    body: [
      "Acts 20:28 Sheepdog Society. The program is operated by the ministry behind acts2028sheepdogsociety.com.",
    ],
  },
  {
    heading: "What we send",
    body: [
      "Event reminders. Weekly Letter notifications. Group updates if you have asked for them. Prayer or devotional reminders if you have opted into those.",
    ],
  },
  {
    heading: "How often",
    body: [
      "Frequency varies. Most weeks: zero to three messages. Around an event or a special week: a few more. Never more than what you would expect from a friend who is keeping you in the loop.",
    ],
  },
  {
    heading: "Cost",
    body: [
      "Messages are free from us. Standard message and data rates from your carrier may apply.",
    ],
  },
  {
    heading: "How you opted in",
    body: [
      "You provided your phone number on a sign-up form on our website, checked the SMS box yourself, and confirmed by replying YES to the first message we sent. We never enroll a number without that confirmation.",
    ],
  },
  {
    heading: "How to stop",
    body: [
      "Reply STOP to any message. We will confirm and stop sending immediately. Reply HELP for our contact information. You can also unsubscribe from the preferences link in any email we send.",
    ],
  },
  {
    heading: "Quiet hours",
    body: [
      "We send between 9:00 a.m. and 8:00 p.m. local time, Monday through Saturday. On Sunday, between noon and 6:00 p.m. We do not text during sleeping hours.",
    ],
  },
  {
    heading: "Privacy",
    body: [
      "We do not sell or share mobile opt-in data or consent with third parties for marketing purposes. See the full",
    ],
    link: { href: "/privacy", label: "Privacy Policy" },
  },
  {
    heading: "Customer care",
    body: [
      "Questions, problems, or to opt out by email instead: hello@acts2028sheepdogsociety.com.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "We will update this page if anything material changes. The change date below tells you when this was last revised.",
    ],
  },
] as const;

export default function SmsTermsPage() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="flex items-center gap-4">
          <span className="section-mark">SMS Terms</span>
          <div className="hairline flex-1 text-foreground" />
        </div>
        <h1 className="display-xl mt-8 text-[clamp(2.2rem,5vw,4rem)] text-foreground">
          What we will text.
          <br />
          <em className="text-oxblood">How to stop.</em>
        </h1>
        <p className="mt-7 font-serif text-lg leading-relaxed text-foreground/80 md:text-xl">
          Federal law requires we be specific. We will be.
        </p>

        <div className="mt-14 space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.heading} className="border-t border-foreground/15 pt-8">
              <h2 className="display-soft text-2xl text-foreground md:text-3xl">
                {s.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {s.body.map((p, i) => (
                  <p
                    key={i}
                    className="font-serif text-lg leading-relaxed text-foreground/80"
                  >
                    {p}
                    {"link" in s && s.link && i === s.body.length - 1 && (
                      <>
                        {" "}
                        <Link
                          href={s.link.href}
                          className="link-editorial text-foreground/80"
                        >
                          {s.link.label}
                        </Link>
                        .
                      </>
                    )}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="rule-double mt-16 text-foreground/70" />
        <div className="pt-6">
          <p className="folio">Last revised &middot; April 2026</p>
          <p className="mt-3 font-serif text-base text-muted-foreground">
            Reply <span className="font-medium tracking-wide text-foreground">STOP</span>{" "}
            to opt out &middot;{" "}
            <span className="font-medium tracking-wide text-foreground">HELP</span> for
            help &middot; Msg &amp; data rates may apply.
          </p>
        </div>
      </div>
    </section>
  );
}
