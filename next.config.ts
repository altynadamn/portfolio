import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Lets a production build/profile run next to `next dev` without sharing .next
  // (e.g. NEXT_DIST_DIR=.next-prod next build && NEXT_DIST_DIR=.next-prod next start).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
