"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <p className="font-serif text-base italic leading-relaxed text-foreground/85">
          Welcome, brother. Watch your inbox.
        </p>
        <p className="folio mt-3">
          Want a seat at a table?{" "}
          <Link href="/join" className="link-editorial !text-brass">
            Join the brotherhood
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex items-stretch border border-foreground/25 transition-colors focus-within:border-brass"
      >
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email address"
          className="h-11 min-w-0 flex-1 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="lift flex h-11 items-center gap-2 bg-foreground px-5 text-xs font-medium uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Subscribe"}
          {status !== "loading" && <Icon name="arrow-right" size={14} />}
        </button>
      </form>
      {status === "error" ? (
        <p className="folio mt-3 !text-oxblood" role="alert">
          Something broke. Try again in a moment.
        </p>
      ) : (
        <p className="folio mt-3">One letter, every Sunday. Unsubscribe anytime.</p>
      )}
    </div>
  );
}
