"use client";

import { useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { useProducts } from "@/app/context/ProductContext";
import { categories } from "@/app/lib/data";

const serviceCategories = categories.filter((c) => c.type === "service");
const productCategories = categories.filter((c) => c.type === "product");

export default function CategorySections() {
  const { sellerProducts } = useProducts();

  const approvedProducts = useMemo(
    () => sellerProducts.filter((p) => p.status === "approved"),
    [sellerProducts]
  );

  function getItems(categoryId: string) {
    return approvedProducts.filter((p) => p.category === categoryId);
  }

  return (
    <>
      {/* One section per product category */}
      {productCategories.map((cat, idx) => {
        const items = getItems(cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className={idx % 2 === 0 ? "bg-white py-8" : "bg-gray-50 py-8"}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="text-lg font-bold text-gray-900">{cat.label}</h2>
                </div>
                <Link href={`/san-pham?category=${cat.id}`} className="text-sm text-green-700 font-medium hover:text-green-600">
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* One section per service category */}
      {serviceCategories.map((cat, idx) => {
        const items = getItems(cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className={idx % 2 === 0 ? "bg-blue-50 border-y border-blue-100 py-8" : "bg-white py-8"}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="text-lg font-bold text-blue-900">{cat.label}</h2>
                </div>
                <Link href={`/san-pham?category=${cat.id}`} className="text-sm text-blue-700 font-medium hover:text-blue-600">
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
