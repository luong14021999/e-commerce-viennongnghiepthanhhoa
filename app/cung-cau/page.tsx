import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dbRowToMarketPost, POST_CATEGORIES, type MarketPostType } from "./types";
import PostCard from "./PostCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kết nối Cung – Cầu nông sản Thanh Hóa",
  description:
    "Sàn kết nối cung – cầu nông sản Thanh Hóa. Đăng tin mua – bán sản phẩm nông nghiệp, hợp tác sản xuất – kinh doanh, kết nối số lượng lớn không qua trung gian.",
};

type Props = {
  searchParams: Promise<{ type?: string; category?: string }>;
};

export default async function MarketPostsPage({ searchParams }: Props) {
  const { type, category } = await searchParams;
  const filterType: MarketPostType | null =
    type === "cung" || type === "cau" ? type : null;
  const filterCategory =
    category && POST_CATEGORIES.find((c) => c.id === category) ? category : null;

  const supabase = await createClient();
  let query = supabase
    .from("market_posts")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  if (filterType) query = query.eq("type", filterType);
  if (filterCategory) query = query.eq("category", filterCategory);

  const { data } = await query;
  const posts = (data ?? []).map(dbRowToMarketPost);

  const totalCung = posts.filter((p) => p.type === "cung").length;
  const totalCau = posts.filter((p) => p.type === "cau").length;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-green-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="cc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cc-grid)" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              🤝 Sàn kết nối B2B
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-3">
              Kết nối Cung – Cầu Nông sản
            </h1>
            <p className="text-white/90 text-base sm:text-lg mb-2 leading-snug">
              Sản phẩm nông nghiệp số lượng lớn — Không qua trung gian
            </p>
            <p className="text-white/75 text-sm max-w-2xl">
              Nơi nông hộ, HTX, doanh nghiệp đăng tin mua – bán nông sản và tìm
              đối tác hợp tác sản xuất – kinh doanh tại Thanh Hóa.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cung-cau/dang-tin"
                className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-6 py-3 rounded-full hover:scale-105 hover:shadow-2xl transition-all shadow-lg"
              >
                ➕ Đăng tin miễn phí
              </Link>
              <Link
                href="/cung-cau/cua-toi"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-full backdrop-blur-sm transition-colors"
              >
                📋 Tin của tôi
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Type tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {[
            { key: null,    label: "🔥 Tất cả",   count: posts.length, active: "bg-gray-900 text-white" },
            { key: "cung",  label: "🟢 Cần bán (cung)", count: totalCung, active: "bg-green-600 text-white" },
            { key: "cau",   label: "🔵 Cần mua (cầu)",  count: totalCau,  active: "bg-blue-600 text-white" },
          ].map((tab) => {
            const isActive = (tab.key ?? null) === (filterType ?? null);
            const href = `/cung-cau${tab.key ? `?type=${tab.key}` : ""}${
              filterCategory ? `${tab.key ? "&" : "?"}category=${filterCategory}` : ""
            }`;
            return (
              <Link
                key={tab.label}
                href={href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${
                  isActive ? tab.active + " shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          <Link
            href={`/cung-cau${filterType ? `?type=${filterType}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
              !filterCategory ? "bg-green-100 text-green-800 border border-green-200" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            Tất cả danh mục
          </Link>
          {POST_CATEGORIES.map((cat) => {
            const isActive = filterCategory === cat.id;
            const href = `/cung-cau?${filterType ? `type=${filterType}&` : ""}category=${cat.id}`;
            return (
              <Link
                key={cat.id}
                href={href}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 flex items-center gap-1.5 ${
                  isActive ? "bg-green-100 text-green-800 border border-green-200" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có tin nào</h3>
            <p className="text-gray-500 text-sm mb-6">
              Hãy là người đầu tiên đăng tin trong mục này
            </p>
            <Link
              href="/cung-cau/dang-tin"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors"
            >
              ➕ Đăng tin ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
