"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { categories } from "@/app/lib/data";
import type { Product } from "@/app/lib/data";
import type { SellerProfile } from "@/app/context/ProductContext";

type Props = {
  products: Product[];
  profile: SellerProfile | null;
  sellerId: string;
};

export default function BusinessStorefrontClient({ products, profile, sellerId }: Props) {
  const [activeCategory, setActiveCategory] = useState("tat-ca");

  const productCategories = useMemo(() => {
    const ids = new Set(products.map((p) => p.category));
    return categories.filter((c) => c.type === "product" && ids.has(c.id));
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "tat-ca") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  if (!profile && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
        <div className="text-6xl">🏪</div>
        <p className="text-lg font-semibold">Không tìm thấy gian hàng này</p>
        <Link href="/san-pham" className="text-green-700 hover:underline text-sm">← Về trang sản phẩm</Link>
      </div>
    );
  }

  const displayName = profile?.name ?? products[0]?.sellerName ?? "Doanh nghiệp";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="text-xs text-green-300 mb-4 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>›</span>
            <span className="text-white">Gian hàng</span>
          </nav>

          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl border border-white/30 flex-shrink-0">
              🏪
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
                {profile?.verified && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full border border-green-400 flex-shrink-0">
                    ✓ Đã xác minh
                  </span>
                )}
              </div>

              {profile?.address && (
                <p className="text-green-200 text-sm mb-1">📍 {profile.address}</p>
              )}
              {profile?.description && (
                <p className="text-green-100 text-sm max-w-2xl leading-relaxed">{profile.description}</p>
              )}

              <div className="flex items-center gap-6 mt-4 flex-wrap">
                <div className="text-center">
                  <div className="text-xl font-bold">{products.length}</div>
                  <div className="text-green-300 text-xs">Sản phẩm</div>
                </div>
                <div className="w-px h-8 bg-green-600" />
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {products.reduce((s, p) => s + p.sold, 0).toLocaleString()}
                  </div>
                  <div className="text-green-300 text-xs">Đã bán</div>
                </div>
                {profile?.phone && (
                  <>
                    <div className="w-px h-8 bg-green-600" />
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                      📞 {profile.phone}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 font-medium">Gian hàng chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <>
            {productCategories.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveCategory("tat-ca")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeCategory === "tat-ca"
                      ? "bg-green-700 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
                  }`}
                >
                  🛒 Tất cả ({products.length})
                </button>
                {productCategories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                        activeCategory === cat.id
                          ? "bg-green-700 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
                      }`}
                    >
                      {cat.icon} {cat.label} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}

        {profile && (
          <div className="mt-10 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg mb-1">Liên hệ {displayName}</p>
              <p className="text-green-200 text-sm">Tư vấn sản phẩm, đặt hàng số lượng lớn và hợp tác kinh doanh.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="bg-white text-green-700 font-bold px-5 py-2.5 rounded-full hover:bg-green-50 transition-colors text-sm">
                  📞 Gọi ngay
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="border-2 border-white/40 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-sm">
                  ✉️ Nhắn tin
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
