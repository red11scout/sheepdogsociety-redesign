import Link from "next/link";
import Image from "next/image";
import { NewsletterForm } from "./newsletter-form";

/**
 * Ridge & Bone colophon — the back page of the broadsheet. A set verse,
 * ruled columns, and a folio line. (The scrolling scripture marquee is
 * retired; scripture is set, not scrolled.)
 */
export function PublicFooter() {
  return (
    <footer className="border-t-2 border-foreground/60 bg-background text-foreground">
      {/* The verse, set like a colophon epigraph */}
      <div className="border-b border-foreground/10">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center md:py-20">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="mx-auto mb-6 rounded-none opacity-80"
          />
          <p className="font-pullquote text-xl italic leading-relaxed text-foreground/85 md:text-2xl">
            &ldquo;Keep watch over yourselves and all the flock of which the Holy
            Spirit has made you overseers.&rdquo;
          </p>
          <p className="folio mt-5">Acts 20:28</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="space-y-5 md:col-span-4">
            <Link href="/" aria-label="Sheepdog Society home">
              <span className="brand-wordmark text-2xl text-foreground">
                Sheepdog Society
              </span>
            </Link>
            <p className="max-w-sm font-serif text-[0.95rem] leading-relaxed text-muted-foreground">
              Men of faith standing guard, protecting the flock, living with
              purpose. We meet to be honest with each other, anchored in
              Scripture.
            </p>
            <Link href="/acts-20-28" className="link-editorial folio inline-block !text-brass">
              Read the verse
            </Link>
          </div>

          <div className="md:col-span-2">
            <h3 className="section-mark !text-foreground/50">Begin</h3>
            <ul className="mt-5 space-y-3 font-serif text-[0.95rem]">
              <li>
                <Link href="/new-here" className="link-editorial text-foreground/80">
                  New here
                </Link>
              </li>
              <li>
                <Link href="/join" className="link-editorial text-foreground/80">
                  Join the brotherhood
                </Link>
              </li>
              <li>
                <Link href="/acts-20-28" className="link-editorial text-foreground/80">
                  The Verse
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="section-mark !text-foreground/50">The society</h3>
            <ul className="mt-5 space-y-3 font-serif text-[0.95rem]">
              <li>
                <Link href="/about" className="link-editorial text-foreground/80">
                  About
                </Link>
              </li>
              <li>
                <Link href="/about#stories" className="link-editorial text-foreground/80">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/events" className="link-editorial text-foreground/80">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/support" className="link-editorial text-foreground/80">
                  Support the work
                </Link>
              </li>
              <li>
                <Link href="/contact" className="link-editorial text-foreground/80">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="section-mark !text-foreground/50">The Letter</h3>
            <p className="mt-5 max-w-sm font-serif text-[0.95rem] leading-relaxed text-muted-foreground">
              A weekly word for men of faith. Delivered Sunday mornings before
              the day starts.
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="rule-double mt-16 text-foreground/70" />
        <div className="mt-6 flex flex-col-reverse items-start gap-3 md:flex-row md:items-center md:justify-between">
          <p className="folio">
            &copy; {new Date().getFullYear()} Sheepdog Society · All rights reserved
          </p>
          <p className="folio">Forth as sheepdogs · Glory to God</p>
        </div>
      </div>
    </footer>
  );
}
