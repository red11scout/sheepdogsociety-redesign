"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

type LocationDetail = {
  id: string;
  name: string;
  description: string | null;
  latitude: string;
  longitude: string;
  address: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  meetingPlace: string | null;
  groupSize: number | null;
  maxSize: number;
  contactName: string | null;
  /** contactEmail / contactPhone are admin-only — see
   *  /api/public/locations/[id]/route.ts. They were intentionally
   *  removed from the public payload. Do not re-add. */
  signalGroupUrl: string | null;
  imageUrl: string | null;
};

export default function LocationDetailPage() {
  const params = useParams();
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestForm, setInterestForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/public/locations/${params.id}`)
      .then((r) => r.json())
      .then((data) => setLocation(data.location ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleInterest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/locations/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: params.id,
          ...interestForm,
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      /* fail silently */
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-32 md:px-10">
          <div className="h-8 w-48 animate-pulse bg-foreground/10" />
          <div className="mt-6 h-72 animate-pulse bg-foreground/10" />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center md:px-10">
          <Icon
            name="map-pin"
            size={48}
            strokeWidth={2}
            className="mx-auto text-stone/60"
          />
          <h1 className="display-xl mt-8 text-3xl text-foreground md:text-4xl">
            Group not found.
          </h1>
          <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-muted-foreground">
            This group may no longer be active.
          </p>
          <Link
            href="/groups"
            className="link-editorial folio mt-10 inline-flex items-center gap-2 !text-brass"
          >
            <Icon name="arrow-right" size={12} className="rotate-180" />
            All groups
          </Link>
        </div>
      </div>
    );
  }

  const memberPart =
    location.groupSize != null
      ? `${location.groupSize} ${location.groupSize === 1 ? "man" : "men"}`
      : null;
  const meta = [memberPart, location.meetingDay, location.meetingTime]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <title>{`${location.name} — Sheepdog Society`}</title>

      {/* Dispatch head — the group, set like a filed report */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
          <Link
            href="/groups"
            className="link-editorial folio inline-flex items-center gap-2"
          >
            <Icon name="arrow-right" size={12} className="rotate-180" />
            All groups
          </Link>
          <div className="mt-10 flex items-center gap-4">
            <span className="section-mark">
              {location.city}, {location.state}
            </span>
            <div className="hairline flex-1 text-foreground" />
            {meta && <span className="folio hidden sm:inline">{meta}</span>}
          </div>
          <h1 className="display-xl mt-8 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
            {location.name}
          </h1>
          {meta && <p className="folio mt-6 sm:hidden">{meta}</p>}
          {location.description && (
            <p className="mt-7 max-w-2xl font-serif text-lg leading-[1.75] text-foreground/85 md:text-xl">
              {location.description}
            </p>
          )}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={`/join?intent=join&group=${location.id}`}
              className="lift inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Take a seat at this table
              <Icon name="arrow-right" size={15} />
            </Link>
            <span className="folio">No sign-up fee. No performance. Just show up.</span>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <div className="rule-double text-foreground/70" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              icon="clock"
              label="When"
              value={
                location.meetingDay
                  ? `${location.meetingDay}${location.meetingTime ? ` · ${location.meetingTime}` : ""}`
                  : "TBD"
              }
            />
            <Detail
              icon="map-pin"
              label="Where"
              value={location.meetingPlace || location.address || "TBD"}
            />
            <Detail
              icon="brothers"
              label="Group size"
              value={`${location.groupSize ?? 0} of ${location.maxSize} men`}
            />
            {location.contactName && (
              <Detail
                icon="mail"
                label="Contact"
                value={location.contactName}
              />
            )}
          </div>

          {location.signalGroupUrl && (
            <div className="paper-card mt-10 flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <Icon
                  name="message"
                  size={28}
                  strokeWidth={2}
                  className="text-brass"
                />
                <div>
                  <p className="display-soft text-lg text-foreground md:text-xl">
                    Signal group
                  </p>
                  <p className="mt-1 font-serif text-sm text-muted-foreground">
                    Join for between-meeting comms.
                  </p>
                </div>
              </div>
              <a
                href={location.signalGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lift inline-flex h-11 items-center gap-2 border border-foreground/70 px-5 text-xs font-medium uppercase tracking-[0.14em] text-foreground transition-colors hover:border-brass hover:text-brass"
              >
                Join Signal
                <Icon name="arrow-up-right" size={14} />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Interest form */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
          <div className="mx-auto max-w-3xl border-t-2 border-foreground/60 pt-10">
            <div className="flex items-center gap-4">
              <span className="section-mark">Interested?</span>
              <div className="hairline flex-1 text-foreground" />
            </div>
            <h2 className="display-xl mt-8 text-3xl text-foreground md:text-5xl">
              Show up. We will <em className="text-oxblood">be there.</em>
            </h2>

            {submitted ? (
              <div className="mt-10 flex items-start gap-4 border border-brass/40 bg-card p-6 md:p-8">
                <Icon name="check" size={24} className="text-brass" />
                <p className="font-serif text-lg italic leading-relaxed text-foreground md:text-xl">
                  Thank you, brother. The group leader will be in touch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInterest} className="mt-10 grid gap-6">
                <Field
                  label="Name"
                  required
                  value={interestForm.name}
                  onChange={(v) =>
                    setInterestForm((f) => ({ ...f, name: v }))
                  }
                />
                <Field
                  label="Email"
                  type="email"
                  required
                  value={interestForm.email}
                  onChange={(v) =>
                    setInterestForm((f) => ({ ...f, email: v }))
                  }
                />
                <Field
                  label="Phone (optional)"
                  value={interestForm.phone}
                  onChange={(v) =>
                    setInterestForm((f) => ({ ...f, phone: v }))
                  }
                />
                <div>
                  <label className="folio">
                    Anything you want the leader to know
                  </label>
                  <textarea
                    rows={4}
                    value={interestForm.message}
                    onChange={(e) =>
                      setInterestForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="mt-3 w-full border border-foreground/25 bg-transparent px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="lift inline-flex h-12 items-center gap-3 bg-foreground px-8 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "I'm interested"}
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

function Detail({
  icon,
  label,
  value,
}: {
  icon: "clock" | "map-pin" | "brothers" | "mail";
  label: string;
  value: string;
}) {
  return (
    <div className="border-t-2 border-foreground/60 pt-5">
      <div className="flex items-center gap-3">
        <Icon name={icon} size={18} className="text-brass" />
        <span className="section-mark !text-foreground/60">{label}</span>
      </div>
      <p className="display-soft mt-4 text-lg text-foreground md:text-xl">
        {value}
      </p>
    </div>
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
