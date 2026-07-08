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
    ];
  },
};

export default nextConfig;
