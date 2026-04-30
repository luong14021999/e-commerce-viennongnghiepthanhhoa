import type { Metadata } from "next";
import { products } from "@/app/lib/data";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ id: string }> };

// Allow seller product IDs that aren't in the static catalog
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return { title: "Chi tiết sản phẩm" };
  return { title: product.name, description: product.desc };
}

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id) ?? null;
  const related = product
    ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  // If not in base catalog, ProductDetailClient will look it up from ProductContext
  return <ProductDetailClient product={product} productId={id} related={related} />;
}
