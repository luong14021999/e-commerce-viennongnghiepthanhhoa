"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useProducts } from "@/app/context/ProductContext";
import { formatPrice } from "@/app/lib/data";
import type { Product, ProductStatus } from "@/app/lib/data";
import EditProductModal from "./EditProductModal";

const INSTITUTE_NAME = "Viện Nông Nghiệp Thanh Hóa";
type FilterTab = "all" | ProductStatus;
type Section = "institute" | "businesses";

const TAB_LABELS: { key: FilterTab; label: string; color: string }[] = [
  { key: "all",      label: "Tất cả",    color: "bg-gray-600"  },
  { key: "pending",  label: "Chờ duyệt", color: "bg-amber-500" },
  { key: "approved", label: "Đã duyệt",  color: "bg-green-600" },
  { key: "rejected", label: "Từ chối",   color: "bg-red-500"   },
];

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { sellerProducts, updateStatus, deleteProduct } = useProducts();
  const router = useRouter();

  const [section, setSection] = useState<Section>("institute");
  const [tab, setTab] = useState<FilterTab>("all");
  const [selectedBiz, setSelectedBiz] = useState<string | null>(null);
  const [bizTab, setBizTab] = useState<FilterTab>("all");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/dang-nhap");
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  const instituteProducts = sellerProducts.filter((p) => p.sellerName === INSTITUTE_NAME);
  const businessProducts = sellerProducts.filter((p) => p.sellerName !== INSTITUTE_NAME);

  const filteredInstitute = tab === "all" ? instituteProducts : instituteProducts.filter((p) => p.status === tab);
  const instituteCounts = {
    all:      instituteProducts.length,
    pending:  instituteProducts.filter((p) => p.status === "pending").length,
    approved: instituteProducts.filter((p) => p.status === "approved").length,
    rejected: instituteProducts.filter((p) => p.status === "rejected").length,
  };

  // Group business products by sellerId
  const bizSellerIds = [...new Set(businessProducts.map((p) => p.sellerId).filter(Boolean))] as string[];
  const getSellerProducts = (sid: string) => businessProducts.filter((p) => p.sellerId === sid);

  function handleApprove(id: string) { updateStatus(id, "approved"); }

  function handleReject() {
    if (!rejectId) return;
    updateStatus(rejectId, "rejected", rejectReason || "Không đáp ứng tiêu chuẩn");
    setRejectId(null);
    setRejectReason("");
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await deleteProduct(deleteId);
    setDeleteId(null);
    setDeleting(false);
  }

  function ProductActions({ p }: { p: Product }) {
    return (
      <div className="flex gap-2 mt-4 flex-wrap">
        {p.status === "pending" && (<>
          <button onClick={() => handleApprove(p.id)} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Phê duyệt
          </button>
          <button onClick={() => setRejectId(p.id)} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm px-4 py-2 rounded-xl border border-red-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            Từ chối
          </button>
        </>)}
        {p.status === "approved" && (
          <button onClick={() => setRejectId(p.id)} className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl border border-gray-200 transition-colors">
            Thu hồi phê duyệt
          </button>
        )}
        {p.status === "rejected" && (
          <button onClick={() => handleApprove(p.id)} className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm px-4 py-2 rounded-xl border border-green-200 transition-colors">
            Phê duyệt lại
          </button>
        )}
        <button onClick={() => setEditProduct(p)} className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm px-4 py-2 rounded-xl border border-blue-200 transition-colors ml-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Sửa
        </button>
        <button onClick={() => setDeleteId(p.id)} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-2 rounded-xl border border-red-200 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Xóa
        </button>
      </div>
    );
  }

  function ProductCard({ p }: { p: Product }) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 items-start flex-wrap md:flex-nowrap">
        <div className={`${p.bg} w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-3xl flex-shrink-0`}>
          {(p.images?.[0] ?? p.imageUrl) ? <img src={p.images?.[0] ?? p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : p.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">📁 {p.category} &nbsp;•&nbsp; 💰 {p.price > 0 ? formatPrice(p.price) : "Liên hệ"}/{p.unit}</p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
              {p.status === "pending"  && <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full">⏳ Chờ duyệt</span>}
              {p.status === "approved" && <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">✅ Đã duyệt</span>}
              {p.status === "rejected" && <span className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">❌ Từ chối</span>}
              <span className="text-gray-400">{p.submittedAt ? new Date(p.submittedAt).toLocaleDateString("vi-VN") : ""}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.desc}</p>
          {p.status === "rejected" && p.rejectionReason && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">Lý do từ chối: <span className="font-semibold">{p.rejectionReason}</span></p>
          )}
          <ProductActions p={p} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Viện Nông Nghiệp Thanh Hóa</p>
            <h1 className="text-xl font-bold">Bảng quản trị</h1>
          </div>
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <Link href="/admin/them-san-pham" className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Đăng sản phẩm / dịch vụ
            </Link>
            <span className="text-gray-400">Xin chào, <span className="text-white font-semibold">{user.name}</span></span>
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">← Về trang chủ</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Section switcher */}
        <div className="flex gap-2 mb-8 bg-white border border-gray-200 rounded-2xl p-1.5 w-fit">
          <button
            onClick={() => setSection("institute")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${section === "institute" ? "bg-green-700 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
          >
            🌾 Sản phẩm của Viện
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${section === "institute" ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>{instituteProducts.length}</span>
          </button>
          <button
            onClick={() => setSection("businesses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${section === "businesses" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
          >
            🏪 Doanh nghiệp đối tác
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${section === "businesses" ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>{bizSellerIds.length}</span>
          </button>
        </div>

        {/* ── INSTITUTE SECTION ── */}
        {section === "institute" && (<>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Tổng sản phẩm", value: instituteCounts.all,      icon: "📦", bg: "bg-blue-50  border-blue-200  text-blue-700"  },
              { label: "Chờ duyệt",      value: instituteCounts.pending,  icon: "⏳", bg: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "Đã duyệt",       value: instituteCounts.approved, icon: "✅", bg: "bg-green-50 border-green-200 text-green-700" },
              { label: "Từ chối",        value: instituteCounts.rejected, icon: "❌", bg: "bg-red-50   border-red-200   text-red-700"   },
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
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === key ? `${color} text-white` : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === key ? "bg-white/20" : "bg-gray-100"}`}>{instituteCounts[key]}</span>
              </button>
            ))}
          </div>

          {filteredInstitute.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-gray-500 font-medium">Không có sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstitute.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </>)}

        {/* ── BUSINESSES SECTION ── */}
        {section === "businesses" && (<>
          {bizSellerIds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <div className="text-5xl mb-4">🏪</div>
              <p className="text-gray-500 font-medium">Chưa có doanh nghiệp nào đăng sản phẩm</p>
            </div>
          ) : (
            <div className="flex gap-6 items-start">
              {/* ── Left sidebar: business list ── */}
              <div className="w-72 flex-shrink-0 space-y-2">
                {bizSellerIds.map((sid) => {
                  const prods = getSellerProducts(sid);
                  const sellerName = prods[0]?.sellerName ?? sid;
                  const pending  = prods.filter((p) => p.status === "pending").length;
                  const approved = prods.filter((p) => p.status === "approved").length;
                  const rejected = prods.filter((p) => p.status === "rejected").length;
                  const isActive = selectedBiz === sid;

                  return (
                    <button
                      key={sid}
                      onClick={() => { setSelectedBiz(sid); setBizTab("all"); }}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${isActive ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏪</div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-bold text-sm leading-snug truncate ${isActive ? "text-blue-800" : "text-gray-900"}`}>{sellerName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">📦 {prods.length} sản phẩm</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2.5 flex-wrap">
                        {pending  > 0 && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">⏳ {pending}</span>}
                        {approved > 0 && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✅ {approved}</span>}
                        {rejected > 0 && <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">❌ {rejected}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Right panel: selected business products ── */}
              <div className="flex-1 min-w-0">
                {!selectedBiz ? (
                  <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
                    <div className="text-5xl mb-4">👈</div>
                    <p className="text-gray-500 font-medium">Chọn một doanh nghiệp để xem sản phẩm</p>
                  </div>
                ) : (() => {
                  const prods = getSellerProducts(selectedBiz);
                  const sellerName = prods[0]?.sellerName ?? selectedBiz;
                  const counts = {
                    all:      prods.length,
                    pending:  prods.filter((p) => p.status === "pending").length,
                    approved: prods.filter((p) => p.status === "approved").length,
                    rejected: prods.filter((p) => p.status === "rejected").length,
                  };
                  const filtered = bizTab === "all" ? prods : prods.filter((p) => p.status === bizTab);

                  return (
                    <div>
                      {/* Business header */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">🏪</div>
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg leading-tight">{sellerName}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">📦 {prods.length} sản phẩm</p>
                          </div>
                        </div>
                        <Link
                          href={`/doanh-nghiep/${selectedBiz}`}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Xem gian hàng →
                        </Link>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {TAB_LABELS.map(({ key, label, color }) => (
                          <button key={key} onClick={() => setBizTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${bizTab === key ? `${color} text-white` : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                            {label}
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${bizTab === key ? "bg-white/20" : "bg-gray-100"}`}>{counts[key]}</span>
                          </button>
                        ))}
                      </div>

                      {/* Product list */}
                      {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
                          <p className="text-gray-400 font-medium">Không có sản phẩm nào</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>)}
      </div>

      {/* Edit modal */}
      {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} />}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2 text-center">Xóa sản phẩm?</h3>
            <p className="text-sm text-gray-500 mb-5 text-center">Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Hủy</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {deleting ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Từ chối sản phẩm</h3>
            <p className="text-sm text-gray-500 mb-4">Nhập lý do từ chối để doanh nghiệp biết cần chỉnh sửa gì.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
              placeholder="VD: Thiếu chứng nhận chất lượng, giá không hợp lý..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Hủy</button>
              <button onClick={handleReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
