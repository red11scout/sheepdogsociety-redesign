"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocationMap, type LocationPin } from "@/components/map/location-map";
import { Icon } from "@/components/icons/Icon";
import { CountUp } from "@/components/motion/CountUp";

/**
 * Homepage map section internals. The front page renders the section-mark,
 * headline, and deck above this component; this supplies the census row,
 * the Mapbox map, and the ruled caption/CTA line beneath it.
 */
export function LocationsPreview() {
  const [locations, setLocations] = useState<LocationPin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((data) => setLocations(data.locations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalMen = locations.reduce((acc, l) => acc + (l.groupSize ?? 0), 0);
  const cities = new Set(locations.map((l) => `${l.city}-${l.state}`)).size;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-10 md:pb-24 md:pt-12">
      {/* The census — set like a broadsheet stat line */}
      <div className="grid max-w-md grid-cols-3 gap-6">
        <Stat label="Cities" value={cities} loading={loading} />
        <Stat label="Groups" value={locations.length} loading={loading} />
        <Stat label="Men" value={totalMen} loading={loading} />
      </div>

      <div className="mt-10 h-[420px] border border-foreground/15 md:h-[560px]">
        <LocationMap locations={locations} className="h-full" />
      </div>

      {/* Caption / CTA row — a ruled cutline under the plate */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-foreground/15 pt-6">
        <p className="max-w-md font-serif text-base italic leading-relaxed text-muted-foreground md:text-lg">
          We meet in diners, coffee shops, gyms, garages. Wherever two or
          more can sit with the Word.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/groups"
            className="lift group inline-flex h-12 items-center gap-3 bg-foreground px-7 text-[0.95rem] font-medium text-background transition-colors hover:bg-foreground/90"
          >
            See every group
            <Icon
              name="arrow-right"
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/join?intent=start"
            className="lift inline-flex h-12 items-center gap-2 border border-foreground/70 px-7 text-xs font-medium uppercase tracking-[0.14em] text-foreground transition-colors hover:border-brass hover:text-brass"
          >
            Plant one
            <Icon name="plus" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="border-t-2 border-foreground/60 pt-3">
      <div className="display-soft text-3xl text-foreground md:text-4xl">
        {loading ? "…" : <CountUp to={value} />}
      </div>
      <div className="folio mt-1">{label}</div>
    </div>
  );
}
