"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavLink {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

const navLinks: NavLink[] = [
  { href: "/locations", label: "Groups" },
  { href: "/encouragements", label: "The Letter" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/resources", label: "Resources" },
  { href: "/stories", label: "Stories" },
  {
    href: "/about",
    label: "About",
    children: [
      { href: "/about", label: "About us" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

/**
 * Ridge & Bone masthead — a broadsheet front-page header, not an app bar.
 * Tier 1: folio strip (verse + edition line + theme toggle).
 * Tier 2: the wordmark set large in Fraunces, flanked by rules.
 * Tier 3: small-caps nav rail under a double rule.
 * Collapses to a compact single bar + drawer on mobile.
 */
export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }
  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  return (
    <>
    <header className="z-40">
      {/* Tiers 1–2 scroll away with the page (broadsheet masthead);
          the tier-3 nav rail is a SIBLING below so position:sticky can
          follow the reader for the whole page, not just the header. */}
      {/* Tier 1 — folio strip */}
      <div className="hidden border-b border-foreground/10 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 md:px-10">
          <span className="folio">Acts 20:28 · Keep watch over yourselves and all the flock</span>
          <div className="flex items-center gap-4">
            <Link href="/acts-20-28" className="folio transition-colors hover:text-brass">
              The Verse
            </Link>
            <span className="folio text-foreground/30">·</span>
            <Link href="/what-to-expect" className="folio transition-colors hover:text-brass">
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
          {navLinks.map((link) => {
            if (link.children) {
              const isOpen = openMenu === link.href;
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenMenu(link.href);
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={link.href}
                    className="section-mark inline-flex items-center gap-1 px-4 py-2.5 !text-foreground/65 transition-colors hover:!text-brass"
                    onFocus={() => setOpenMenu(link.href)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                  >
                    {link.label}
                    <Icon
                      name="chevron-down"
                      size={11}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </Link>
                  {isOpen && (
                    <div
                      className="absolute left-1/2 top-full mt-0 min-w-[190px] -translate-x-1/2 border border-foreground/15 bg-card shadow-[0_14px_40px_-18px_rgba(20,14,6,0.4)]"
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                    >
                      <ul className="py-2">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-4 py-2 text-sm text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground"
                              onClick={() => setOpenMenu(null)}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="section-mark px-4 py-2.5 !text-foreground/65 transition-colors hover:!text-brass"
              >
                {link.label}
              </Link>
            );
          })}
          <span className="mx-2 h-4 w-px bg-foreground/15" aria-hidden />
          <Link
            href="/get-started"
            className="section-mark border border-ink/70 px-4 py-2 !text-foreground transition-colors hover:border-brass hover:bg-brass/10 hover:!text-brass"
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
              {link.children && (
                <div className="mb-2 ml-4 border-l border-foreground/10 pl-4">
                  {link.children
                    .filter((c) => c.href !== link.href)
                    .map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-sm text-foreground/60"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-5">
            <Link
              href="/get-started"
              onClick={() => setMobileOpen(false)}
              className="section-mark flex h-12 w-full items-center justify-center gap-2 border border-foreground bg-foreground !text-background transition-colors hover:bg-foreground/90"
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
