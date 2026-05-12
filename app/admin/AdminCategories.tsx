"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useProducts } from "@/app/context/ProductContext";
import { SITE_CATEGORIES } from "@/app/lib/categories";
import { formatPrice } from "@/app/lib/data";
import type { Product } from "@/app/lib/data";

const ALL_CATS = SITE_CATEGORIES.filter(c => c.type !== "all");

export default function AdminCategories() {
  const { sellerProducts, updateProduct } = useProducts();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());
  const [reassigning, setReassigning] = useState<string | null>(null); // productId
  const [movingTo, setMovingTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");

  const approved = sellerProducts.filter(p => p.status === "approved");

  const countMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of approved) {
      m[p.category] = (m[p.category] ?? 0) + 1;
    }
    return m;
  }, [approved]);

  const uncategorised = useMemo(
    () => approved.filter(p => !ALL_CATS.find(c => c.id === p.category)),
    [approved]
  );

  const visibleCats = ALL_CATS.filter(c =>
    typeFilter === "all" ? true : c.type === typeFilter
  );

  const catProducts: Product[] = useMemo(() => {
    if (!selectedCat) return [];
    if (selectedCat === "__none__") return uncategorised;
    return approved.filter(p => p.category === selectedCat);
  }, [selectedCat, approved, uncategorised]);

  const filteredCatProducts = useMemo(() => {
    if (!search.trim()) return catProducts;
    const q = search.toLowerCase();
    return catProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.sellerName ?? "").toLowerCase().includes(q)
    );
  }, [catProducts, search]);

  function toggleHide(id: string) {
    setHiddenCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleReassign(product: Product) {
    if (!movingTo || movingTo === product.category) { setReassigning(null); return; }
    setSaving(true);
    await updateProduct(product.id, { category: movingTo }, []);
    setReassigning(null);
    setMovingTo("");
    setSaving(false);
  }

  const selectedCatObj = ALL_CATS.find(c => c.id === selectedCat);

  return (
    <div className="flex gap-5 items-start">
      {/* ── Left: category list ── */}
      <div className={`w-full lg:w-72 lg:flex-shrink-0 ${selectedCat ? "hidden lg:block" : "block"}`}>
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Danh mục", value: ALL_CATS.length, icon: "📁" },
            { label: "Sản phẩm", value: approved.filter(p => p.type !== "service").length, icon: "📦" },
            { label: "Dịch vụ",  value: approved.filter(p => p.type === "service").length, icon: "🛠️" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-lg">{s.icon}</div>
              <div className="font-bold text-gray-900">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-1 mb-3 bg-white border border-gray-200 rounded-xl p-1">
          {(["all","product","service"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${typeFilter === t ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-800"}`}>
              {t === "all" ? "Tất cả" : t === "product" ? "Sản phẩm" : "Dịch vụ"}
            </button>
          ))}
        </div>

        {/* Category list */}
        <div className="space-y-1.5">
          {visibleCats.map(cat => {
            const count = countMap[cat.id] ?? 0;
            const hidden = hiddenCats.has(cat.id);
            const isActive = selectedCat === cat.id;
            return (
              <div key={cat.id}
                className={`rounded-xl border transition-all ${isActive ? "border-green-500 bg-green-50 shadow-sm" : "border-gray-200 bg-white"} ${hidden ? "opacity-50" : ""}`}>
                <button
                  onClick={() => { setSelectedCat(cat.id); setSearch(""); setReassigning(null); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5"
                >
                  <span className="text-lg flex-shrink-0">{cat.icon}</span>
                  <span className={`flex-1 text-xs font-bold leading-snug truncate ${isActive ? "text-green-800" : "text-gray-800"}`}>{cat.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${count > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>{count}</span>
                </button>
                <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                  <button onClick={() => toggleHide(cat.id)}
                    className="flex-1 text-center text-[10px] py-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                    {hidden ? "👁️ Hiện" : "🙈 Ẩn"}
                  </button>
                  <button onClick={() => { setSelectedCat(cat.id); setSearch(""); }}
                    className="flex-1 text-center text-[10px] py-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                    ✏️ Sản phẩm
                  </button>
                </div>
              </div>
            );
          })}

          {/* Uncategorised */}
          {uncategorised.length > 0 && (
            <button
              onClick={() => { setSelectedCat("__none__"); setSearch(""); }}
              className={`w-full text-left rounded-xl border px-3 py-2.5 flex items-center gap-3 transition-all ${selectedCat === "__none__" ? "border-red-400 bg-red-50" : "border-red-200 bg-white hover:border-red-300"}`}>
              <span className="text-lg">⚠️</span>
              <span className="flex-1 text-xs font-bold text-red-700">Chưa phân loại</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{uncategorised.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Right: product list ── */}
      {selectedCat && (
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex items-center gap-3 flex-wrap">
            <button onClick={() => setSelectedCat(null)} className="lg:hidden text-blue-600 font-semibold text-sm flex items-center gap-1 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              Danh mục
            </button>
            {selectedCatObj ? (
              <>
                <span className="text-2xl">{selectedCatObj.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 leading-tight">{selectedCatObj.label}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {catProducts.length} sản phẩm
                    {hiddenCats.has(selectedCat) && <span className="ml-2 text-amber-600 font-semibold">· Đang ẩn trên trang</span>}
                  </p>
                </div>
                {hiddenCats.has(selectedCat) ? (
                  <button onClick={() => toggleHide(selectedCat)} className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors flex-shrink-0">
                    👁️ Hiện danh mục
                  </button>
                ) : (
                  <button onClick={() => toggleHide(selectedCat)} className="text-xs border border-gray-200 text-gray-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                    🙈 Ẩn danh mục
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1">
                <h2 className="font-bold text-red-700">⚠️ Sản phẩm chưa phân loại</h2>
                <p className="text-xs text-gray-500 mt-0.5">Cần gán danh mục cho các sản phẩm này</p>
              </div>
            )}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm, gian hàng..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
          />

          {/* Product table */}
          {filteredCatProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">Không có sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCatProducts.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="flex gap-3 items-start">
                    {/* Thumbnail */}
                    <div className={`${p.bg} w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-2xl flex-shrink-0 relative`}>
                      {(p.images?.[0] ?? p.imageUrl)
                        ? <Image src={p.images?.[0] ?? p.imageUrl!} alt={p.name} fill className="object-cover" sizes="56px" />
                        : <span>{p.icon}</span>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="font-bold text-sm text-gray-900 flex-1 min-w-0">{p.name}</p>
                        {p.tag && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${p.tagColor ?? "bg-gray-100 text-gray-600"}`}>{p.tag}</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          p.status === "approved" ? "bg-green-100 text-green-700" :
                          p.status === "pending"  ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>
                          {p.status === "approved" ? "✅ Đã duyệt" : p.status === "pending" ? "⏳ Chờ" : "❌ Từ chối"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        🏪 {p.sellerName ?? "Viện Nông Nghiệp"}
                        <span className="mx-1.5">·</span>
                        💰 {p.price > 0 ? `${formatPrice(p.price)}/${p.unit}` : "Liên hệ"}
                      </p>

                      {/* Reassign section */}
                      {reassigning === p.id ? (
                        <div className="mt-3 flex gap-2 items-center flex-wrap">
                          <select
                            value={movingTo}
                            onChange={e => setMovingTo(e.target.value)}
                            className="flex-1 min-w-40 text-xs px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">-- Chọn danh mục mới --</option>
                            {ALL_CATS.map(c => (
                              <option key={c.id} value={c.id} disabled={c.id === p.category}>
                                {c.icon} {c.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleReassign(p)}
                            disabled={saving || !movingTo}
                            className="text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold px-3 py-2 rounded-lg transition-colors"
                          >
                            {saving ? "Đang lưu..." : "Lưu"}
                          </button>
                          <button
                            onClick={() => { setReassigning(null); setMovingTo(""); }}
                            className="text-xs border border-gray-200 text-gray-500 font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReassigning(p.id); setMovingTo(p.category); }}
                          className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                          Chuyển danh mục
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Placeholder when nothing selected */}
      {!selectedCat && (
        <div className="flex-1 hidden lg:flex items-center justify-center py-32 bg-white rounded-2xl border border-gray-200">
          <div className="text-center">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-500 font-medium">Chọn một danh mục để xem và quản lý sản phẩm</p>
          </div>
        </div>
      )}
    </div>
  );
}
