import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  dbRowToMarketPost,
  POST_CATEGORIES,
  formatQuantity,
  formatPostPrice,
  timeAgo,
} from "../types";
import ContactReveal from "./ContactReveal";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("market_posts")
    .select("title, description, type")
    .eq("id", id)
    .single();

  if (!data) return { title: "Tin không tồn tại" };

  const prefix = data.type === "cung" ? "[Cần bán]" : "[Cần mua]";
  return {
    title: `${prefix} ${data.title}`,
    description: (data.description ?? "").slice(0, 160) || `Tin ${prefix} trên sàn Kết nối Cung – Cầu Thanh Hóa`,
  };
}

export default async function MarketPostDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("market_posts")
    .select("*, profiles(name)")
    .eq("id", id)
    .single();

  if (!row) notFound();

  const post = dbRowToMarketPost(row);
  const cat = POST_CATEGORIES.find((c) => c.id === post.category);
  const isCung = post.type === "cung";
  const posterName = (row.profiles as { name?: string } | null)?.name ?? post.contactName;

  // Bump view (fire and forget)
  await supabase
    .from("market_posts")
    .update({ views: post.views + 1 })
    .eq("id", id);

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/cung-cau" className="text-sm text-gray-500 hover:text-gray-700">
            ← Quay lại danh sách
          </Link>
        </div>

        <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header banner */}
          <div className={`px-5 sm:px-7 py-5 ${isCung ? "bg-gradient-to-r from-green-600 to-emerald-500" : "bg-gradient-to-r from-blue-600 to-cyan-500"} text-white`}>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <span className="inline-block bg-white/20 border border-white/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {isCung ? "🟢 CẦN BÁN" : "🔵 CẦN MUA"}
              </span>
              <span className="text-xs text-white/80">
                Đăng {timeAgo(post.createdAt)} · 👁️ {post.views + 1}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
              {post.title}
            </h1>
            {cat && (
              <div className="mt-2 text-sm text-white/90 flex items-center gap-1.5">
                <span>{cat.icon}</span>
                {cat.label}
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Quantity + Price */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs uppercase font-bold text-gray-400 mb-1">Số lượng</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatQuantity(post.quantityValue, post.quantityUnit)}
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-xs uppercase font-bold text-amber-600 mb-1">Giá</div>
                <div className="text-xl font-bold text-amber-700">
                  {formatPostPrice(post.priceValue, post.priceUnit, post.priceNegotiable)}
                </div>
              </div>
            </div>

            {/* Location */}
            {post.location && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-xs uppercase font-bold text-blue-600 mb-0.5">Địa điểm</div>
                  <div className="text-sm font-medium text-gray-800">{post.location}</div>
                </div>
              </div>
            )}

            {/* Description */}
            {post.description && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-2">📝 Mô tả</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {post.description}
                </p>
              </div>
            )}

            {/* Validity */}
            {post.validUntil && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                ⏳ Tin có hiệu lực đến: <strong>{new Date(post.validUntil).toLocaleDateString("vi-VN")}</strong>
              </div>
            )}

            {/* Contact card */}
            <ContactReveal
              posterName={posterName}
              contactName={post.contactName}
              contactPhone={post.contactPhone}
              contactEmail={post.contactEmail}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
