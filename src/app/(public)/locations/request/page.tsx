"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export default function RequestLocationPage() {
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    proposedCity: "",
    proposedState: "",
    proposedMeetingDetails: "",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/locations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      /* fail silently */
    }
    setSubmitting(false);
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <>
      <title>Plant a group — Sheepdog Society</title>
      <meta
        name="description"
        content="Request to start a new Sheepdog Society group in your area."
      />

      {/* Section lead */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <Link
            href="/locations"
            className="link-editorial folio inline-flex items-center gap-2"
          >
            <Icon name="arrow-right" size={12} className="rotate-180" />
            All groups
          </Link>
          <div className="mt-10 flex items-center gap-4">
            <span className="section-mark">Plant a group</span>
            <div className="hairline flex-1 text-foreground" />
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <h1 className="display-xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
                Ready to lead?
                <br />
                <em className="text-oxblood">Start one here.</em>
              </h1>
              <p className="mt-7 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
                Two to twelve men. Weekly Scripture study. Tell us about your
                vision and we will set up a video call.
              </p>
            </div>
            <aside className="border-t-2 border-foreground/60 pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-10 lg:pt-2">
              <p className="section-mark">What it takes</p>
              <ul className="mt-6 space-y-4">
                <li className="font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                  A standing day, time, and table — a diner, a garage, a gym.
                </li>
                <li className="font-serif text-[0.95rem] leading-relaxed text-foreground/80">
                  A man willing to open the Word and keep the meeting honest.
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-32">
          <div className="mx-auto max-w-3xl border-t-2 border-foreground/60 pt-10">
            {submitted ? (
              <div className="border border-brass/40 bg-card p-8 text-center md:p-12">
                <Icon
                  name="check"
                  size={48}
                  strokeWidth={2.25}
                  className="mx-auto text-brass"
                />
                <h2 className="display-xl mt-8 text-3xl text-foreground md:text-4xl">
                  Request received.
                </h2>
                <p className="mx-auto mt-4 max-w-md font-serif text-lg italic leading-relaxed text-muted-foreground">
                  We will reach out to schedule a call. Welcome to the
                  brotherhood.
                </p>
                <Link
                  href="/locations"
                  className="link-editorial folio mt-8 inline-flex items-center gap-2 !text-brass"
                >
                  View all groups
                  <Icon name="arrow-right" size={12} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-8">
                <div className="flex items-center gap-4">
                  <span className="section-mark">Your details</span>
                  <div className="hairline flex-1 text-foreground" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Your name"
                    required
                    value={form.requesterName}
                    onChange={(v) => update("requesterName", v)}
                  />
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={form.requesterEmail}
                    onChange={(v) => update("requesterEmail", v)}
                  />
                </div>

                <Field
                  label="Phone (optional)"
                  value={form.requesterPhone}
                  onChange={(v) => update("requesterPhone", v)}
                />

                <div className="mt-4 flex items-center gap-4">
                  <span className="section-mark">Where</span>
                  <div className="hairline flex-1 text-foreground" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="City"
                    required
                    value={form.proposedCity}
                    onChange={(v) => update("proposedCity", v)}
                  />
                  <div>
                    <label className="folio">
                      State<span className="ml-1 text-brass">*</span>
                    </label>
                    <select
                      value={form.proposedState}
                      onChange={(e) => update("proposedState", e.target.value)}
                      required
                      className="mt-3 h-11 w-full border border-foreground/25 bg-transparent px-4 text-base text-foreground focus:border-brass focus:outline-none"
                    >
                      <option value="" className="bg-background text-foreground">
                        Select state
                      </option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s} className="bg-background text-foreground">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="folio">
                    Proposed meeting day, time, place
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Saturday mornings 7am at the diner on 5th"
                    value={form.proposedMeetingDetails}
                    onChange={(e) =>
                      update("proposedMeetingDetails", e.target.value)
                    }
                    className="mt-3 w-full border border-foreground/25 bg-transparent px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
                  />
                </div>

                <div>
                  <label className="folio">
                    Why you want to lead a group
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about yourself and your vision."
                    value={form.reason}
                    onChange={(e) => update("reason", e.target.value)}
                    className="mt-3 w-full border border-foreground/25 bg-transparent px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="lift inline-flex h-12 items-center gap-3 bg-foreground px-8 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit request"}
                    {!submitting && <Icon name="arrow-right" size={16} />}
                  </button>
                </div>
              </form>
            )}
          </div>
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
    <div>
      <label className="folio">
        {label}
        {required && <span className="ml-1 text-brass">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 h-11 w-full border border-foreground/25 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
      />
    </div>
  );
}
