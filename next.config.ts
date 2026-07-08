import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build (handled in CI)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow Clerk/Supabase images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // Five Rooms IA — every retired URL forwards DIRECTLY to its final home.
  // Central so no in-app stub pages exist and no redirect chains form.
  // Spec: docs/superpowers/specs/2026-07-08-ia-simplification-design.md
  async redirects() {
    return [
      // The Letter (was /encouragements; ancient /letter/archive variant too)
      { source: "/encouragements", destination: "/letter", permanent: true },
      { source: "/encouragements/:slug", destination: "/letter/:slug", permanent: true },
      { source: "/letter/archive", destination: "/letter", permanent: true },
      // Groups (was /locations); the separate plant-a-group form folds into Join.
      // /locations/request MUST precede /locations/:id so the static segment wins.
      { source: "/locations", destination: "/groups", permanent: true },
      { source: "/locations/request", destination: "/join?intent=start", permanent: true },
      { source: "/locations/:id", destination: "/groups/:id", permanent: true },
      { source: "/groups/start", destination: "/join?intent=start", permanent: true },
      // One explainer to rule them all
      { source: "/get-started", destination: "/new-here", permanent: true },
      { source: "/what-to-expect", destination: "/new-here", permanent: true },
      { source: "/how-we-gather", destination: "/new-here", permanent: true },
      { source: "/faq", destination: "/new-here#faq", permanent: true },
      // Support absorbs giving + partnerships (both were orphaned duplicates)
      { source: "/giving", destination: "/support", permanent: true },
      { source: "/partnerships", destination: "/support", permanent: true },
      // Gallery content lives on event pages now
      { source: "/gallery", destination: "/events", permanent: true },
      { source: "/gallery/:id", destination: "/events", permanent: true },
    ];
  },
};

export default nextConfig;
