"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { HomepageBusiness } from "./BusinessProductsSection";

const TYPE_META: Record<string, { icon: string; color: string }> = {
  "Người bán hàng":  { icon: "🏪", color: "bg-blue-100 text-blue-700" },
  "Doanh nghiệp":    { icon: "🏢", color: "bg-indigo-100 text-indigo-700" },
  "Hợp tác xã":      { icon: "🤝", color: "bg-purple-100 text-purple-700" },
  "Nông hộ":         { icon: "🌾", color: "bg-green-100 text-green-700" },
  "Đơn vị liên kết": { icon: "🔗", color: "bg-orange-100 text-orange-700" },
};

function useCardsPerView() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setN(1);
      else if (window.innerWidth < 1024) setN(2);
      else setN(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return n;
}

export default function BusinessCarousel({ businesses }: { businesses: HomepageBusiness[] }) {
  const cardsPerView = useCardsPerView();
  const total = businesses.length;
  const maxIndex = Math.max(0, total - cardsPerView);
  const [current, setCurrent] = useState(0);
  const pauseRef = useRef(false);
  const touchStartX = useRef(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(idx, maxIndex)));
  }, [maxIndex]);

  const next = useCallback(() => {
    setCurrent(c => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrent(c => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  // Reset if current exceeds maxIndex (e.g. on resize)
  useEffect(() => {
    if (current > maxIndex) setCurrent(maxIndex);
  }, [current, maxIndex]);

  // Auto-advance
  useEffect(() => {
    if (total <= cardsPerView) return;
    const id = setInterval(() => {
      if (!pauseRef.current) {
        setCurrent(c => (c >= maxIndex ? 0 : c + 1));
      }
    }, 4000);
    return () => clearInterval(id);
  }, [total, cardsPerView, maxIndex]);

  if (total === 0) return null;

  // translateX uses % of the track's own width; each card = 1/total of track
  const translatePct = (current * 100) / total;

  return (
    <section
      className="bg-white py-8 border-t border-gray-100"
      onMouseEnter={() => { pauseRef.current = true; }}
      onMouseLeave={() => { pauseRef.current = false; }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">
              🏬 Danh sách gian hàng đang hoạt động
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{total} gian hàng đang kinh doanh trên sàn</p>
          </div>
          {total > cardsPerView && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:block">
                {current + 1}–{Math.min(current + cardsPerView, total)} / {total}
              </span>
              <button
                onClick={prev}
                aria-label="Trước"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors text-xl font-bold leading-none"
              >
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Tiếp"
                className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors text-xl font-bold leading-none"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Carousel track */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${(total / cardsPerView) * 100}%`,
              transform: `translateX(-${translatePct}%)`,
            }}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              pauseRef.current = true;
            }}
            onTouchEnd={(e) => {
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
              pauseRef.current = false;
            }}
          >
            {businesses.map((biz) => {
              const meta = biz.accountType
                ? (TYPE_META[biz.accountType] ?? { icon: "🏪", color: "bg-gray-100 text-gray-600" })
                : { icon: "🏪", color: "bg-gray-100 text-gray-600" };
              return (
                <div
                  key={biz.sellerId}
                  className="px-2"
                  style={{ width: `${100 / total}%` }}
                >
                  <Link
                    href={`/doanh-nghiep/${biz.sellerId}`}
                    className="block bg-white border border-gray-200 rounded-2xl p-4 hover:border-green-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-green-100 transition-colors">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-green-700 transition-colors">
                          {biz.sellerName}
                        </p>
                        {biz.accountType && (
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${meta.color}`}>
                            {biz.accountType}
                          </span>
                        )}
                        {biz.address && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {biz.address}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                          <span>📦 <strong className="text-gray-800">{biz.productCount}</strong> sản phẩm</span>
                          {biz.verified && (
                            <span className="text-green-600 font-semibold">✓ Xác minh</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators (only when manageable number of positions) */}
        {total > cardsPerView && maxIndex <= 12 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`transition-all rounded-full ${
                  i === current ? "w-4 h-1.5 bg-green-600" : "w-1.5 h-1.5 bg-gray-200 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
