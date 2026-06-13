"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { dbRowToMarketPost, POST_CATEGORIES, type MarketPost, type MarketPostStatus, timeAgo, formatQuantity } from "../types";

const STATUS_BADGE: Record<MarketPostStatus, { label: string; cls: string }> = {
  active:  { label: "🟢 Đang hiển thị", cls: "bg-green-100 text-green-700 border-green-200" },
  closed:  { label: "🔒 Đã đóng",        cls: "bg-gray-100 text-gray-700 border-gray-200"   },
  expired: { label: "⌛ Hết hạn",        cls: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function MyMarketPostsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [posts, setPosts] = useState<MarketPost[] | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push(`/dang-nhap?redirect=/cung-cau/cua-toi`);
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase
        .from("market_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPosts((data ?? []).map(dbRowToMarketPost));
    };
    load();
    const channel = supabase
      .channel("my-market-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "market_posts", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function changeStatus(id: string, status: MarketPostStatus) {
    setUpdating(id);
    const supabase = createClient();
    await supabase.from("market_posts").update({ status }).eq("id", id);
    setUpdating(null);
  }

  async function deletePost(id: string) {
    if (!confirm("Bạn có chắc muốn xóa tin này?")) return;
    setUpdating(id);
    const supabase = createClient();
    await supabase.from("market_posts").delete().eq("id", id);
    setUpdating(null);
  }

  if (isLoading || !user) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 Tin của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tin Cung – Cầu bạn đã đăng</p>
          </div>
          <Link
            href="/cung-cau/dang-tin"
            className="bg-green-700 hover:bg-green-600 text-white font-bold px-4 py-2.5 rounded-full text-sm transition-colors"
          >
            ➕ Đăng tin mới
          </Link>
        </div>

        {posts === null ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-500">
            Đang tải...
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 mb-5">Bạn chưa đăng tin nào</p>
            <Link
              href="/cung-cau/dang-tin"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              ➕ Đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const cat = POST_CATEGORIES.find((c) => c.id === p.category);
              const badge = STATUS_BADGE[p.status];
              const isCung = p.type === "cung";
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCung ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {isCung ? "🟢 BÁN" : "🔵 MUA"}
                      </span>
                      {cat && <span className="text-xs text-gray-500">{cat.icon} {cat.label}</span>}
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(p.createdAt)} · 👁️ {p.views}</span>
                  </div>
                  <Link href={`/cung-cau/${p.id}`} className="block">
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 hover:text-green-700">{p.title}</h3>
                  </Link>
                  <p className="text-xs text-gray-500">Số lượng: {formatQuantity(p.quantityValue, p.quantityUnit)}</p>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {p.status === "active" && (
                      <button
                        onClick={() => changeStatus(p.id, "closed")}
                        disabled={updating === p.id}
                        className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors disabled:opacity-60"
                      >
                        🔒 Đóng tin
                      </button>
                    )}
                    {p.status !== "active" && (
                      <button
                        onClick={() => changeStatus(p.id, "active")}
                        disabled={updating === p.id}
                        className="text-xs font-semibold bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 transition-colors disabled:opacity-60"
                      >
                        🔓 Mở lại
                      </button>
                    )}
                    <button
                      onClick={() => deletePost(p.id)}
                      disabled={updating === p.id}
                      className="text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg border border-red-200 transition-colors disabled:opacity-60"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
