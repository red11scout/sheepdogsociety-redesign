import type { MetadataRoute } from "next";
import { listPublishedEncouragements } from "@/server/encouragements";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acts2028sheepdogsociety.com";

// Refresh hourly so newly published letters enter the sitemap without a rebuild.
export const revalidate = 3600;

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/letter", priority: 0.9, changeFrequency: "weekly" },
  { path: "/groups", priority: 0.8, changeFrequency: "weekly" },
  { path: "/join", priority: 0.8, changeFrequency: "monthly" },
  { path: "/events", priority: 0.7, changeFrequency: "weekly" },
  { path: "/resources", priority: 0.7, changeFrequency: "weekly" },
  { path: "/new-here", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/acts-20-28", priority: 0.5, changeFrequency: "yearly" },
  { path: "/support", priority: 0.4, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/sms-terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let letterEntries: MetadataRoute.Sitemap = [];
  try {
    const letters = await listPublishedEncouragements();
    letterEntries = letters.map((l) => ({
      url: `${BASE}/letter/${l.slug}`,
      lastModified: l.publishDate ?? now,
      changeFrequency: "yearly",
      priority: 0.6,
    }));
  } catch {
    // DB unavailable at build/ISR time — still emit the static sitemap.
  }

  return [...staticEntries, ...letterEntries];
}
