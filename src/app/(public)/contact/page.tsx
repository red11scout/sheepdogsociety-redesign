"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

// Joining/starting intents route through /join now, not the contact form.
const TOPICS = [
  { value: "general", label: "General question" },
  { value: "leadership", label: "Leadership" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(
          "Something went wrong sending your note. Please try again in a moment."
        );
      }
    } catch {
      setError(
        "We could not reach the server. Check your connection and try again."
      );
    }
    setSubmitting(false);
  }

  return (
    <>
      <title>Contact — Sheepdog Society</title>
      <meta
        name="description"
        content="Get in touch with Sheepdog Society. We read every note."
      />

      {/* ============ Lead ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-12 md:px-10 md:pb-16 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="folio">Correspondence</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio">We read every note</span>
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            Send a note.
            <br />
            <em className="text-oxblood">We read every one.</em>
          </h1>
          <p className="folio mt-7">
            Looking to join or start a group?{" "}
            <Link href="/join" className="link-editorial !text-brass">
              That path is here.
            </Link>
          </p>
        </div>
      </section>

      {/* ============ Form ============ */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 pb-16 md:px-10 md:pb-24">
          {submitted ? (
            <div className="paper-card p-10 text-center md:p-12">
              <Icon
                name="check"
                size={44}
                strokeWidth={2.25}
                className="mx-auto text-brass"
              />
              <h2 className="display-soft mt-8 text-3xl text-foreground md:text-4xl">
                Message received.
              </h2>
              <p className="mx-auto mt-4 max-w-md font-serif text-lg italic leading-relaxed text-foreground/80">
                Thank you, brother. We will get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-8">
              <fieldset className="grid gap-8 border-t border-foreground/15 pt-8">
                <legend className="section-mark pr-4">Your message</legend>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Name"
                    required
                    value={form.name}
                    onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  />
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  />
                </div>

                <label className="block">
                  <span className="section-mark">Topic</span>
                  <select
                    value={form.topic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, topic: e.target.value }))
                    }
                    className="mt-3 block h-11 w-full border border-foreground/25 bg-transparent px-4 text-base text-foreground focus:border-brass focus:outline-none"
                  >
                    {TOPICS.map((t) => (
                      <option
                        key={t.value}
                        value={t.value}
                        className="bg-background text-foreground"
                      >
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="section-mark">
                    Message
                    <span className="ml-1 text-oxblood">*</span>
                  </span>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="mt-3 block w-full border border-foreground/25 bg-transparent px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-brass focus:outline-none"
                  />
                </label>
              </fieldset>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-sm font-medium uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send message"}
                  {!submitting && <Icon name="arrow-right" size={16} />}
                </button>
                {error && (
                  <p
                    role="alert"
                    className="mt-4 font-serif text-sm leading-relaxed text-oxblood"
                  >
                    {error}
                  </p>
                )}
                <p className="folio mt-4">
                  A brother reads every note. No newsletters unless you ask.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="section-mark">
        {label}
        {required && <span className="ml-1 text-oxblood">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 block h-11 w-full border border-foreground/25 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-brass focus:outline-none"
      />
    </label>
  );
}
