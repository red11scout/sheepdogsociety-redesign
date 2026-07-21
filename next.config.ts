import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Type errors fail the build (not skipped).
  typescript: {
    ignoreBuildErrors: false,
  },
  // Letter cover images are uploaded to Vercel Blob and rendered via next/image.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
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
      // Stories live on the About page now
      { source: "/stories", destination: "/about#stories", permanent: true },
      // Pre-redesign routes fully retired (no destination page): forward each
      // to its nearest live home so old inbound links never 404 or bounce to
      // the admin sign-in. Kept here (not the middleware allowlist) so the
      // redirect fires before auth.
      { source: "/devotionals", destination: "/letter", permanent: true },
      { source: "/devotionals/:slug", destination: "/letter", permanent: true },
      { source: "/blog", destination: "/letter", permanent: true },
      { source: "/blog/:slug", destination: "/letter", permanent: true },
      { source: "/merch", destination: "/support", permanent: true },
      { source: "/statement-of-faith", destination: "/about", permanent: true },
      { source: "/scripture-reader", destination: "/acts-20-28", permanent: true },
      { source: "/daily-scripture", destination: "/acts-20-28", permanent: true },
    ];
  },
};

export default nextConfig;
