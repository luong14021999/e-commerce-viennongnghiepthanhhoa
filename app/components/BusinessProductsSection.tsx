"use client";

import { useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { useProducts } from "@/app/context/ProductContext";
import { formatPrice } from "@/app/lib/data";

const PREVIEW_COUNT = 4;

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
    <section className="bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🏪 Doanh nghiệp đối tác
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {businesses.length} doanh nghiệp đang cung cấp sản phẩm trên sàn
            </p>
          </div>
          <Link
            href="/san-pham?source=business"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-600 transition-colors"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* Business cards */}
        <div className="space-y-6">
          {businesses.map(([sellerId, bizProducts]) => {
            const profile = sellerProfiles[sellerId];
            const sellerName = profile?.name ?? bizProducts[0]?.sellerName ?? sellerId;
            const preview = bizProducts.slice(0, PREVIEW_COUNT);
            const remaining = bizProducts.length - PREVIEW_COUNT;
            const totalSold = bizProducts.reduce((s, p) => s + p.sold, 0);
            const minPrice = Math.min(...bizProducts.filter(p => p.price > 0).map(p => p.price));

            return (
              <div key={sellerId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Business header */}
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-5 py-4 flex items-center gap-4 flex-wrap">
                  <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-2xl border border-white/25 flex-shrink-0">
                    🏪
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base leading-tight">{sellerName}</h3>
                      {profile?.verified && (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-400 flex-shrink-0">
                          ✓ Đã xác minh
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {profile?.address && (
                        <span className="text-green-200 text-xs">📍 {profile.address}</span>
                      )}
                      <span className="text-green-300 text-xs">📦 {bizProducts.length} sản phẩm</span>
                      {totalSold > 0 && (
                        <span className="text-green-300 text-xs">🛒 {totalSold.toLocaleString()} đã bán</span>
                      )}
                      {minPrice > 0 && (
                        <span className="text-green-200 text-xs">Từ {formatPrice(minPrice)}</span>
                      )}
                    </div>
                    {profile?.description && (
                      <p className="text-green-200 text-xs mt-1 line-clamp-1">{profile.description}</p>
                    )}
                  </div>
                  <Link
                    href={`/doanh-nghiep/${sellerId}`}
                    className="flex-shrink-0 bg-white text-green-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-green-50 transition-colors flex items-center gap-1"
                  >
                    Xem gian hàng →
                  </Link>
                </div>

                {/* Products grid */}
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {preview.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                    {remaining > 0 && (
                      <Link
                        href={`/doanh-nghiep/${sellerId}`}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 transition-colors text-green-600 min-h-[160px] gap-2"
                      >
                        <span className="text-3xl">+{remaining}</span>
                        <span className="text-xs font-semibold">sản phẩm nữa</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 text-center sm:hidden">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-600"
          >
            Xem tất cả doanh nghiệp →
          </Link>
        </div>
      </div>
    </section>
  );
}
