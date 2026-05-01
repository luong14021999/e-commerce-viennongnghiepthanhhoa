"use client";

import { useMemo } from "react";
import ProductCard from "@/app/components/ProductCard";
import { useProducts } from "@/app/context/ProductContext";

export default function BusinessProductsSection() {
  const { getByStatus, sellerProfiles } = useProducts();

  const businesses = useMemo(() => {
    const approved = getByStatus("approved").filter((p) => p.sellerName !== "Viện Nông Nghiệp Thanh Hóa");
    const byId: Record<string, typeof approved> = {};
    for (const p of approved) {
      if (!p.sellerId) continue;
      if (!byId[p.sellerId]) byId[p.sellerId] = [];
      byId[p.sellerId].push(p);
    }
    return Object.entries(byId);
  }, [getByStatus]);

  if (businesses.length === 0) return null;

  return (
    <>
      {/* Section heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏪</span>
          <h2 className="text-lg font-bold text-gray-900">Sản phẩm từ doanh nghiệp đối tác</h2>
        </div>
      </div>

      {/* One full-width section per business */}
      {businesses.map(([sellerId, bizProducts], idx) => {
        const profile = sellerProfiles[sellerId];
        const sellerName = profile?.name ?? bizProducts[0]?.sellerName ?? sellerId;

        return (
          <section
            key={sellerId}
            className={idx % 2 === 0 ? "bg-white py-6" : "bg-gray-50 py-6"}
          >
            {/* Business header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{sellerName}</span>
                    {profile?.verified && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-200">
                        ✓ Đã xác minh
                      </span>
                    )}
                    {profile?.address && (
                      <span className="text-gray-400 text-xs hidden sm:inline">📍 {profile.address}</span>
                    )}
                  </div>
                  {profile?.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{profile.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">{bizProducts.length} sản phẩm</span>
              </div>
            </div>

            {/* Horizontal product scroll – full width with side padding matching container */}
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {bizProducts.map((p) => (
                  <div key={p.id} className="flex-shrink-0 w-44 sm:w-52">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
