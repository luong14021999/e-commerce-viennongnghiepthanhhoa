"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { products as baseProducts, categories } from "@/app/lib/data";
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

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery] = useState(initialQuery);

  const { getByStatus } = useProducts();
  // Merge base catalog with approved seller products (deduplicate by id)
  const allProducts = useMemo(() => {
    const approvedSeller = getByStatus("approved");
    const baseIds = new Set(baseProducts.map((p) => p.id));
    const newSeller = approvedSeller.filter((p) => !baseIds.has(p.id));
    return [...baseProducts, ...newSeller];
  }, [getByStatus]);

  const filtered = useMemo(() => {
    let list = [...allProducts];
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
  }, [allProducts, activeCategory, sortBy, searchQuery]);

  const sellerCount = allProducts.filter((p) => p.sellerId).length;

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Tất cả sản phẩm"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-green-200 flex-wrap">
            <span>{filtered.length} sản phẩm</span>
            {sellerCount > 0 && (
              <span className="flex items-center gap-1.5 bg-green-700/50 border border-green-600/40 px-3 py-1 rounded-full text-xs">
                🏪 {sellerCount} sản phẩm từ doanh nghiệp đã xác minh
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeCategory === cat.id
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Sort + count bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="font-semibold text-gray-800">{filtered.length}</span> sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 mb-6">Hãy thử tìm kiếm với từ khóa khác</p>
            <button
              onClick={() => setActiveCategory("tat-ca")}
              className="bg-green-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-green-700 transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="relative">
                {p.sellerId && (
                  <div className="absolute -top-1.5 left-2 z-10">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">🏪 Doanh nghiệp</span>
                  </div>
                )}
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}

        {/* CTA for businesses */}
        <div className="mt-10 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg mb-1">Bạn là doanh nghiệp nông nghiệp?</p>
            <p className="text-green-200 text-sm">Đăng ký để đưa sản phẩm của bạn lên sàn Viện Nông Nghiệp Thanh Hóa.</p>
          </div>
          <Link
            href="/dang-ky"
            className="flex-shrink-0 bg-white text-green-700 font-bold px-6 py-2.5 rounded-full hover:bg-green-50 transition-colors text-sm shadow"
          >
            Đăng ký bán hàng →
          </Link>
        </div>
      </div>
    </div>
  );
}
