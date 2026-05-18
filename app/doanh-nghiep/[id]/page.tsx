import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductStatus } from "@/app/lib/data";
import type { SellerProfile } from "@/app/context/ProductContext";
import BusinessStorefrontClient from "./BusinessStorefrontClient";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToProduct(row: any): Product {
  const images: string[] = (row.product_images ?? [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .map((img: { url: string }) => img.url);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    price: row.price,
    originalPrice: row.original_price,
    unit: row.unit,
    icon: row.icon,
    bg: row.bg,
    tag: row.tag ?? undefined,
    tagColor: row.tag_color ?? undefined,
    rating: row.rating,
    reviews: row.reviews,
    sold: row.sold,
    desc: row.description,
    specs: row.specs ?? [],
    origin: row.origin,
    certifications: row.certifications ?? [],
    imageUrl: images[0],
    images: images.length > 0 ? images : undefined,
    sellerId: row.seller_id ?? undefined,
    sellerName: row.seller_name ?? undefined,
    status: row.status as ProductStatus,
    submittedAt: row.submitted_at,
    rejectionReason: row.rejection_reason ?? undefined,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_profiles")
    .select("business_name")
    .eq("id", id)
    .single();
  const name = data?.business_name ?? "Gian hàng doanh nghiệp";
  return { title: name, description: `Xem sản phẩm của ${name} trên Viện Nông Nghiệp Thanh Hóa` };
}

export default async function BusinessStorefrontPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [productsRes, profileRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(id, url, position)")
      .eq("seller_id", id)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("business_profiles")
      .select("*, profiles(name, phone, email)")
      .eq("id", id)
      .single(),
  ]);

  const products = (productsRes.data ?? []).map(dbRowToProduct);

  const bp = profileRes.data;
  const profileRow = bp?.profiles as Record<string, string> | null;
  const profile: SellerProfile | null = bp
    ? {
        id,
        name: bp.business_name ?? "",
        description: bp.description ?? "",
        address: bp.business_address ?? "",
        category: bp.category ?? "",
        verified: bp.verified ?? false,
        phone: profileRow?.phone ?? undefined,
        email: profileRow?.email ?? undefined,
        contactName: profileRow?.name ?? undefined,
      }
    : null;

  return <BusinessStorefrontClient products={products} profile={profile} sellerId={id} />;
}
