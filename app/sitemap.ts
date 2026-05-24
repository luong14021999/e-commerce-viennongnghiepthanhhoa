import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: products }, { data: profiles }] = await Promise.all([
    supabase.from("products").select("id, submitted_at").eq("status", "approved"),
    supabase.from("business_profiles").select("id"),
  ]);

  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/san-pham`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/san-pham/${p.id}`,
    lastModified: p.submitted_at ? new Date(p.submitted_at) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const storefrontUrls: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${SITE_URL}/doanh-nghiep/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticUrls, ...productUrls, ...storefrontUrls];
}
