"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { ThemeToggle } from "@/components/theme-toggle";

// Five Rooms — five literal destinations; Join is the one CTA and it goes
// to the actual signup. One label = one destination, sitewide.
const navLinks = [
  { href: "/letter", label: "The Letter" },
  { href: "/groups", label: "Groups" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
] as const;

/**
 * Ridge & Bone masthead — a broadsheet front-page header, not an app bar.
 * Tier 1: folio strip (verse + New here + theme toggle).
 * Tier 2: the wordmark set large in Fraunces, flanked by rules.
 * Tier 3: small-caps nav rail — a sticky SIBLING of the header so
 * position:sticky follows the reader for the whole page.
 */
export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
    <header className="z-40">
      {/* Tier 1 — folio strip */}
      <div className="hidden border-b border-foreground/10 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 md:px-10">
          <span className="folio">Acts 20:28 · Keep watch over yourselves and all the flock</span>
          <div className="flex items-center gap-4">
            <Link href="/acts-20-28" className="folio transition-colors hover:text-brass">
              The Verse
            </Link>
            <span className="folio text-foreground/30">·</span>
            <Link href="/new-here" className="folio transition-colors hover:text-brass">
              New here
            </Link>
            <ThemeToggle className="inline-flex h-7 w-7 items-center justify-center text-foreground/50 transition-colors hover:text-foreground" />
          </div>
        </div>
      </div>

      {/* Tier 2 — wordmark */}
      <div className="hidden lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-6 py-4 md:px-10">
          <div className="hairline flex-1 text-foreground" />
          <Link
            href="/"
            className="flex items-center gap-4 text-foreground"
            aria-label="Sheepdog Society home"
          >
            <Image src="/logo.png" alt="" width={44} height={44} className="rounded-none" />
            <div className="text-center leading-none">
              <div className="brand-wordmark text-3xl tracking-tight text-foreground">
                Sheepdog Society
              </div>
              <div className="folio mt-1.5">A brotherhood anchored in Acts 20:28</div>
            </div>
            <Image
              src="/logo.png"
              alt=""
              width={44}
              height={44}
              className="rounded-none -scale-x-100"
            />
          </Link>
          <div className="hairline flex-1 text-foreground" />
        </div>
      </div>
    </header>

    {/* Tier 3 — sticky nav rail (the only part that follows the reader) */}
    <div className="sticky top-0 z-50 border-b border-foreground/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <nav className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Mobile compact bar */}
        <div className="flex items-center justify-between py-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Sheepdog Society home">
            <Image src="/logo.png" alt="" width={32} height={32} className="rounded-none" />
            <div className="leading-tight">
              <div className="brand-wordmark text-lg text-foreground">Sheepdog Society</div>
              <div className="folio text-[0.575rem]">Acts 20:28</div>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle className="inline-flex h-9 w-9 items-center justify-center text-foreground/60 transition-colors hover:text-foreground" />
            <button
              type="button"
              className="p-2 text-foreground"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>

        {/* Desktop rail */}
        <div className="hidden items-center justify-center gap-0.5 border-t border-foreground/10 py-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="section-mark px-4 py-2.5 !text-foreground/65 transition-colors hover:!text-brass"
            >
              {link.label}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-foreground/15" aria-hidden />
          <Link
            href="/join"
            className="section-mark border border-foreground/70 px-4 py-2 !text-foreground transition-colors hover:border-brass hover:bg-brass/10 hover:!text-brass"
          >
            Join
          </Link>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-foreground/10 bg-background px-6 pb-6 pt-2 lg:hidden">
          {navLinks.map((link) => (
            <div key={link.href} className="border-b border-foreground/8">
              <Link
                href={link.href}
                className="block py-3.5 font-serif text-lg text-foreground/85"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </div>
          ))}
          <div className="border-b border-foreground/8">
            <Link
              href="/new-here"
              className="block py-3.5 font-serif text-lg text-foreground/85"
              onClick={() => setMobileOpen(false)}
            >
              New here
            </Link>
          </div>
          <div className="mt-5">
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="section-mark flex h-12 w-full items-center justify-center gap-2 bg-foreground !text-background transition-colors hover:bg-foreground/90"
            >
              Join the brotherhood
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
