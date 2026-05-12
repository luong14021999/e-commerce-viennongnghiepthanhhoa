"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

import { BUSINESS_CATEGORIES } from "@/app/lib/categories";

export default function ProfilePage() {
  const { user, isLoading, updateBuyerProfile, updateBusinessProfile, updatePhone } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bizName, setBizName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/dang-nhap?redirect=/tai-khoan");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    if (user.business) {
      setBizName(user.business.businessName ?? "");
      setTaxCode(user.business.taxCode ?? "");
      setBizAddress(user.business.businessAddress ?? "");
      setCategory(user.business.category ?? "");
      setDescription(user.business.description ?? "");
    }
  }, [user]);

  if (isLoading || !user) return null;

  const isBusiness = user.role === "business";
  const focusRing = isBusiness ? "focus:ring-blue-500" : "focus:ring-green-500";
  const btnBg = isBusiness ? "bg-blue-600 hover:bg-blue-700" : "bg-green-700 hover:bg-green-600";

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setPhoneError("");
    setSuccess(false);

    // Validate phone
    const cleanedPhone = phone.trim().replace(/\s/g, "");
    if (!/^0\d{9}$/.test(cleanedPhone)) {
      setPhoneError("Số điện thoại không hợp lệ (phải bắt đầu bằng 0, đủ 10 số)");
      return;
    }

    setSaving(true);

    // Update profile info
    let profileResult: { ok: boolean; error?: string };
    if (isBusiness) {
      profileResult = await updateBusinessProfile({
        businessName: bizName,
        taxCode,
        businessAddress: bizAddress,
        category,
        description,
        contactName: name,
        contactEmail: email,
      });
    } else {
      profileResult = await updateBuyerProfile({ name, email });
    }

    if (!profileResult.ok) {
      setSaving(false);
      setError(profileResult.error ?? "Lỗi hệ thống");
      return;
    }

    // Update phone if changed
    if (cleanedPhone !== user.phone) {
      const phoneResult = await updatePhone(cleanedPhone);
      if (!phoneResult.ok) {
        setSaving(false);
        setPhoneError(phoneResult.error ?? "Lỗi hệ thống");
        return;
      }
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => router.push("/"), 1000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${isBusiness ? "bg-blue-700" : "bg-green-700"} text-white`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <nav className={`text-xs ${isBusiness ? "text-blue-300" : "text-green-300"} mb-2 flex items-center gap-1`}>
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>›</span>
            <span className="text-white">Thông tin tài khoản</span>
          </nav>
          <h1 className="text-2xl font-bold">Chỉnh sửa thông tin</h1>
          <p className={`${isBusiness ? "text-blue-300" : "text-green-300"} text-sm mt-0.5`}>
            {isBusiness ? "🏪 Tài khoản Doanh nghiệp" : "🛒 Tài khoản Người mua"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Thông tin cá nhân</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isBusiness ? "Tên người liên hệ" : "Họ và tên"} <span className="text-red-500">*</span>
                </label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${focusRing}`}
                  placeholder="Nhập họ tên..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${focusRing}`}
                  placeholder="example@email.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${focusRing} ${phoneError ? "border-red-400" : "border-gray-200"}`}
                />
                {phoneError && <p className="text-red-500 text-xs mt-1.5">{phoneError}</p>}
              </div>
            </div>
          </div>

          {/* Business info */}
          {isBusiness && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Thông tin doanh nghiệp</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tên doanh nghiệp <span className="text-red-500">*</span></label>
                  <input value={bizName} onChange={(e) => setBizName(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên công ty / hộ kinh doanh..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mã số thuế</label>
                  <input value={taxCode} onChange={(e) => setTaxCode(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0123456789" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Địa chỉ kinh doanh</label>
                  <input value={bizAddress} onChange={(e) => setBizAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Số nhà, đường, xã/phường, huyện/TP..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Lĩnh vực kinh doanh</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">-- Chọn lĩnh vực --</option>
                    {BUSINESS_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả doanh nghiệp</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Giới thiệu ngắn về doanh nghiệp..." />
                </div>
                {user.business?.verified && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                    Doanh nghiệp đã được xác minh
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              Cập nhật thông tin thành công!
            </div>
          )}
          <button type="submit" disabled={saving}
            className={`w-full font-bold py-3.5 rounded-xl transition-colors text-white disabled:bg-gray-300 ${btnBg}`}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}
