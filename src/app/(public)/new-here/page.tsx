import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/Icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "New here — Sheepdog Society",
  description:
    "What to expect at the table: the five principles, the rhythm of a gathering, the rhythm of the year, and how to take a seat.",
};

const PRINCIPLES: { icon: IconName; roman: string; title: string; copy: string }[] = [
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

const TABLE_RHYTHM = [
  {
    n: "1",
    title: "Sit",
    body: "We meet at a table. Coffee, sometimes breakfast. Fifteen minutes of plain talk before anyone opens a book. You do not need to know what to say. Come sit down.",
  },
  {
    n: "2",
    title: "Read",
    body: "We read scripture out loud, slowly. Whoever wants to read, reads. We do not lecture. We ask what the passage says and what it asks of us this week.",
  },
  {
    n: "3",
    title: "Speak",
    body: "Each man says one true thing about his week. A struggle. A win. A confession. Honesty finds brothers willing to carry it with you.",
  },
  {
    n: "4",
    title: "Pray",
    body: "We pray for one another by name. Short prayers. Plain words. We trust the Lord with what we cannot fix.",
  },
  {
    n: "5",
    title: "Leave",
    body: "Each man names one thing to do this week, in light of what we read. We hold each other to it without nagging. That is the watch.",
  },
] as const;

const CADENCES = [
  {
    label: "Every week",
    title: "The study",
    line: "Two to twelve men, a set time and place, Scripture read aloud, and the Circle of Prayer. The heartbeat.",
  },
  {
    label: "Every month",
    title: "The meal",
    line: "Break bread with your brothers. Connect beyond the study. Widen the table with another local group.",
  },
  {
    label: "Every quarter",
    title: "The convergence",
    line: "All local groups gather. Speakers, stories, cookouts. A reminder you are part of something bigger.",
  },
  {
    label: "Every year",
    title: "The wilderness",
    line: "Campfires under the stars. Teaching that goes deep. Time away from the noise to hear God clearly.",
  },
] as const;

const FAQ = [
  {
    q: "What is the Sheepdog mission?",
    a: "Our mission comes from Acts 20:28. Keep watch over yourselves and the flock God has entrusted to us. We exist to transform men through Scripture, brotherhood, and accountability, and to live out our calling as protectors of our families, churches, and communities.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Coffee is on you. No membership fees, no dues, no hidden costs. This brotherhood is a gift, not a product.",
  },
  {
    q: "Do I need to know the Bible?",
    a: "No. Most men in our groups did not know the Bible when they started. Reading it together is how we learn it.",
  },
  {
    q: "Can I just listen the first few times?",
    a: "Yes. Many men sit and listen for a month before they say a word. That is fine. Take your time.",
  },
  {
    q: "What do I bring?",
    a: "A Bible if you have one. We have spares. Bring nothing else. If your group meets at a coffee shop, bring a few dollars for your drink.",
  },
  {
    q: "How long does a gathering last?",
    a: "Sixty to seventy-five minutes. Most groups start early so men can get to work afterward.",
  },
  {
    q: "What do I need to do to join or visit a group?",
    a: "Just show up. That is it. No application. No prerequisites. No interview. Come as you are, whether you have been walking with Christ for decades or are just curious about faith.",
  },
  {
    q: "What if I have not been to church in a long time?",
    a: "Welcome. Come anyway. There is no test at the door.",
  },
  {
    q: "Is this affiliated with a denomination?",
    a: "No. We hold to the historic, orthodox Christian faith. We do not push a denominational line. If you have one, bring it; we will not ask you to leave it.",
  },
  {
    q: "How do I start a group in my area?",
    a: "Tell us you are ready. Choose “I will start one” on the Join page and we will schedule a call, share resources, and help you launch — through a church, a men's group, your community, a school, or a team.",
  },
  {
    q: "What is the Circle of Prayer?",
    a: "How every gathering ends. Men stand together and pray — for each other, their families, their communities. What is shared in the Circle stays in the Circle. Confidentiality is sacred.",
  },
  {
    q: "Where can I find study guides?",
    a: "The Resources page has study guides at entry, mid, and advanced levels, plus multi-week series, book references, and Bible reading plans.",
  },
] as const;

export default function NewHerePage() {
  return (
    <>
      {/* ============ Lead — welcome ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">New here</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">No application · no interview</span>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h1 className="display-xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
                Welcome, <em className="text-oxblood">brother.</em>
              </h1>
              <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                Sheepdog Society is a brotherhood of men gathering weekly in
                small groups. We study Scripture. We sharpen each other. You do
                not need to have your life in order, and you do not need to
                know what to say. Come hungry. Bring nothing else.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/join"
                  className="lift group inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Join the brotherhood
                  <Icon
                    name="arrow-right"
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/groups"
                  className="link-editorial inline-flex items-center gap-2 font-serif text-[1.05rem] text-foreground/80"
                >
                  See the groups near you
                  <Icon name="arrow-right" size={13} />
                </Link>
              </div>
            </div>

            <aside className="border-t-2 border-foreground/60 pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-10 lg:pt-2">
              <p className="section-mark">The five principles</p>
              <ul className="mt-6 space-y-4">
                {PRINCIPLES.map((p) => (
                  <li key={p.roman} className="flex gap-4">
                    <span className="display-soft w-8 shrink-0 text-2xl leading-none text-brass">
                      {p.roman}.
                    </span>
                    <p className="font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                      <span className="font-semibold text-foreground">{p.title}</span>{" "}
                      {p.copy}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ At the table — five movements ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <div className="rule-double text-foreground/70" />
          <p className="section-mark mt-10">At the table</p>
          <h2 className="display-soft mt-4 text-[clamp(1.6rem,4vw,2.6rem)] text-foreground">
            One hour. Five movements.
          </h2>
          <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-foreground/80">
            Most groups follow this rhythm, in this order. It is simple on
            purpose. A man should be able to walk in the door and know what is
            coming.
          </p>
          <ol className="mt-10 grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-2 md:grid-cols-5">
            {TABLE_RHYTHM.map((step) => (
              <li key={step.n} className="bg-background p-6">
                <p className="folio">{step.n}</p>
                <h3 className="display-soft mt-3 text-xl text-foreground">{step.title}</h3>
                <p className="mt-3 font-serif text-[0.9rem] leading-relaxed text-foreground/75">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ The rhythm of the year ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
          <p className="section-mark">The rhythm of the year</p>
          <ul className="mt-6 divide-y divide-foreground/10 border-y border-foreground/15">
            {CADENCES.map((c) => (
              <li key={c.label} className="grid gap-2 py-6 md:grid-cols-[180px_220px_1fr] md:gap-8">
                <span className="folio">{c.label}</span>
                <span className="display-soft text-lg leading-tight text-foreground">{c.title}</span>
                <p className="font-serif text-[0.95rem] leading-relaxed text-foreground/75">{c.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ FAQ — merged, deduped ============ */}
      <section id="faq" className="scroll-mt-20 bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <p className="section-mark">Questions, answered</p>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ.map((item, i) => (
              <AccordionItem key={item.q} value={`q-${i}`} className="border-foreground/10">
                <AccordionTrigger className="display-soft py-5 text-left text-lg text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="folio mt-8">
            Still have a question?{" "}
            <Link href="/contact" className="link-editorial !text-brass">
              Write to us
            </Link>
          </p>
        </div>
      </section>

      {/* ============ Closing Join band ============ */}
      <section className="ember-band">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
          <p className="section-mark">Take a seat</p>
          <p className="mt-6 font-pullquote text-2xl italic leading-snug md:text-3xl">
            There is a chair at the table. It has been empty long enough.
          </p>
          <Link
            href="/join"
            className="lift mt-9 inline-flex h-12 items-center gap-3 bg-bone px-8 text-[0.95rem] font-medium text-iron"
          >
            Join the brotherhood
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
