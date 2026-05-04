"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useProducts } from "@/app/context/ProductContext";
import { formatPrice, categories } from "@/app/lib/data";
import type { Product } from "@/app/lib/data";
import EditProductModal from "@/app/admin/EditProductModal";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Chờ duyệt",  color: "text-amber-700",  bg: "bg-amber-100"  },
  approved: { label: "Đã duyệt",   color: "text-green-700",  bg: "bg-green-100"  },
  rejected: { label: "Từ chối",    color: "text-red-700",    bg: "bg-red-100"    },
};

export default function DashboardPage() {
  const { user, isLoading, updateBusinessProfile } = useAuth();
  const { getBySeller, deleteProduct } = useProducts();
  const router = useRouter();

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    taxCode: "",
    businessAddress: "",
    category: "",
    description: "",
    contactName: "",
    contactEmail: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "business")) router.push("/dang-nhap");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.business) {
      setProfileForm({
        businessName: user.business.businessName,
        taxCode: user.business.taxCode,
        businessAddress: user.business.businessAddress,
        category: user.business.category,
        description: user.business.description,
        contactName: user.name,
        contactEmail: user.email,
      });
    }
  }, [user]);

  if (isLoading || !user || user.role !== "business") return null;

  const myProducts = getBySeller(user.id);
  const pending  = myProducts.filter((p) => p.status === "pending").length;
  const approved = myProducts.filter((p) => p.status === "approved").length;
  const totalRevenue = myProducts.filter((p) => p.status === "approved").reduce((s, p) => s + p.price * p.sold, 0);

  function getCategoryLabel(id: string) {
    return categories.find((c) => c.id === id)?.label ?? id;
  }

  function setField(field: keyof typeof profileForm, value: string) {
    setProfileForm((f) => ({ ...f, [field]: value }));
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);
    const result = await updateBusinessProfile(profileForm);
    setProfileSaving(false);
    if (!result.ok) { setProfileError(result.error ?? "Có lỗi xảy ra"); return; }
    setProfileSuccess(true);
    setEditingProfile(false);
    setTimeout(() => setProfileSuccess(false), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-300 text-sm">Dashboard doanh nghiệp</p>
            <h1 className="text-2xl font-bold">{user.business?.businessName ?? "Doanh nghiệp"}</h1>
            <div className="flex items-center gap-2 mt-1">
              {user.business?.verified ? (
                <span className="bg-green-600 text-green-100 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500">✓ Đã xác minh</span>
              ) : (
                <span className="bg-amber-600 text-amber-100 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500">⏳ Chờ xác minh tài khoản</span>
              )}
              <span className="text-green-300 text-xs">{user.business?.businessAddress}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/doanh-nghiep/${user.id}`}
              className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2.5 rounded-full hover:bg-green-500 transition-colors text-sm"
            >
              🏪 Xem gian hàng
            </Link>
            <Link
              href="/dashboard/them-san-pham"
              className="flex items-center gap-2 bg-white text-green-700 font-bold px-5 py-2.5 rounded-full hover:bg-green-50 transition-colors text-sm shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Thêm sản phẩm mới
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border p-5 text-blue-700 bg-blue-50 border-blue-200">
            <div className="text-2xl mb-1">📦</div>
            <div className="text-3xl font-bold mb-0.5">{myProducts.length}</div>
            <div className="text-sm font-medium">Tổng sản phẩm</div>
          </div>
          <div className="rounded-2xl border p-5 text-amber-700 bg-amber-50 border-amber-200">
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-3xl font-bold mb-0.5">{pending}</div>
            <div className="text-sm font-medium">Chờ duyệt</div>
          </div>
          <div className="rounded-2xl border p-5 text-green-700 bg-green-50 border-green-200">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-3xl font-bold mb-0.5">{approved}</div>
            <div className="text-sm font-medium">Đang bán</div>
          </div>
          <div className="rounded-2xl border p-5 text-emerald-700 bg-emerald-50 border-emerald-200">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xl font-bold mb-0.5 leading-tight">{formatPrice(totalRevenue)}</div>
            <div className="text-sm font-medium">Doanh thu ước tính</div>
          </div>
        </div>

        {/* Notice for unverified */}
        {!user.business?.verified && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6 flex gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-amber-800 mb-1">Tài khoản doanh nghiệp chưa được xác minh</p>
              <p className="text-amber-700 text-sm">Sản phẩm của bạn vẫn hiển thị công khai. Huy hiệu <strong>"Đã xác minh"</strong> sẽ xuất hiện trên gian hàng sau khi Viện Nông Nghiệp xác minh tài khoản.</p>
            </div>
          </div>
        )}

        {/* ── Business profile card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">🏢 Thông tin doanh nghiệp</h2>
            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              Cập nhật thông tin thành công!
            </div>
          )}

          {!editingProfile ? (
            /* ── View mode ── */
            <div className="p-6 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                { label: "Tên doanh nghiệp", value: user.business?.businessName },
                { label: "Mã số thuế", value: user.business?.taxCode },
                { label: "Địa chỉ kinh doanh", value: user.business?.businessAddress },
                { label: "Lĩnh vực chính", value: getCategoryLabel(user.business?.category ?? "") },
                { label: "Người liên hệ", value: user.name },
                { label: "Số điện thoại", value: user.phone },
                { label: "Email liên hệ", value: user.email || "—" },
                { label: "Trạng thái", value: user.business?.verified ? "✓ Đã xác minh" : "⏳ Chờ xác minh" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-gray-800 font-medium">{value ?? "—"}</p>
                </div>
              ))}
              {user.business?.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mô tả doanh nghiệp</p>
                  <p className="text-gray-700 whitespace-pre-line">{user.business.description}</p>
                </div>
              )}
            </div>
          ) : (
            /* ── Edit mode ── */
            <form onSubmit={handleProfileSave} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên doanh nghiệp <span className="text-red-500">*</span></label>
                  <input required value={profileForm.businessName} onChange={(e) => setField("businessName", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã số thuế <span className="text-red-500">*</span></label>
                  <input required value={profileForm.taxCode} onChange={(e) => setField("taxCode", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ kinh doanh <span className="text-red-500">*</span></label>
                  <input required value={profileForm.businessAddress} onChange={(e) => setField("businessAddress", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lĩnh vực chính</label>
                  <input type="text" value={profileForm.category} onChange={(e) => setField("category", e.target.value)}
                    placeholder="VD: Phân bón hữu cơ, Giống cây trồng, Máy nông nghiệp..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Người liên hệ</label>
                  <input value={profileForm.contactName} onChange={(e) => setField("contactName", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email liên hệ</label>
                  <input type="email" value={profileForm.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả doanh nghiệp</label>
                <textarea rows={3} value={profileForm.description} onChange={(e) => setField("description", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>

              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{profileError}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setEditingProfile(false); setProfileError(""); }}
                  disabled={profileSaving}
                  className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Hủy
                </button>
                <button type="submit" disabled={profileSaving}
                  className="px-6 py-2.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-2">
                  {profileSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Đang lưu...
                    </>
                  ) : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Product table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Sản phẩm của tôi</h2>
            <span className="text-sm text-gray-500">{myProducts.length} sản phẩm</span>
          </div>

          {myProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-gray-400 text-sm mb-6">Thêm sản phẩm đầu tiên để bắt đầu bán hàng</p>
              <Link href="/dashboard/them-san-pham" className="bg-green-700 text-white font-bold px-6 py-2.5 rounded-full hover:bg-green-600 transition-colors text-sm">
                + Thêm sản phẩm
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Sản phẩm</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Danh mục</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Giá</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Ngày gửi</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myProducts.map((p) => {
                    const st = STATUS_LABEL[p.status ?? "pending"];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`${p.bg} w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-xl flex-shrink-0`}>
                              {(p.images?.[0] ?? p.imageUrl)
                                ? <img src={p.images?.[0] ?? p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                : <span>{p.icon}</span>
                              }
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                              {p.status === "rejected" && p.rejectionReason && (
                                <p className="text-xs text-red-600 mt-0.5">Lý do: {p.rejectionReason}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-gray-600 text-xs">{getCategoryLabel(p.category)}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-semibold text-gray-800">{formatPrice(p.price)}</span>
                          <span className="text-gray-400">/{p.unit}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell text-gray-500">
                          {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {p.status === "rejected" && (
                              <button
                                onClick={() => setEditProduct(p)}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                                title="Bổ sung thông tin & gửi lại"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => { if (confirm("Xóa sản phẩm này?")) deleteProduct(p.id); }}
                              className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                              title="Xóa sản phẩm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><span>🚀</span> Quy trình đăng sản phẩm</h3>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            {[
              { step: "1", icon: "📝", title: "Điền thông tin", desc: "Tên, danh mục, giá, mô tả và tải ảnh sản phẩm" },
              { step: "2", icon: "⏳", title: "Chờ kiểm duyệt", desc: "Viện Nông Nghiệp xem xét và phê duyệt trong 1–2 ngày" },
              { step: "3", icon: "🏪", title: "Hiển thị công khai", desc: "Sản phẩm xuất hiện trên trang chủ và gian hàng của bạn" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">{s.step}</div>
                <div>
                  <p className="font-semibold text-gray-800">{s.icon} {s.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href={`/doanh-nghiep/${user.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-600">
              🏪 Xem gian hàng công khai của {user.business?.businessName ?? "doanh nghiệp"} →
            </Link>
          </div>
        </div>
      </div>

      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          resubmit
        />
      )}
    </div>
  );
}
