"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useProducts } from "@/app/context/ProductContext";
import { formatPrice } from "@/app/lib/data";
import type { Product, ProductStatus } from "@/app/lib/data";
import { SITE_CATEGORIES } from "@/app/lib/categories";
import { removeAccents } from "@/app/lib/utils";
import EditProductModal from "./EditProductModal";
import AdminOrders from "./AdminOrders";
import AdminUsers from "./AdminUsers";
import AdminCategories from "./AdminCategories";

const INSTITUTE_NAME = "Viện Nông Nghiệp Thanh Hóa";
type FilterTab = "all" | ProductStatus;
type Section = "institute" | "businesses" | "orders" | "users" | "categories";

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
  const [rejectMode, setRejectMode] = useState<"reject" | "hide" | "request-edit">("reject");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // search + filters
  const [searchQuery, setSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/dang-nhap");
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  // ── helpers ──────────────────────────────────────────────────────────────
  function isHidden(p: Product) {
    return p.status === "rejected" && (p.rejectionReason ?? "").startsWith("[ẨN]");
  }

  function completeness(p: Product): { score: number; missing: string[] } {
    const checks = [
      { label: "Tên sản phẩm",  ok: !!p.name?.trim() },
      { label: "Mô tả",         ok: !!p.desc?.trim() },
      { label: "Hình ảnh",      ok: !!(p.images?.length || p.imageUrl) },
      { label: "Giá",           ok: p.price > 0 || p.type === "service" },
      { label: "Thông số kỹ thuật", ok: !!(p.specs?.length) },
      { label: "Chứng nhận",    ok: !!(p.certifications?.length) },
      { label: "Xuất xứ",       ok: !!p.origin?.trim() },
    ];
    const missing = checks.filter(c => !c.ok).map(c => c.label);
    return { score: Math.round(((checks.length - missing.length) / checks.length) * 100), missing };
  }

  // ── data ─────────────────────────────────────────────────────────────────
  const instituteProducts = sellerProducts.filter((p) => p.sellerName === INSTITUTE_NAME);
  const businessProducts  = sellerProducts.filter((p) => p.sellerName !== INSTITUTE_NAME);

  function applyFilters(list: Product[]) {
    let out = tab === "all" ? list : list.filter(p => p.status === tab);
    if (searchQuery.trim()) {
      const q = removeAccents(searchQuery.toLowerCase());
      out = out.filter(p => removeAccents(p.name.toLowerCase()).includes(q));
    }
    if (catFilter !== "all") out = out.filter(p => p.category === catFilter);
    if (typeFilter !== "all") out = out.filter(p => (p.type ?? "product") === typeFilter);
    return out;
  }

  const filteredInstitute = applyFilters(instituteProducts);
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

  function openReject(id: string, mode: "reject" | "hide" | "request-edit") {
    setRejectId(id);
    setRejectMode(mode);
    setRejectReason(mode === "hide" ? "[ẨN] Vi phạm quy định hiển thị" : "");
  }

  function handleReject() {
    if (!rejectId) return;
    const reason =
      rejectMode === "hide"
        ? (rejectReason || "[ẨN] Vi phạm quy định hiển thị")
        : rejectMode === "request-edit"
        ? (rejectReason || "Vui lòng chỉnh sửa nội dung sản phẩm")
        : (rejectReason || "Không đáp ứng tiêu chuẩn");
    updateStatus(rejectId, "rejected", reason);
    setRejectId(null);
    setRejectReason("");
    setRejectMode("reject");
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await deleteProduct(deleteId);
    setDeleteId(null);
    setDeleting(false);
  }

  function ProductActions({ p }: { p: Product }) {
    const hidden = isHidden(p);
    return (
      <div className="flex gap-2 mt-4 flex-wrap">
        {p.status === "pending" && (<>
          <button onClick={() => handleApprove(p.id)} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Phê duyệt
          </button>
          <button onClick={() => openReject(p.id, "request-edit")} className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm px-4 py-2 rounded-xl border border-amber-200 transition-colors">
            ✏️ Yêu cầu chỉnh sửa
          </button>
          <button onClick={() => openReject(p.id, "reject")} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm px-4 py-2 rounded-xl border border-red-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            Từ chối
          </button>
        </>)}
        {p.status === "approved" && (<>
          <button onClick={() => openReject(p.id, "hide")} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl border border-gray-200 transition-colors">
            🙈 Ẩn sản phẩm
          </button>
          <button onClick={() => openReject(p.id, "request-edit")} className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm px-4 py-2 rounded-xl border border-amber-200 transition-colors">
            ✏️ Yêu cầu chỉnh sửa
          </button>
        </>)}
        {p.status === "rejected" && (
          hidden
            ? <button onClick={() => handleApprove(p.id)} className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm px-4 py-2 rounded-xl border border-blue-200 transition-colors">
                👁️ Hiện lại sản phẩm
              </button>
            : <button onClick={() => handleApprove(p.id)} className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm px-4 py-2 rounded-xl border border-green-200 transition-colors">
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
    const hidden = isHidden(p);
    const { score, missing } = completeness(p);
    const catLabel = SITE_CATEGORIES.find(c => c.id === p.category)?.label ?? p.category;
    return (
      <div className={`bg-white rounded-2xl border p-4 sm:p-5 flex gap-3 sm:gap-4 items-start flex-wrap md:flex-nowrap ${hidden ? "border-gray-300 opacity-70" : "border-gray-200"}`}>
        <div className={`${p.bg} w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-3xl flex-shrink-0 relative`}>
          {(p.images?.[0] ?? p.imageUrl) ? <Image src={p.images?.[0] ?? p.imageUrl!} alt={p.name} fill className="object-cover" sizes="64px" /> : p.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                {p.tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${p.tagColor ?? "bg-gray-100 text-gray-600"}`}>{p.tag}</span>}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                📁 {catLabel} &nbsp;•&nbsp; 💰 {p.price > 0 ? `${formatPrice(p.price)}/${p.unit}` : "Liên hệ"}
                {p.sellerName && p.sellerName !== INSTITUTE_NAME && <>&nbsp;•&nbsp; 🏪 {p.sellerName}</>}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
              {hidden                          && <span className="bg-gray-200 text-gray-600 font-bold px-2.5 py-1 rounded-full">🙈 Đang ẩn</span>}
              {!hidden && p.status === "pending"  && <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full">⏳ Chờ duyệt</span>}
              {!hidden && p.status === "approved" && <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">✅ Đã duyệt</span>}
              {!hidden && p.status === "rejected" && <span className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">❌ Từ chối</span>}
              {/* Completeness bar */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${score >= 85 ? "bg-green-500" : score >= 57 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${score}%` }} />
                </div>
                <span className={`font-bold ${score >= 85 ? "text-green-600" : score >= 57 ? "text-amber-600" : "text-red-500"}`}>{score}%</span>
              </div>
              <span className="text-gray-400">{p.submittedAt ? new Date(p.submittedAt).toLocaleDateString("vi-VN") : ""}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.desc}</p>
          {missing.length > 0 && (
            <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
              ⚠️ Thiếu: <span className="font-semibold">{missing.join(", ")}</span>
            </p>
          )}
          {!hidden && p.status === "rejected" && p.rejectionReason && (
            <p className="mt-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
              {(p.rejectionReason ?? "").startsWith("[ẨN]") ? "Lý do ẩn:" : "Lý do từ chối:"}&nbsp;
              <span className="font-semibold">{p.rejectionReason.replace(/^\[ẨN\]\s*/, "")}</span>
            </p>
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
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setSection("institute")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${section === "institute" ? "bg-green-700 text-white shadow" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            🌾 <span className="hidden sm:inline">Sản phẩm của </span>Viện
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${section === "institute" ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>{instituteProducts.length}</span>
          </button>
          <button
            onClick={() => { setSection("businesses"); setSelectedBiz(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${section === "businesses" ? "bg-blue-600 text-white shadow" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            🏪 <span className="hidden sm:inline">Doanh nghiệp </span>đối tác
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${section === "businesses" ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>{bizSellerIds.length}</span>
          </button>
          <button
            onClick={() => setSection("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${section === "orders" ? "bg-amber-600 text-white shadow" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            📦 Đơn hàng
          </button>
          <button
            onClick={() => setSection("users")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${section === "users" ? "bg-purple-600 text-white shadow" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            👥 Người dùng
          </button>
          <button
            onClick={() => setSection("categories")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${section === "categories" ? "bg-orange-500 text-white shadow" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            📁 Phân loại
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
              <div key={s.label} className={`rounded-2xl border p-3 sm:p-5 ${s.bg}`}>
                <div className="text-xl sm:text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold mb-0.5">{s.value}</div>
                <div className="text-xs sm:text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 space-y-3">
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍  Tìm nhanh theo tên sản phẩm..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            />
            <div className="flex gap-2 flex-wrap">
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className="flex-1 min-w-36 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="all">📁 Tất cả danh mục</option>
                {SITE_CATEGORIES.filter(c => c.type !== "all").map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as "all" | "product" | "service")}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="all">🛒 Tất cả loại</option>
                <option value="product">📦 Sản phẩm</option>
                <option value="service">🛠️ Dịch vụ</option>
              </select>
              {(searchQuery || catFilter !== "all" || typeFilter !== "all") && (
                <button onClick={() => { setSearchQuery(""); setCatFilter("all"); setTypeFilter("all"); }}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                  ✕ Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {TAB_LABELS.map(({ key, label, color }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === key ? `${color} text-white` : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === key ? "bg-white/20" : "bg-gray-100"}`}>{instituteCounts[key]}</span>
              </button>
            ))}
            {filteredInstitute.length !== (tab === "all" ? instituteCounts.all : instituteCounts[tab]) && (
              <span className="text-xs text-gray-400 self-center ml-1">→ {filteredInstitute.length} kết quả</span>
            )}
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

        {/* ── ORDERS SECTION ── */}
        {section === "orders" && <AdminOrders />}

        {/* ── USERS SECTION ── */}
        {section === "users" && <AdminUsers />}

        {/* ── CATEGORIES SECTION ── */}
        {section === "categories" && <AdminCategories />}

        {/* ── BUSINESSES SECTION ── */}
        {section === "businesses" && (<>
          {bizSellerIds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <div className="text-5xl mb-4">🏪</div>
              <p className="text-gray-500 font-medium">Chưa có doanh nghiệp nào đăng sản phẩm</p>
            </div>
          ) : (
            <div className="md:flex md:gap-6 md:items-start">
              {/* ── Business list (hidden on mobile when a biz is selected) ── */}
              <div className={`md:w-72 md:flex-shrink-0 space-y-2 ${selectedBiz ? "hidden md:block" : "block"}`}>
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
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
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

              {/* ── Right panel (full-width on mobile when selected) ── */}
              <div className={`flex-1 min-w-0 ${selectedBiz ? "block" : "hidden md:block"}`}>
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
                      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex items-center gap-3 flex-wrap">
                        {/* Back button — mobile only */}
                        <button
                          onClick={() => setSelectedBiz(null)}
                          className="md:hidden flex items-center gap-1 text-sm text-blue-600 font-semibold flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                          </svg>
                          Quay lại
                        </button>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏪</div>
                          <div className="min-w-0">
                            <h2 className="font-bold text-gray-900 text-base leading-tight truncate">{sellerName}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">📦 {prods.length} sản phẩm</p>
                          </div>
                        </div>
                        <Link
                          href={`/doanh-nghiep/${selectedBiz}`}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                        >
                          Xem gian hàng →
                        </Link>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                        {TAB_LABELS.map(({ key, label, color }) => (
                          <button key={key} onClick={() => setBizTab(key)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${bizTab === key ? `${color} text-white` : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
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
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {rejectMode === "hide" ? "🙈 Ẩn sản phẩm" : rejectMode === "request-edit" ? "✏️ Yêu cầu chỉnh sửa" : "❌ Từ chối sản phẩm"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {rejectMode === "hide"
                ? "Sản phẩm sẽ bị ẩn khỏi trang công khai. Người bán vẫn thấy trong dashboard."
                : rejectMode === "request-edit"
                ? "Nhập nội dung yêu cầu chỉnh sửa gửi đến người bán."
                : "Nhập lý do từ chối để người bán biết cần cải thiện gì."}
            </p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
              placeholder={
                rejectMode === "hide"
                  ? "VD: Hình ảnh vi phạm, thông tin sai lệch..."
                  : rejectMode === "request-edit"
                  ? "VD: Vui lòng bổ sung hình ảnh thực tế và chứng nhận chất lượng..."
                  : "VD: Thiếu chứng nhận chất lượng, giá không hợp lý..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setRejectReason(""); setRejectMode("reject"); }}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Hủy</button>
              <button onClick={handleReject}
                className={`flex-1 text-white font-bold py-2.5 rounded-xl transition-colors text-sm ${rejectMode === "hide" ? "bg-gray-600 hover:bg-gray-700" : rejectMode === "request-edit" ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"}`}>
                {rejectMode === "hide" ? "Xác nhận ẩn" : rejectMode === "request-edit" ? "Gửi yêu cầu" : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
