import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { removeAccents } from "@/app/lib/utils";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json([]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, category, price, unit, icon, bg, seller_name, product_images(url, position)")
    .eq("status", "approved");

  const normalizedQ = removeAccents(q);

  const results = (data ?? [])
    .filter((row) => removeAccents(row.name).includes(normalizedQ))
    .slice(0, 6)
    .map((row) => {
      const images: string[] = (row.product_images ?? [])
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        .map((img: { url: string }) => img.url);
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        price: row.price,
        unit: row.unit,
        icon: row.icon,
        bg: row.bg,
        sellerName: row.seller_name,
        imageUrl: images[0] ?? null,
      };
    });

  return NextResponse.json(results);
}
