import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/icons/Icon";

export const metadata: Metadata = {
  title: "What to expect — Sheepdog Society",
  description:
    "No stage. No show. Men sit down, open the Word, speak plainly, pray, and leave with something to obey.",
};

const TABLE_RHYTHM = [
  {
    eyebrow: "1 · Sit",
    title: "Pull up a chair.",
    body: "We meet at a table. Coffee, sometimes breakfast. Fifteen minutes of plain talk before anyone opens a book. You do not need to know what to say. You do not need to have your life cleaned up. Come sit down.",
  },
  {
    eyebrow: "2 · Read",
    title: "Open the Word.",
    body: "We read scripture out loud, slowly. Whoever wants to read, reads. We do not lecture. We ask what the passage says, what it means, and what it asks of us this week.",
  },
  {
    eyebrow: "3 · Speak",
    title: "Tell the truth.",
    body: "Each man says one true thing about his week. A struggle. A win. A confession. A man who is willing to be honest will find brothers willing to carry it with him.",
  },
  {
    eyebrow: "4 · Pray",
    title: "Take it to the Lord.",
    body: "We pray for one another by name. Short prayers. Plain words. We trust the Lord with what we cannot fix.",
  },
  {
    eyebrow: "5 · Leave",
    title: "One thing to obey.",
    body: "Each man names one thing to do this week, in light of what we read. We hold each other to it without nagging. That is the watch.",
  },
] as const;

const FAQ = [
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
    q: "How long does it last?",
    a: "Sixty to seventy-five minutes. Most groups start early so men can get to work afterward.",
  },
  {
    q: "Is this a Bible study or a support group?",
    a: "It is a Bible study. The brotherhood that grows out of it is a side effect of reading the Word together.",
  },
  {
    q: "What if I have not been to church in a long time?",
    a: "Welcome. Come anyway. There is no test at the door.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Coffee is on you.",
  },
  {
    q: "Is this affiliated with a denomination?",
    a: "No. We hold to the historic, orthodox Christian faith. We do not push a denominational line. If you have one, bring it; we will not ask you to leave it.",
  },
] as const;

export default function WhatToExpectPage() {
  return (
    <>
      {/* ============ Lead ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-12 md:px-10 md:pb-20 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">Before you come</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">No stage · no show</span>
          </div>
          <h1 className="display-xl mt-8 text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Come hungry.
            <br />
            <em className="text-oxblood">Bring nothing else.</em>
          </h1>
          <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
            You do not need to have your life in order. You do not need to know
            what to say. Come sit down. Listen. Open the Word with us.
          </p>
        </div>
      </section>

      {/* ============ The rhythm of a table ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
          <div className="rule-double text-foreground/70" />
          <div className="mt-10 flex items-center gap-4">
            <span className="section-mark">The rhythm</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h2 className="display-xl mt-8 text-[clamp(2rem,4.5vw,3.5rem)] text-foreground">
            Five things happen at a table.
          </h2>
          <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground/80">
            Most groups follow this rhythm, in this order. It is simple on
            purpose. A man should be able to walk in the door and know what is
            coming.
          </p>

          <div className="mt-14 space-y-12 md:space-y-14">
            {TABLE_RHYTHM.map((step) => (
              <article
                key={step.eyebrow}
                className="grid gap-5 md:grid-cols-[200px_1fr] md:gap-12"
              >
                <div>
                  <span className="section-mark">{step.eyebrow}</span>
                  <div className="hairline mt-3 text-foreground" />
                </div>
                <div className="md:border-l md:border-foreground/15 md:pl-10">
                  <h3 className="display-soft text-2xl text-foreground md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 font-serif text-lg leading-relaxed text-foreground/80">
                    {step.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Ember band — the charge ============ */}
      <section className="ember-band">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="section-mark">The charge · Acts 20:28</p>
          <p className="mt-8 font-pullquote text-2xl italic leading-snug md:text-3xl">
            &ldquo;Pay careful attention to yourselves and to all the flock, in
            which the Holy Spirit has made you overseers, to care for the church
            of God, which he obtained with his own blood.&rdquo;
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-[#c9834a]/60" />
          <p className="folio mt-6 !text-[#b7a68b]">Acts 20:28 · ESV</p>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
          <div className="flex items-center gap-4">
            <span className="section-mark">Plain answers</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h2 className="display-xl mt-8 text-[clamp(2rem,4.5vw,3.5rem)] text-foreground">
            What men ask.
          </h2>

          <dl className="mt-12 divide-y divide-foreground/10 border-y border-foreground/15">
            {FAQ.map((item) => (
              <div key={item.q} className="py-8">
                <dt className="display-soft text-xl text-foreground md:text-2xl">
                  {item.q}
                </dt>
                <dd className="mt-3 font-serif text-lg leading-relaxed text-foreground/80">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ Next step ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-4xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="mt-10 flex items-center gap-4">
            <span className="section-mark">Next step</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h2 className="display-xl mt-8 text-[clamp(2.2rem,5vw,4rem)] text-foreground">
            There is a chair.
            <br />
            <em className="text-oxblood">Sit in it.</em>
          </h2>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/locations"
              className="lift inline-flex h-12 items-center justify-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Find a group near me
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link
              href="/locations/request"
              className="section-mark lift inline-flex h-12 items-center justify-center gap-3 border border-foreground/70 px-7 !text-foreground transition-colors hover:border-brass hover:!text-brass"
            >
              Plant a group
              <Icon name="arrow-up-right" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
