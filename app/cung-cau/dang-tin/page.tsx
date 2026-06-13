"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { POST_CATEGORIES, type MarketPostType } from "../types";

export default function NewMarketPostPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [type, setType] = useState<MarketPostType>("cung");
  const [form, setForm] = useState({
    category: "lua-gao",
    title: "",
    description: "",
    quantityValue: "",
    quantityUnit: "kg",
    priceValue: "",
    priceUnit: "kg",
    priceNegotiable: false,
    location: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    validUntil: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/dang-nhap?redirect=/cung-cau/dang-tin`);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        contactName: f.contactName || user.name,
        contactPhone: f.contactPhone || user.phone,
        contactEmail: f.contactEmail || user.email,
      }));
    }
  }, [user]);

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (form.title.length > 200) e.title = "Tiêu đề tối đa 200 ký tự";
    if (!form.contactName.trim()) e.contactName = "Vui lòng nhập tên liên hệ";
    if (!form.contactPhone.trim()) e.contactPhone = "Vui lòng nhập số điện thoại";
    if (!/^[0-9+\-\s().]{8,}$/.test(form.contactPhone)) e.contactPhone = "Số điện thoại không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user || !validate()) return;
    setSubmitting(true);
    setSubmitError("");

    const supabase = createClient();
    const payload = {
      user_id: user.id,
      type,
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      quantity_value: form.quantityValue ? Number(form.quantityValue) : null,
      quantity_unit: form.quantityUnit || null,
      price_value: form.priceNegotiable || !form.priceValue ? null : Number(form.priceValue),
      price_unit: form.priceNegotiable || !form.priceValue ? null : form.priceUnit,
      price_negotiable: form.priceNegotiable,
      location: form.location.trim(),
      contact_name: form.contactName.trim(),
      contact_phone: form.contactPhone.trim(),
      contact_email: form.contactEmail.trim() || null,
      valid_until: form.validUntil || null,
    };

    const { data, error } = await supabase
      .from("market_posts")
      .insert(payload)
      .select("id")
      .single();

    setSubmitting(false);

    if (error || !data) {
      setSubmitError(error?.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }

    router.push(`/cung-cau/${data.id}`);
  }

  if (isLoading || !user) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Link href="/cung-cau" className="text-sm text-gray-500 hover:text-gray-700">
            ← Quay lại danh sách
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng tin Cung – Cầu</h1>
            <p className="text-sm text-gray-500">
              Tin của bạn sẽ hiển thị công khai cho mọi người trên sàn.
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Loại tin <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("cung")}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  type === "cung"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-lg font-bold text-green-700">🟢 Cần BÁN</div>
                <div className="text-xs text-gray-500 mt-1">Cung cấp nông sản, vật tư, dịch vụ</div>
              </button>
              <button
                type="button"
                onClick={() => setType("cau")}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  type === "cau"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-lg font-bold text-blue-700">🔵 Cần MUA</div>
                <div className="text-xs text-gray-500 mt-1">Tìm nhà cung cấp, đối tác sản xuất</div>
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục <span className="text-red-500">*</span></label>
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder={
                type === "cung"
                  ? "VD: Cần bán 500 tấn lúa BC15 vụ Đông Xuân tại Thiệu Hóa"
                  : "VD: Cần mua 10 tấn cam Vinh, giao tháng 12, có hợp đồng dài hạn"
              }
              className={`w-full px-4 py-2.5 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.title ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              placeholder="Mô tả về sản phẩm, yêu cầu chất lượng, điều kiện giao hàng, hình thức thanh toán..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Quantity + Price */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.quantityValue}
                  onChange={(e) => setField("quantityValue", e.target.value)}
                  placeholder="500"
                  min="0"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={form.quantityUnit}
                  onChange={(e) => setField("quantityUnit", e.target.value)}
                  placeholder="kg / tấn / con"
                  className="w-32 px-3 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá tham khảo</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.priceValue}
                  onChange={(e) => setField("priceValue", e.target.value)}
                  disabled={form.priceNegotiable}
                  placeholder="50000"
                  min="0"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
                <input
                  type="text"
                  value={form.priceUnit}
                  onChange={(e) => setField("priceUnit", e.target.value)}
                  disabled={form.priceNegotiable}
                  placeholder="kg"
                  className="w-24 px-3 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.priceNegotiable}
                  onChange={(e) => setField("priceNegotiable", e.target.checked)}
                  className="rounded"
                />
                Giá thỏa thuận
              </label>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="VD: Xã Thiệu Tiến, Huyện Thiệu Hóa, Tỉnh Thanh Hóa"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Contact */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-amber-900 text-sm">📞 Thông tin liên hệ</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => setField("contactName", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${errors.contactName ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setField("contactPhone", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${errors.contactPhone ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email (tùy chọn)</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>
          </div>

          {/* Valid until */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tin có hiệu lực đến (tùy chọn)</label>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => setField("validUntil", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {submitError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/cung-cau"
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng tin...
                </>
              ) : (
                "🚀 Đăng tin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
