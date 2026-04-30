"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useProducts } from "@/app/context/ProductContext";
import { formatPrice } from "@/app/lib/data";
import type { ProductStatus } from "@/app/lib/data";

type FilterTab = "all" | ProductStatus;

const TAB_LABELS: { key: FilterTab; label: string; color: string }[] = [
  { key: "all",      label: "Tất cả",     color: "bg-gray-600"   },
  { key: "pending",  label: "Chờ duyệt",  color: "bg-amber-500"  },
  { key: "approved", label: "Đã duyệt",   color: "bg-green-600"  },
  { key: "rejected", label: "Từ chối",    color: "bg-red-500"    },
];

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { sellerProducts, updateStatus } = useProducts();
  const router = useRouter();

  const [tab, setTab] = useState<FilterTab>("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/dang-nhap");
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  const filtered = tab === "all" ? sellerProducts : sellerProducts.filter((p) => p.status === tab);
  const counts = {
    all:      sellerProducts.length,
    pending:  sellerProducts.filter((p) => p.status === "pending").length,
    approved: sellerProducts.filter((p) => p.status === "approved").length,
    rejected: sellerProducts.filter((p) => p.status === "rejected").length,
  };

  function handleApprove(id: string) {
    updateStatus(id, "approved");
  }

  function handleReject() {
    if (!rejectId) return;
    updateStatus(rejectId, "rejected", rejectReason || "Không đáp ứng tiêu chuẩn");
    setRejectId(null);
    setRejectReason("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Viện Nông Nghiệp Thanh Hóa</p>
            <h1 className="text-xl font-bold">Bảng quản trị – Kiểm duyệt sản phẩm</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">Xin chào, <span className="text-white font-semibold">{user.name}</span></span>
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Về trang chủ</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Tổng sản phẩm",  value: counts.all,      icon: "📦", bg: "bg-blue-50  border-blue-200  text-blue-700"  },
            { label: "Chờ duyệt",       value: counts.pending,  icon: "⏳", bg: "bg-amber-50 border-amber-200 text-amber-700" },
            { label: "Đã duyệt",        value: counts.approved, icon: "✅", bg: "bg-green-50 border-green-200 text-green-700" },
            { label: "Từ chối",         value: counts.rejected, icon: "❌", bg: "bg-red-50   border-red-200   text-red-700"   },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold mb-0.5">{s.value}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {TAB_LABELS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === key ? `${color} text-white` : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === key ? "bg-white/20" : "bg-gray-100"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Product cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-gray-500 font-medium">Không có sản phẩm nào {tab !== "all" && `ở trạng thái "${TAB_LABELS.find(t=>t.key===tab)?.label}"`}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 items-start flex-wrap md:flex-nowrap">
                {/* Icon */}
                <div className={`${p.bg} w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>{p.icon}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        🏪 {p.sellerName} &nbsp;•&nbsp; 📁 {p.category} &nbsp;•&nbsp; 💰 {formatPrice(p.price)}/{p.unit}
                      </p>
                      {p.originalPrice > p.price && (
                        <p className="text-xs text-gray-400">Giá gốc: <span className="line-through">{formatPrice(p.originalPrice)}</span></p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
                      {p.status === "pending" && <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full">⏳ Chờ duyệt</span>}
                      {p.status === "approved" && <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">✅ Đã duyệt</span>}
                      {p.status === "rejected" && <span className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">❌ Từ chối</span>}
                      <span className="text-gray-400">{p.submittedAt ? new Date(p.submittedAt).toLocaleString("vi-VN") : ""}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.desc}</p>

                  {p.specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.specs.map((s) => (
                        <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}

                  {p.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {p.certifications.map((c) => (
                        <span key={c} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">✓ {c}</span>
                      ))}
                    </div>
                  )}

                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                      Lý do từ chối: <span className="font-semibold">{p.rejectionReason}</span>
                    </p>
                  )}

                  {/* Action buttons */}
                  {p.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => setRejectId(p.id)}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm px-4 py-2 rounded-xl border border-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        Từ chối
                      </button>
                    </div>
                  )}
                  {p.status === "approved" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setRejectId(p.id)}
                        className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl border border-gray-200 transition-colors"
                      >
                        Thu hồi phê duyệt
                      </button>
                    </div>
                  )}
                  {p.status === "rejected" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm px-4 py-2 rounded-xl border border-green-200 transition-colors"
                      >
                        Phê duyệt lại
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Từ chối sản phẩm</h3>
            <p className="text-sm text-gray-500 mb-4">Nhập lý do từ chối để doanh nghiệp biết cần chỉnh sửa gì.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="VD: Thiếu chứng nhận chất lượng, giá không hợp lý, mô tả chưa đầy đủ..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Hủy
              </button>
              <button onClick={handleReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
