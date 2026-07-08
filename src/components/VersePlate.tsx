import { cn } from "@/lib/utils";

interface VersePlateProps {
  variant?: "hero" | "full";
  className?: string;
}

/**
 * The verse plate — Ridge & Bone edition. A ruled broadsheet opening for
 * Acts 20:28: section-mark + hairline above, Fraunces display headline
 * with the emphatic words in oxblood, Cormorant deck, folio attribution
 * under a closing rule. Paper ground; no dark hero, no grid wash.
 */
export function VersePlate({ variant = "hero", className }: VersePlateProps) {
  return (
    <section
      className={cn(
        "w-full bg-background text-foreground",
        variant === "full" ? "py-20 md:py-32" : "py-16 md:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex items-center gap-4">
          <span className="section-mark">The Watch</span>
          <div className="hairline flex-1 text-foreground" />
          <span className="folio">The charge</span>
        </div>

        <h2 className="display-xl mt-10 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
          <em className="text-oxblood">Keep watch</em>
          <br />
          over yourselves
          <br />
          and all the flock.
        </h2>

        <p className="mt-8 max-w-2xl font-pullquote text-xl italic leading-relaxed text-muted-foreground md:text-2xl">
          Be shepherds of the church of God, which he bought with his own
          blood.
        </p>

        <div className="mt-12 flex items-center gap-4">
          <div className="hairline flex-1 text-foreground" />
          <span className="section-mark">Acts 20:28 &middot; NIV</span>
        </div>
      </div>
    </section>
  );
}
