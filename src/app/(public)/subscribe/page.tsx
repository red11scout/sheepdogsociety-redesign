import type { Metadata } from "next";
import { NewsletterForm } from "@/components/public/newsletter-form";

export const metadata: Metadata = {
  title: "Get the Letter — Sheepdog Society",
  description:
    "One letter a week for men of faith and the people who love them. A scripture, a practice, sent Sunday morning.",
};

export default function SubscribePage() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20">
        <div className="flex items-center gap-4">
          <span className="folio">The Letter</span>
          <div className="hairline flex-1 text-foreground" />
          <span className="folio">Free, weekly, no noise</span>
        </div>

        <h1 className="display-xl mt-8 text-[clamp(2.4rem,6vw,4.5rem)] text-foreground">
          Get the <em className="text-oxblood">Letter.</em>
        </h1>

        <p className="dropcap mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
          One letter a week. A scripture, a practice, carried the rest of the
          week. Written for men of faith, and open to anyone who wants it. Wives,
          kids, friends. Put your email in and it lands Sunday morning.
        </p>

        <div className="mt-10 max-w-md">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
