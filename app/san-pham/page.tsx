import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductStatus } from "@/app/lib/data";
import ProductsClient from "./ProductsClient";

export const revalidate = 60;

export const metadata: Metadata = { title: "Sản phẩm & Dịch vụ" };

export type BusinessCard = {
  sellerId: string;
  sellerName: string;
  verified: boolean;
  address: string;
  description: string;
  phone: string;
  productCount: number;
  totalSold: number;
  preview: Product[];
};

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

export default async function ProductsPage() {
  const supabase = await createClient();

  const [instituteRes, businessRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(id, url, position)")
      .eq("status", "approved")
      .is("seller_id", null)
      .order("sold", { ascending: false }),
    supabase
      .from("products")
      .select("*, product_images(id, url, position)")
      .eq("status", "approved")
      .not("seller_id", "is", null)
      .order("submitted_at", { ascending: false }),
  ]);

  const instituteProducts = (instituteRes.data ?? []).map(dbRowToProduct);
  const businessProducts  = (businessRes.data ?? []).map(dbRowToProduct);

  const sellerIds = [
    ...new Set(businessProducts.map((p) => p.sellerId).filter(Boolean)),
  ] as string[];

  const { data: profileData } = sellerIds.length > 0
    ? await supabase
        .from("business_profiles")
        .select("id, business_name, business_address, description, verified, profiles(phone, email)")
        .in("id", sellerIds)
    : { data: [] };

  const profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));

  const businesses: BusinessCard[] = sellerIds.map((sellerId) => {
    const bizProds  = businessProducts.filter((p) => p.sellerId === sellerId);
    const bp        = profileMap.get(sellerId);
    const profileRow = bp?.profiles as unknown as Record<string, string> | null;
    return {
      sellerId,
      sellerName:   bp?.business_name    ?? bizProds[0]?.sellerName ?? sellerId,
      verified:     bp?.verified         ?? false,
      address:      bp?.business_address ?? "",
      description:  bp?.description      ?? "",
      phone:        profileRow?.phone    ?? "",
      productCount: bizProds.length,
      totalSold:    bizProds.reduce((s, p) => s + p.sold, 0),
      preview:      bizProds.slice(0, 3),
    };
  });

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>}>
      <ProductsClient instituteProducts={instituteProducts} businesses={businesses} />
    </Suspense>
  );
}
