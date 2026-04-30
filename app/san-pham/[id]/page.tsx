import type { Metadata } from "next";
import { products } from "@/app/lib/data";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return { title: "Chi tiết sản phẩm" };
  return { title: product.name, description: product.desc };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id) ?? null;
  const related = product
    ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  return <ProductDetailClient product={product} productId={id} related={related} />;
}
