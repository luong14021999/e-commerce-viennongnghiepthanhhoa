import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("reviews").select("product_id, rating");

  if (!data) return NextResponse.json({});

  const stats: Record<string, { avgRating: number; count: number }> = {};
  for (const row of data) {
    if (!stats[row.product_id]) stats[row.product_id] = { avgRating: 0, count: 0 };
    stats[row.product_id].count++;
    stats[row.product_id].avgRating += row.rating;
  }
  for (const id of Object.keys(stats)) {
    stats[id].avgRating = Math.round((stats[id].avgRating / stats[id].count) * 10) / 10;
  }

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
  });
}
