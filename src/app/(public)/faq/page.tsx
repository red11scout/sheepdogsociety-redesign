import { Icon } from "@/components/icons/Icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "FAQ — Sheepdog Society",
  description:
    "Frequently asked questions. What we do, how to join, how groups work, the Circle of Prayer.",
};

const sections = [
  {
    roman: "I",
    label: "The basics",
    items: [
      {
        q: "What is the Sheepdog mission?",
        a: "Our mission comes from Acts 20:28. Keep watch over yourselves and the flock God has entrusted to us. We exist to transform men through Scripture, brotherhood, and accountability. We gather in small groups to study God's Word, sharpen one another, and live out our calling as protectors of our families, churches, and communities.",
      },
      {
        q: "Is Sheepdog really free?",
        a: "Yes, always. Sheepdog Society is completely free and will always be. No membership fees. No dues. No hidden costs. This brotherhood is a gift, not a product. Access to fellowship and Scripture study should never have a price tag.",
      },
      {
        q: "How do I find a location?",
        a: "Visit the Groups page to see an interactive map of all active Sheepdog groups. Search by city, state, or zip code to find a group near you. If there is no group in your area, you can request to start one.",
      },
      {
        q: "What do I need to do to join or visit a group?",
        a: "Just show up. That is it. No application. No prerequisites. No interview. Every group is open to all men. Come as you are, whether you have been walking with Christ for decades or are just curious about faith.",
      },
    ],
  },
  {
    roman: "II",
    label: "Leading a group",
    items: [
      {
        q: "Do you have any guidelines for leading a study?",
        a: "Yes. Leadership is simple and peer-driven. Any man can lead. Read the passage aloud together, each man takes a turn reading. Discuss what stood out, ask questions, share how it applies to your life. Keep conversations focused on Scripture and everyday issues men face. Avoid controversy, other churches' problems, and complicated theological debates. End with the Circle of Prayer.",
      },
      {
        q: "Can we do a workout or bootcamp and a study?",
        a: "Absolutely. Some groups pair physical training with their study. The key is that Scripture study and the Circle of Prayer remain the foundation of every gathering. A workout is a great addition, not a replacement.",
      },
      {
        q: "How do I start a group in my area or church?",
        a: "Visit the Start a Group page and fill out the request form. We will schedule a video call to walk you through the process, share resources, and help you launch. You can start a group through a church, an existing men's group, in your community, at a school or college, or through an athletic team.",
      },
      {
        q: "When should we meet?",
        a: "Whatever works best for your group. Most groups meet early morning before work, during lunch, or on weekends. Consistency is key. Pick a day and time and stick with it. Weekly meetings are the standard.",
      },
    ],
  },
  {
    roman: "III",
    label: "Content & resources",
    items: [
      {
        q: "What should we discuss?",
        a: "Start with Scripture. Use our study guides or follow a book of the Bible together. Focus on everyday issues men face. Being a better husband, father, leader, and servant. Keep it real, keep it practical, keep it Christ-centered. Steer away from controversy and stick to what helps men grow.",
      },
      {
        q: "Where can we get references and study guides?",
        a: "Check the Resources page for study guides at three levels: entry, mid, and advanced. We provide single studies and multi-week series, book references, and Bible reading plans. New resources are added regularly.",
      },
      {
        q: "Is it okay to use personal study guides and references?",
        a: "Yes. We encourage it. If you find a great study guide or reference, use it with your group. Even better, send it to us so we can share it with other groups. The more resources we have, the more men benefit.",
      },
      {
        q: "What is the Circle of Prayer?",
        a: "The COP is how every Sheepdog gathering ends. Men stand together in a circle and pray. For each other. For their families. For their communities. A time of vulnerability, trust, and lifting one another before God. What is shared in the COP stays in the COP. Confidentiality is sacred.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Lead */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-12 md:px-10 md:pb-14 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">Frequently asked</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <h1 className="display-xl mt-8 max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Questions, <em className="text-oxblood">answered.</em>
          </h1>
        </div>
      </section>

      {/* Sections — ruled accordion rows */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 pb-16 md:px-10 md:pb-24">
          {sections.map((section) => (
            <div key={section.label} className="mt-14 first:mt-0 md:mt-20">
              <div className="flex items-center gap-4">
                <span className="section-mark">
                  {section.roman} &middot; {section.label}
                </span>
                <div className="hairline flex-1 text-foreground" />
              </div>
              <Accordion type="single" collapsible className="mt-6">
                {section.items.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`${section.roman}-${i}`}
                    className="border-0 border-b border-foreground/15"
                  >
                    <AccordionTrigger className="display-soft min-h-[44px] py-5 text-left text-xl text-foreground hover:no-underline md:text-2xl">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-7 font-serif text-base leading-relaxed text-foreground/80 md:text-lg">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="pt-14 text-center md:pt-20">
            <p className="section-mark">One more thing</p>
            <h2 className="display-xl mt-6 text-[clamp(1.9rem,4.5vw,3.4rem)] text-foreground">
              Still have a question?
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-foreground/80">
              Send us a note. We read every one.
            </p>
            <div className="mt-9">
              <a
                href="/contact"
                className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Contact us
                <Icon name="arrow-right" size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
