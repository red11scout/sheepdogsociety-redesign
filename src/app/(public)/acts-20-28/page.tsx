import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/Icon";
import { VersePlate } from "@/components/VersePlate";

export const metadata = {
  title: "Acts 20:28 — Sheepdog Society",
  description: "Keep watch over yourselves and all the flock.",
  openGraph: {
    title: "Acts 20:28 — Keep watch over yourselves and all the flock.",
    description:
      "Be shepherds of the church of God, which he bought with his own blood.",
    images: [{ url: "/api/og/verse", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og/verse"],
  },
};

export default function VerseSharePage() {
  return (
    <div className="bg-background text-foreground">
      <VersePlate variant="full" />

      {/* ============ The full verse — the one ember moment ============ */}
      <section className="ember-band">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="section-mark">Acts 20:28 &middot; NIV</p>
          <p className="mt-8 font-pullquote text-2xl italic leading-snug md:text-3xl">
            &ldquo;Keep watch over yourselves and all the flock of which the
            Holy Spirit has made you overseers. Be shepherds of the church of
            God, which he bought with his own blood.&rdquo;
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-[#c9834a]/60" />
          <p className="folio mt-6 !text-[#b7a68b]">
            Paul to the elders of Ephesus &middot; New International Version
          </p>
        </div>
      </section>

      {/* ============ The reading ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="flex items-center gap-4">
            <span className="section-mark">The reading</span>
            <div className="hairline flex-1 text-foreground" />
          </div>

          <div className="mt-10 max-w-[68ch] space-y-6">
            <p className="dropcap font-serif text-lg leading-[1.8] text-foreground/85">
              Paul gathers the men one last time. He has watched over them
              himself for three years, and now he is leaving for Jerusalem,
              knowing he will not see their faces again. He gives them one
              charge: keep watch. Watch yourselves first. Then watch the flock
              the Spirit has given into your care. Be shepherds, like the one
              who bought them with his own blood.
            </p>
            <p className="font-serif text-lg leading-[1.8] text-foreground/85">
              That is the work this brotherhood was named for. Men standing
              watch for one another, sober, anchored in Scripture, willing to
              do the unglamorous work of guarding what God has entrusted to
              them.
            </p>
          </div>
        </div>
      </section>

      {/* ============ Colophon CTA ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
          <div className="rule-double text-foreground/70" />
          <div className="flex flex-col items-center gap-6 pt-12 text-center">
            <span className="folio">Stand watch with us</span>
            <Button
              asChild
              size="lg"
              className="lift h-12 rounded-none bg-foreground px-8 text-base font-medium text-background hover:bg-foreground/90"
            >
              <Link href="/get-started">
                Join the brotherhood
                <Icon name="arrow-right" size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
