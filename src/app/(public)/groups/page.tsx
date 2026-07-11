"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocationMap, type LocationPin } from "@/components/map/location-map";
import { LocationCard } from "@/components/map/location-card";
import { Icon } from "@/components/icons/Icon";
import { CountUp } from "@/components/motion/CountUp";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationPin[]>([]);
  const [filtered, setFiltered] = useState<LocationPin[]>([]);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((data) => {
        setLocations(data.locations ?? []);
        setFiltered(data.locations ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = locations;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q)
      );
    }

    if (dayFilter !== "all") {
      result = result.filter(
        (l) => l.meetingDay?.toLowerCase() === dayFilter.toLowerCase()
      );
    }

    setFiltered(result);
  }, [search, dayFilter, locations]);

  const totalMen = locations.reduce(
    (acc, l) => acc + (l.groupSize ?? 0),
    0
  );

  return (
    <>
      <title>Find a group — Sheepdog Society</title>
      <meta
        name="description"
        content="Find a Sheepdog Society group near you. Weekly Bible studies for men, open to all."
      />

      {/* Section lead — printed directory front */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-12 md:px-10 md:pb-16 md:pt-20">
          <div className="flex items-center gap-4">
            <span className="section-mark">The outposts</span>
            <div className="hairline flex-1 text-foreground" />
            <span className="folio hidden sm:inline">A directory of the watch</span>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-14">
            <div className="lg:col-span-8">
              <h1 className="display-xl text-[clamp(2.2rem,6vw,4.5rem)] text-foreground">
                Find a group.
                <br />
                Or <em className="text-oxblood">plant one.</em>
              </h1>
              <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-foreground/80">
                Diners, coffee shops, garages, gyms. Wherever two or more can
                sit with the Word, a group can take root.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 border-t-2 border-foreground/60 pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-foreground/15 lg:pl-10 lg:pt-0">
              <div>
                <div className="display-soft text-4xl text-foreground md:text-5xl">
                  {loading ? "…" : <CountUp to={locations.length} />}
                </div>
                <div className="folio mt-2">Active groups</div>
              </div>
              {totalMen > 0 && (
                <div>
                  <div className="display-soft text-4xl text-foreground md:text-5xl">
                    {loading ? "…" : <CountUp to={totalMen} />}
                  </div>
                  <div className="folio mt-2">Men gathering</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filter Bar */}
      <section className="border-y border-foreground/15 bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:px-10">
          <div className="relative flex-1">
            <Icon
              name="search"
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              aria-label="Search groups by city, state, or name"
              placeholder="City, state, or group name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full border border-foreground/15 bg-transparent pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-brass focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              aria-label="Filter groups by day of the week"
              className="h-11 border border-foreground/15 bg-transparent px-4 text-base text-foreground focus:border-brass focus:outline-none md:w-[160px]"
            >
              <option value="all">All days</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <Link
              href="/join?intent=start"
              className="lift inline-flex h-11 shrink-0 items-center gap-2 border border-foreground/70 px-5 text-xs font-medium uppercase tracking-[0.14em] text-foreground transition-colors hover:border-brass hover:text-brass"
            >
              <Icon name="plus" size={14} />
              <span className="hidden sm:inline">Plant a group</span>
              <span className="sm:hidden">Plant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Map + Results */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LocationMap
                locations={filtered}
                className="h-[420px] border border-foreground/15 sm:h-[520px] lg:h-[600px]"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="section-mark !text-foreground/60">
                  {loading
                    ? "Loading"
                    : `${filtered.length} ${filtered.length === 1 ? "Result" : "Results"}`}
                </span>
                <span className="section-mark">
                  {dayFilter !== "all" ? dayFilter : "All days"}
                </span>
              </div>
              <div className="hairline mt-3" />
              <div className="mt-4 max-h-[600px] space-y-3 overflow-y-auto pr-1">
                {filtered.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
                ))}
                {!loading && filtered.length === 0 && (
                  <div className="border border-dashed border-foreground/15 p-8 text-center">
                    <Icon
                      name="map-pin"
                      size={32}
                      strokeWidth={2}
                      className="mx-auto text-stone/60"
                    />
                    <p className="mt-4 font-serif text-lg italic text-muted-foreground">
                      No groups in this view.
                    </p>
                    <Link
                      href="/join?intent=start"
                      className="link-editorial folio mt-4 inline-flex items-center gap-2 !text-brass"
                    >
                      Plant one
                      <Icon name="arrow-right" size={12} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
