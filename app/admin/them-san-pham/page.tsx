"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useProducts } from "@/app/context/ProductContext";
import { categories } from "@/app/lib/data";

const ICONS = ["🌾", "🌽", "🥬", "🍊", "🍚", "🌱", "🍃", "🍯", "🐟", "🥒", "🍅", "🥕", "🧅", "🌿", "🫚", "🧄",
               "📋", "🔬", "🎓", "🧪", "💊", "🌻", "🐄", "🐠", "🍵", "🌰", "🫑", "🌶️"];
const BG_OPTIONS = [
  { label: "Xanh lá", value: "bg-green-50" },
  { label: "Xanh dương", value: "bg-blue-50" },
  { label: "Vàng", value: "bg-yellow-50" },
  { label: "Cam", value: "bg-orange-50" },
  { label: "Xanh ngọc", value: "bg-teal-50" },
  { label: "Xanh lime", value: "bg-lime-50" },
  { label: "Hổ phách", value: "bg-amber-50" },
  { label: "Đỏ nhạt", value: "bg-red-50" },
];

const MAX_IMAGES = 6;
const INSTITUTE_NAME = "Viện Nông Nghiệp Thanh Hóa";

type FormState = {
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  unit: string;
  icon: string;
  bg: string;
  tag: string;
  desc: string;
  spec1: string; spec2: string; spec3: string; spec4: string;
  certifications: string;
};

