"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProducts } from "@/app/context/ProductContext";

export default function BusinessProductsSection() {
  const { getByStatus, sellerProfiles } = useProducts();

  const businesses = useMemo(() => {
    const approved = getByStatus("approved").filter(
      (p) => !!p.sellerId && p.sellerName !== "Viện Nông Nghiệp Thanh Hóa"
    );
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🏪 Doanh nghiệp đối tác
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {businesses.length} doanh nghiệp đang kinh doanh trên sàn
          </p>
        </div>
        <Link
          href="/san-pham"
          className="text-sm font-semibold text-green-700 hover:text-green-600 transition-colors hidden sm:block"
        >
          Xem tất cả →
        </Link>
      </div>

      {/* Business cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map(([sellerId, bizProducts]) => {
          const profile = sellerProfiles[sellerId];
          const sellerName = profile?.name ?? bizProducts[0]?.sellerName ?? sellerId;

          return (
            <div
              key={sellerId}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Card header */}
              <div className="bg-gradient-to-r from-green-800 to-green-700 px-5 py-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-2xl border border-white/25 flex-shrink-0">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{sellerName}</h3>
                    {profile?.verified && (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-400 flex-shrink-0">
                        ✓ Xác minh
                      </span>
                    )}
                  </div>
                  {profile?.address && (
                    <p className="text-green-200 text-xs mt-0.5 line-clamp-1">📍 {profile.address}</p>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>📦</span>
                    <strong className="text-gray-900">{bizProducts.length}</strong> sản phẩm
                  </span>
                  {bizProducts.reduce((s, p) => s + p.sold, 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <span>🛒</span>
                      <strong className="text-gray-900">{bizProducts.reduce((s, p) => s + p.sold, 0).toLocaleString()}</strong> đã bán
                    </span>
                  )}
                </div>

                {/* Description */}
                {profile?.description ? (
                  <p className="text-sm text-gray-500 line-clamp-2 flex-1">{profile.description}</p>
                ) : (
                  <div className="flex-1" />
                )}

                {/* CTA */}
                <Link
                  href={`/doanh-nghiep/${sellerId}`}
                  className="mt-auto w-full text-center bg-green-700 hover:bg-green-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
                >
                  Xem gian hàng →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
