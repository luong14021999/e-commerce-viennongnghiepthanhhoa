"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RecentStore = {
  sellerId: string;
  sellerName: string;
  address: string;
  productCount: number;
  verified: boolean;
  accountType?: string;
};

const TYPE_META: Record<string, { icon: string; color: string }> = {
  "Người bán hàng":  { icon: "🏪", color: "bg-blue-100 text-blue-700" },
  "Doanh nghiệp":    { icon: "🏢", color: "bg-indigo-100 text-indigo-700" },
  "Hợp tác xã":      { icon: "🤝", color: "bg-purple-100 text-purple-700" },
  "Nông hộ":         { icon: "🌾", color: "bg-green-100 text-green-700" },
  "Đơn vị liên kết": { icon: "🔗", color: "bg-orange-100 text-orange-700" },
};

export default function RecentlyViewedStores() {
  const [stores, setStores] = useState<RecentStore[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recentStores") ?? "[]") as RecentStore[];
      setStores(stored);
    } catch { /* ignore */ }
  }, []);

  if (stores.length === 0) return null;

  return (
    <section className="bg-white py-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">
            🕐 Gian hàng bạn đã xem gần đây
          </h2>
          <button
            onClick={() => { localStorage.removeItem("recentStores"); setStores([]); }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Xóa lịch sử
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {stores.map((store) => {
            const meta = store.accountType
              ? (TYPE_META[store.accountType] ?? { icon: "🏪", color: "bg-gray-100 text-gray-600" })
              : { icon: "🏪", color: "bg-gray-100 text-gray-600" };
            return (
              <Link
                key={store.sellerId}
                href={`/doanh-nghiep/${store.sellerId}`}
                className="flex-shrink-0 snap-start w-52 bg-white border border-gray-200 rounded-2xl p-3.5 hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-xs line-clamp-2 leading-snug group-hover:text-green-700 transition-colors">
                      {store.sellerName}
                    </p>
                    {store.verified && (
                      <span className="text-[10px] text-green-600 font-semibold">✓ Xác minh</span>
                    )}
                  </div>
                </div>

                {store.accountType && (
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${meta.color}`}>
                    {store.accountType}
                  </span>
                )}

                <div className="space-y-1 text-[11px] text-gray-500">
                  {store.address && (
                    <p className="line-clamp-1">📍 {store.address}</p>
                  )}
                  <p>📦 <strong className="text-gray-800">{store.productCount}</strong> sản phẩm</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