export default function AdminAddProductPage() {
  const { user, isLoading } = useAuth();
  const { submitProduct } = useProducts();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [contactPrice, setContactPrice] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "", category: "", price: "", originalPrice: "", unit: "dịch vụ", icon: "🌿", bg: "bg-green-50",
    tag: "", desc: "", spec1: "", spec2: "", spec3: "", spec4: "", certifications: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/dang-nhap");
  }, [user, isLoading, router]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  if (isLoading || !user || user.role !== "admin") return null;

  const selectedCategory = categories.find((c) => c.id === form.category);
  const isService = selectedCategory?.type === "service";

  function setField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function validate() {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = "Bắt buộc";
    if (!form.category) errs.category = "Bắt buộc";
    if (!contactPrice) {
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = "Giá không hợp lệ";
    }
    if (!form.unit.trim()) errs.unit = "Bắt buộc";
    if (!form.desc.trim()) errs.desc = "Bắt buộc";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!user || !validate()) return;

    setSubmitting(true);
    setSubmitError("");

    const price = contactPrice ? 0 : Number(form.price);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : price;
    const specs = [form.spec1, form.spec2, form.spec3, form.spec4].filter(Boolean);
    const certs = form.certifications.split(",").map((s) => s.trim()).filter(Boolean);

    const result = await submitProduct(
      {
        name: form.name,
        category: form.category,
        type: isService ? "service" : "product",
        price,
        originalPrice: originalPrice >= price ? originalPrice : price,
        unit: form.unit,
        icon: form.icon,
        bg: form.bg,
        tag: form.tag || undefined,
        tagColor: form.tag ? (isService ? "bg-blue-600 text-white" : "bg-green-600 text-white") : undefined,
        desc: form.desc,
        specs: specs.length ? specs : [`Đơn vị: ${form.unit}`],
        origin: INSTITUTE_NAME,
        certifications: certs.length ? certs : ["Viện Nông Nghiệp Thanh Hóa"],
        sellerId: user.id,
        sellerName: INSTITUTE_NAME,
      },
      "approved",
      imageFiles
    );

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã đăng thành công!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sản phẩm / dịch vụ đã được <span className="font-semibold text-green-700">hiển thị công khai</span> trên hệ thống.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Link href="/admin" className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm text-center hover:bg-gray-50 transition-colors">
                Về trang quản trị
              </Link>
              <button
                onClick={() => { setSubmitted(false); setImageFiles([]); setPreviews([]); setContactPrice(false); }}
                className="flex-1 border-2 border-green-700 text-green-700 font-semibold py-3 rounded-xl text-sm hover:bg-green-50 transition-colors">
                Đăng thêm
              </button>
            </div>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 text-center">← Về trang chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Viện Nông Nghiệp Thanh Hóa</p>
            <h1 className="text-lg font-bold">Đăng sản phẩm / dịch vụ của Viện</h1>
          </div>
          <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← Quản trị</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><span>📝</span> Thông tin cơ bản</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sản phẩm / dịch vụ <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
                placeholder="VD: Tư vấn quy hoạch nông nghiệp, Lúa giống BC15..."
                className={`w-full px-4 py-2.5 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? "border-red-400" : "border-gray-300"}`}/>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={(e) => setField("category", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${errors.category ? "border-red-400" : "border-gray-300"}`}>
                  <option value="">-- Chọn danh mục --</option>
                  <optgroup label="Dịch vụ">
                    {categories.filter((c) => c.type === "service").map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Sản phẩm">
                    {categories.filter((c) => c.type === "product").map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </optgroup>
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                {selectedCategory && (
                  <p className="text-xs mt-1 text-gray-500">
                    Loại: <span className={`font-semibold ${isService ? "text-blue-600" : "text-green-600"}`}>{isService ? "Dịch vụ" : "Sản phẩm"}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nhãn hiển thị <span className="text-gray-400 font-normal">(tùy chọn)</span></label>
                <input type="text" value={form.tag} onChange={(e) => setField("tag", e.target.value)}
                  placeholder="VD: Mới, Nổi bật, VietGAP..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả <span className="text-red-500">*</span></label>
              <textarea value={form.desc} onChange={(e) => setField("desc", e.target.value)}
                rows={4} placeholder="Mô tả chi tiết về sản phẩm hoặc dịch vụ, phạm vi, đặc điểm..."
                className={`w-full px-4 py-2.5 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${errors.desc ? "border-red-400" : "border-gray-300"}`}/>
              {errors.desc && <p className="text-xs text-red-500 mt-1">{errors.desc}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><span>💰</span> Giá</h2>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div onClick={() => setContactPrice((v) => !v)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${contactPrice ? "bg-green-600" : "bg-gray-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${contactPrice ? "translate-x-4" : "translate-x-0"}`}/>
              </div>
              <span className="text-sm font-medium text-gray-700">Liên hệ để biết giá <span className="text-gray-400 font-normal">(dành cho dịch vụ báo giá theo yêu cầu)</span></span>
            </label>

            {!contactPrice && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá (đ) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.price} onChange={(e) => setField("price", e.target.value)}
                    placeholder="0" min={0}
                    className={`w-full px-4 py-2.5 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.price ? "border-red-400" : "border-gray-300"}`}/>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá gốc (đ) <span className="text-gray-400 font-normal">(tùy chọn)</span></label>
                  <input type="number" value={form.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)}
                    placeholder="0" min={0}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đơn vị <span className="text-red-500">*</span></label>
                  <input type="text" value={form.unit} onChange={(e) => setField("unit", e.target.value)}
                    placeholder="kg, lít, dự án, ca..."
                    className={`w-full px-4 py-2.5 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.unit ? "border-red-400" : "border-gray-300"}`}/>
                  {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
                </div>
              </div>
            )}
            {contactPrice && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đơn vị <span className="text-red-500">*</span></label>
                <input type="text" value={form.unit} onChange={(e) => setField("unit", e.target.value)}
                  placeholder="dự án, ca, mẫu..."
                  className={`w-full max-w-xs px-4 py-2.5 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.unit ? "border-red-400" : "border-gray-300"}`}/>
                {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span>📋</span> {isService ? "Nội dung dịch vụ" : "Thông số kỹ thuật"}
              <span className="text-gray-400 font-normal text-sm">(tùy chọn)</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {(["spec1","spec2","spec3","spec4"] as const).map((k, i) => (
                <input key={k} type="text" value={form[k]} onChange={(e) => setField(k, e.target.value)}
                  placeholder={isService ? `Nội dung ${i + 1} – VD: Lập đề án quy hoạch` : `Thông số ${i + 1} – VD: Năng suất: 65–70 tạ/ha`}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"/>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chứng nhận / Cấp phép <span className="text-gray-400 font-normal">(phân cách bởi dấu phẩy)</span></label>
              <input type="text" value={form.certifications} onChange={(e) => setField("certifications", e.target.value)}
                placeholder="VD: Bộ NN&PTNT, VietGAP, ISO 9001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"/>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><span>🎨</span> Hiển thị</h2>

            {/* Multi-image upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ảnh minh họa <span className="text-gray-400 font-normal">(tối đa {MAX_IMAGES} ảnh)</span>
              </label>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden"/>
              <div className="flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-green-500 group flex-shrink-0">
                    <img src={src} alt="" className="w-full h-full object-cover"/>
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-xs text-center py-0.5 font-semibold">
                        Ảnh chính
                      </span>
                    )}
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </button>
                  </div>
                ))}
                {imageFiles.length < MAX_IMAGES && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-green-700 flex-shrink-0">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-xs font-medium text-center leading-tight">
                      Thêm ảnh<br/><span className="text-gray-300">{imageFiles.length}/{MAX_IMAGES}</span>
                    </span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Ảnh đầu tiên là ảnh chính hiển thị trên thẻ sản phẩm.</p>
            </div>

            {/* Emoji icon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biểu tượng <span className="text-gray-400 font-normal">(dùng khi không có ảnh)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button key={icon} type="button" onClick={() => setField("icon", icon)}
                    className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center border-2 transition-all ${form.icon === icon ? "border-green-600 bg-green-50 scale-110" : "border-gray-200 hover:border-green-300"}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Màu nền thẻ</label>
              <div className="flex flex-wrap gap-2">
                {BG_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setField("bg", opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 ${opt.value} transition-all ${form.bg === opt.value ? "border-green-600 ring-2 ring-green-200" : "border-gray-200 hover:border-green-300"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <Link href="/admin" className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm text-center hover:bg-gray-100 transition-colors">
              Hủy
            </Link>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang tải lên...
                </>
              ) : "Đăng ngay →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
