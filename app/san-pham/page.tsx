"use client";

import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { categories, formatPrice } from "@/app/lib/data";
import { useProducts } from "@/app/context/ProductContext";

const sortOptions = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "tat-ca";
  const initialQuery = searchParams.get("q") ?? "";

  const [source, setSource] = useState<"institute" | "business">("institute");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery] = useState(initialQuery);

  const { getByStatus, sellerProfiles, getBySeller } = useProducts();

  const allApproved = useMemo(() => getByStatus("approved"), [getByStatus]);
  const instituteProducts = useMemo(() => allApproved.filter((p) => !p.sellerId), [allApproved]);

  const businessIds = useMemo(() => {
    return [...new Set(allApproved.filter((p) => !!p.sellerId).map((p) => p.sellerId).filter(Boolean))] as string[];
  }, [allApproved]);

  const filtered = useMemo(() => {
    let list = [...instituteProducts];
    if (activeCategory !== "tat-ca") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-asc": return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "rating": return [...list].sort((a, b) => b.rating - a.rating);
      case "newest": return [...list].reverse();
      default: return [...list].sort((a, b) => b.sold - a.sold);
    }
  }, [instituteProducts, activeCategory, sortBy, searchQuery]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-green-300 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>›</span>
            <span className="text-white">Sản phẩm</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Sản phẩm & Dịch vụ"}
          </h1>
          {/* Source switcher */}
          <div className="flex gap-2 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => { setSource("institute"); setActiveCategory("tat-ca"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${source === "institute" ? "bg-white text-green-800 shadow" : "text-green-200 hover:text-white"}`}
            >
              🌾 Sản phẩm của Viện
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${source === "institute" ? "bg-green-100 text-green-700" : "bg-white/20"}`}>{instituteProducts.length}</span>
            </button>
            <button
              onClick={() => { setSource("business"); setActiveCategory("tat-ca"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${source === "business" ? "bg-white text-green-800 shadow" : "text-green-200 hover:text-white"}`}
            >
              🏪 Doanh nghiệp đối tác
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${source === "business" ? "bg-green-100 text-green-700" : "bg-white/20"}`}>{businessIds.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── INSTITUTE SECTION ── */}
        {source === "institute" && (
          <>
            {/* Category tabs */}
            <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6 flex gap-1 overflow-x-auto scrollbar-hide items-center">
              {categories.filter((c) => c.type === "all").map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === cat.id ? "bg-green-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                  {cat.icon} {cat.label}
                </button>
              ))}
              <span className="w-px h-6 bg-gray-200 flex-shrink-0" />
              <span className="text-xs text-blue-500 font-semibold px-1 whitespace-nowrap flex-shrink-0">Dịch vụ</span>
              {categories.filter((c) => c.type === "service").map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === cat.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-blue-50"}`}>
                  {cat.icon} {cat.label}
                </button>
              ))}
              <span className="w-px h-6 bg-gray-200 flex-shrink-0" />
              <span className="text-xs text-green-600 font-semibold px-1 whitespace-nowrap flex-shrink-0">Sản phẩm</span>
              {categories.filter((c) => c.type === "product").map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === cat.id ? "bg-green-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Sort + count */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                Hiển thị <span className="font-semibold text-gray-800">{filtered.length}</span> sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sắp xếp:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-6">Hãy thử tìm kiếm với từ khóa khác</p>
                <button onClick={() => setActiveCategory("tat-ca")}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-green-700 transition-colors">
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </>
        )}

        {/* ── BUSINESS SECTION ── */}
        {source === "business" && (
          <>
            {businessIds.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🏪</div>
                <p className="text-gray-500 font-medium">Chưa có doanh nghiệp nào đăng sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {businessIds.map((sellerId) => {
                  const profile = sellerProfiles[sellerId];
                  const bizProducts = getBySeller(sellerId).filter((p) => p.status === "approved");
                  const sellerName = profile?.name ?? bizProducts[0]?.sellerName ?? sellerId;
                  const totalSold = bizProducts.reduce((s, p) => s + p.sold, 0);
                  const preview = bizProducts.slice(0, 3);
                  return (
                    <div key={sellerId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Business header */}
                      <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl border border-white/30 flex-shrink-0">🏪</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-bold text-sm leading-tight line-clamp-1">{sellerName}</p>
                            {profile?.verified && (
                              <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-400 flex-shrink-0">✓ Xác minh</span>
                            )}
                          </div>
                          {profile?.address && (
                            <p className="text-green-200 text-xs mt-0.5 line-clamp-1">📍 {profile.address}</p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <span className="text-base">📦</span>
                          <span><strong className="text-gray-900">{bizProducts.length}</strong> sản phẩm</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <span className="text-base">🛒</span>
                          <span><strong className="text-gray-900">{totalSold.toLocaleString()}</strong> đã bán</span>
                        </div>
                      </div>

                      {/* Product preview */}
                      {preview.length > 0 && (
                        <div className="px-4 py-3 flex gap-2">
                          {preview.map((p) => (
                            <div key={p.id} className="flex-1">
                              <div className={`${p.bg} w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center text-2xl mb-1 relative`}>
                                {(p.images?.[0] ?? p.imageUrl)
                                  ? <Image src={p.images?.[0] ?? p.imageUrl!} alt={p.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 200px" />
                                  : <span>{p.icon}</span>
                                }
                              </div>
                              <p className="text-[11px] text-gray-600 line-clamp-1 font-medium">{p.name}</p>
                              <p className="text-[11px] text-green-700 font-bold">{p.price > 0 ? formatPrice(p.price) : "Liên hệ"}</p>
                            </div>
                          ))}
                          {bizProducts.length > 3 && (
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-xs text-gray-400 font-semibold">+{bizProducts.length - 3} nữa</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {profile?.description && (
                        <div className="px-4 pb-3">
                          <p className="text-xs text-gray-500 line-clamp-2">{profile.description}</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                        <Link href={`/doanh-nghiep/${sellerId}`}
                          className="flex-1 text-center bg-green-700 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">
                          Xem gian hàng →
                        </Link>
                        {profile?.phone && (
                          <a href={`tel:${profile.phone}`}
                            className="border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                            📞
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CTA for businesses */}
        <div className="mt-10 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg mb-1">Bạn là doanh nghiệp nông nghiệp?</p>
            <p className="text-green-200 text-sm">Đăng ký để đưa sản phẩm của bạn lên sàn Viện Nông Nghiệp Thanh Hóa.</p>
          </div>
          <Link href="/dang-ky"
            className="flex-shrink-0 bg-white text-green-700 font-bold px-6 py-2.5 rounded-full hover:bg-green-50 transition-colors text-sm shadow">
            Đăng ký bán hàng →
          </Link>
        </div>
      </div>
    </div>
  );
}
