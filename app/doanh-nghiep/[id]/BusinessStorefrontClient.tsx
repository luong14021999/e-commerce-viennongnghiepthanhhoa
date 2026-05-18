"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { categories } from "@/app/lib/data";
import { SITE_CATEGORIES } from "@/app/lib/categories";
import type { Product } from "@/app/lib/data";
import type { SellerProfile } from "@/app/context/ProductContext";

type Props = {
  products: Product[];
  profile: SellerProfile | null;
  sellerId: string;
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const starSize = size === "xs" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, rating - (s - 1)));
        return (
          <svg key={s} className={starSize} viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`star-${s}-${rating.toFixed(1)}`}>
                <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
                <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#star-${s}-${rating.toFixed(1)})`}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        );
      })}
    </div>
  );
}

function InfoRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        {href ? (
          <a href={href} className="text-sm font-semibold text-green-700 hover:underline break-all">{value}</a>
        ) : (
          <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function BusinessStorefrontClient({ products, profile, sellerId }: Props) {
  const [activeCategory, setActiveCategory] = useState("tat-ca");

  useEffect(() => {
    const displayName = profile?.name || "Cửa hàng";
    const accountTypeMatch = profile?.description?.match(/^\[([^\]]+)\]/);
    const entry = {
      sellerId,
      sellerName: displayName,
      address: profile?.address ?? "",
      productCount: products.length,
      verified: profile?.verified ?? false,
      accountType: accountTypeMatch ? accountTypeMatch[1] : undefined,
    };
    try {
      const stored = JSON.parse(localStorage.getItem("recentStores") ?? "[]") as typeof entry[];
      const updated = [entry, ...stored.filter((s) => s.sellerId !== sellerId)].slice(0, 10);
      localStorage.setItem("recentStores", JSON.stringify(updated));
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const productCategories = useMemo(() => {
    const ids = new Set(products.map((p) => p.category));
    return categories.filter((c) => c.type === "product" && ids.has(c.id));
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "tat-ca") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const { avgRating, totalReviews } = useMemo(() => {
    const rated = products.filter((p) => p.reviews > 0);
    if (rated.length === 0) return { avgRating: null, totalReviews: 0 };
    const sumReviews = rated.reduce((s, p) => s + p.reviews, 0);
    const weighted = rated.reduce((s, p) => s + p.rating * p.reviews, 0);
    return { avgRating: weighted / sumReviews, totalReviews: sumReviews };
  }, [products]);

  if (!profile && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
        <div className="text-6xl">🏪</div>
        <p className="text-lg font-semibold">Không tìm thấy cửa hàng này</p>
        <Link href="/san-pham" className="text-green-700 hover:underline text-sm">← Về trang sản phẩm</Link>
      </div>
    );
  }

  const displayName = profile?.name || "Doanh nghiệp";

  // Extract [AccountType] prefix from description
  const accountTypeMatch = profile?.description?.match(/^\[([^\]]+)\]/);
  const accountType = accountTypeMatch ? accountTypeMatch[1] : null;
  const cleanDescription = profile?.description
    ? profile.description.replace(/^\[[^\]]+\]\s*/, "").trim()
    : null;

  // Map category id → label
  const categoryLabel = profile?.category
    ? (SITE_CATEGORIES.find((c) => c.id === profile.category)?.label ?? null)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="text-xs text-green-300 mb-4 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>›</span>
            <Link href="/san-pham" className="hover:text-white">Sản phẩm</Link>
            <span>›</span>
            <span className="text-white">Cửa hàng</span>
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
                {accountType && (
                  <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30 flex-shrink-0">
                    {accountType}
                  </span>
                )}
              </div>

              {profile?.address && (
                <p className="text-green-200 text-sm mb-2">📍 {profile.address}</p>
              )}

              <div className="flex items-center gap-6 mt-3 flex-wrap">
                <div className="text-center">
                  <div className="text-xl font-bold">{products.length}</div>
                  <div className="text-green-300 text-xs">Sản phẩm</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-green-600" />
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {products.reduce((s, p) => s + p.sold, 0).toLocaleString()}
                  </div>
                  <div className="text-green-300 text-xs">Đã bán</div>
                </div>
                {avgRating !== null && (
                  <>
                    <div className="hidden sm:block w-px h-8 bg-green-600" />
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="text-xl font-bold">{avgRating.toFixed(1)}</span>
                        <StarRating rating={avgRating} size="sm" />
                      </div>
                      <div className="text-green-300 text-xs">{totalReviews.toLocaleString()} đánh giá</div>
                    </div>
                  </>
                )}
                {profile?.phone && (
                  <>
                    <div className="hidden sm:block w-px h-8 bg-green-600" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Info sidebar ── */}
          {profile && (
            <div className="w-full lg:w-72 lg:flex-shrink-0 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  🏢 Thông tin doanh nghiệp
                </h2>

                <div className="divide-y divide-gray-100">
                  {accountType && (
                    <InfoRow icon="🏷️" label="Loại hình" value={accountType} />
                  )}
                  {categoryLabel && (
                    <InfoRow icon="🌾" label="Lĩnh vực hoạt động" value={categoryLabel} />
                  )}
                  {profile.address && (
                    <InfoRow icon="📍" label="Địa chỉ" value={profile.address} />
                  )}
                  {profile.contactName && (
                    <InfoRow icon="👤" label="Người đại diện" value={profile.contactName} />
                  )}
                  {profile.phone && (
                    <InfoRow icon="📞" label="Điện thoại" value={profile.phone} href={`tel:${profile.phone}`} />
                  )}
                  {profile.email && (
                    <InfoRow icon="✉️" label="Email" value={profile.email} href={`mailto:${profile.email}`} />
                  )}
                </div>

                {avgRating !== null && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-2">Đánh giá gian hàng</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-500">{avgRating.toFixed(1)}</span>
                      <div>
                        <StarRating rating={avgRating} size="sm" />
                        <p className="text-xs text-gray-400 mt-0.5">{totalReviews.toLocaleString()} lượt đánh giá</p>
                      </div>
                    </div>
                  </div>
                )}

                {cleanDescription && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1.5">Giới thiệu</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{cleanDescription}</p>
                  </div>
                )}
              </div>

              {/* CTA contact card */}
              {(profile.phone || profile.email) && (
                <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-5 text-white">
                  <p className="font-bold text-sm mb-1">Liên hệ tư vấn</p>
                  <p className="text-green-200 text-xs mb-4 leading-relaxed">Đặt hàng số lượng lớn, hợp tác kinh doanh.</p>
                  <div className="flex flex-col gap-2">
                    {profile.phone && (
                      <a href={`tel:${profile.phone}`} className="bg-white text-green-700 font-bold px-4 py-2 rounded-xl text-sm text-center hover:bg-green-50 transition-colors">
                        📞 Gọi ngay
                      </a>
                    )}
                    {profile.email && (
                      <a href={`mailto:${profile.email}`} className="border border-white/40 text-white font-semibold px-4 py-2 rounded-xl text-sm text-center hover:bg-white/10 transition-colors">
                        ✉️ Gửi email
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Product grid ── */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-gray-500 font-medium">Cửa hàng chưa có sản phẩm nào.</p>
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

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
