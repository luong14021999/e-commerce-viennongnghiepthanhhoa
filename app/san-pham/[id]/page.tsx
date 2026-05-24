import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductStatus } from "@/app/lib/data";
import ProductDetailClient from "./ProductDetailClient";

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
    .from("products")
    .select("name, description, price, unit, seller_name, product_images(url, position)")
    .eq("id", id)
    .single();

  if (!data) return { title: "Chi tiết sản phẩm" };

  const firstImage = (data.product_images ?? [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .map((img: { url: string }) => img.url)[0];

  const description = (data.description ?? "").slice(0, 160) ||
    `Mua ${data.name}${data.seller_name ? ` từ ${data.seller_name}` : ""} tại Viện Nông Nghiệp Thanh Hóa.`;

  const canonical = `/san-pham/${id}`;

  return {
    title: data.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: data.name,
      description,
      url: canonical,
      images: firstImage ? [{ url: firstImage, alt: data.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("products")
    .select("*, product_images(id, url, position)")
    .eq("id", id)
    .single();

  const product = row ? dbRowToProduct(row) : null;

  let related: Product[] = [];
  if (product) {
    const { data: relatedRows } = await supabase
      .from("products")
      .select("*, product_images(id, url, position)")
      .eq("category", product.category)
      .eq("status", "approved")
      .neq("id", id)
      .limit(4);
    related = (relatedRows ?? []).map(dbRowToProduct);
  }

  return <ProductDetailClient product={product} productId={id} related={related} />;
}
