import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://tewzkludsphysutznwmb.supabase.co/**"),
    ],
  },
};

export default nextConfig;
