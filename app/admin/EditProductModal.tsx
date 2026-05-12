"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useProducts } from "@/app/context/ProductContext";
import { SITE_CATEGORIES } from "@/app/lib/categories";
import type { Product } from "@/app/lib/data";

const MAX_IMAGES = 6;
const MAX_FILE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type EditForm = {
  name: string; category: string; tag: string; desc: string;
  price: string; originalPrice: string; unit: string;
  certifications: string; origin: string;
};

type SpecRow = { key: string; val: string };

function parseSpecs(specs: string[]): SpecRow[] {
  if (!specs.length) return [{ key: "", val: "" }];
  return specs.map(s => {
    const idx = s.indexOf(":");
    if (idx > -1) return { key: s.slice(0, idx).trim(), val: s.slice(idx + 1).trim() };
    return { key: s, val: "" };
  });
}

const INPUT = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
const SECTION = "border-t border-gray-100 pt-5 space-y-4";

export default function EditProductModal({ product, onClose, resubmit }: {
  product: Product; onClose: () => void; resubmit?: boolean;
}) {
  const { updateProduct } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<EditForm>({
    name: product.name,
    category: product.category,
    tag: product.tag ?? "",
    desc: product.desc,
    price: product.price > 0 ? String(product.price) : "",
    originalPrice: (product.originalPrice ?? 0) > product.price ? String(product.originalPrice) : "",
    unit: product.unit,
    certifications: (product.certifications ?? []).join(", "),
    origin: product.origin ?? "",
  });
  const [contactPrice, setContactPrice] = useState(product.price === 0);
  const [specRows, setSpecRows] = useState<SpecRow[]>(parseSpecs(product.specs ?? []));
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images ?? (product.imageUrl ? [product.imageUrl] : [])
  );
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");

  const selectedCategory = SITE_CATEGORIES.find(c => c.id === form.category);
  const isService = selectedCategory?.type === "service";
  const totalImages = existingImages.length + newFiles.length;

  function setField(field: keyof EditForm, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  // ── Specs ──────────────────────────────────────────────────────────────
  function updateSpec(idx: number, field: "key" | "val", value: string) {
    setSpecRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }
  function addSpec() { setSpecRows(prev => [...prev, { key: "", val: "" }]); }
  function removeSpec(idx: number) {
    setSpecRows(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ key: "", val: "" }]);
  }

  // ── Images ────────────────────────────────────────────────────────────
  function removeExistingImage(url: string) {
    setExistingImages(prev => prev.filter(u => u !== url));
    setRemovedImageUrls(prev => [...prev, url]);
  }

  function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const files = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    const errs: string[] = [];
    for (const f of files) {
      if (!ACCEPTED_TYPES.includes(f.type)) { errs.push(`${f.name}: không đúng định dạng (JPG/PNG/WebP)`); continue; }
      if (f.size > MAX_FILE_MB * 1024 * 1024) { errs.push(`${f.name}: vượt quá ${MAX_FILE_MB}MB`); continue; }
      valid.push(f);
    }
    const toAdd = valid.slice(0, MAX_IMAGES - totalImages);
    setNewFiles(prev => [...prev, ...toAdd]);
    setNewPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    if (errs.length) setFileError(errs.join(" · "));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewFile(idx: number) {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  // Move image to be first (set as main)
  function setMainImage(idx: number) {
    setExistingImages(prev => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Vui lòng nhập tên sản phẩm"); return; }
    setSaving(true);
    setError("");

    const price = contactPrice ? 0 : Number(form.price) || 0;
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : price;
    const specsArr = specRows
      .filter(r => r.key.trim())
      .map(r => r.val.trim() ? `${r.key}: ${r.val}` : r.key);
    const certs = form.certifications.split(",").map(s => s.trim()).filter(Boolean);

    const result = await updateProduct(
      product.id,
      {
        name: form.name,
        category: form.category,
        type: isService ? "service" : "product",
        price,
        originalPrice: originalPrice >= price ? originalPrice : price,
        unit: form.unit,
        icon: isService ? "📋" : "🌾",
        bg: isService ? "bg-blue-50" : "bg-green-50",
        tag: form.tag || undefined,
        tagColor: form.tag ? (isService ? "bg-blue-600 text-white" : "bg-green-600 text-white") : undefined,
        desc: form.desc,
        specs: specsArr.length ? specsArr : [`Đơn vị: ${form.unit}`],
        origin: form.origin || product.origin,
        certifications: certs.length ? certs : product.certifications,
      },
      newFiles.length > 0 ? newFiles : undefined,
      removedImageUrls.length > 0 ? removedImageUrls : undefined,
      resubmit,
    );

    setSaving(false);
    if (!result.ok) { setError(result.error ?? "Có lỗi xảy ra"); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-4 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{resubmit ? "Bổ sung & Gửi lại" : "Chỉnh sửa sản phẩm"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Các trường <span className="text-red-500">*</span> là bắt buộc</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5">
          {resubmit && product.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">Lý do từ chối: </span>{product.rejectionReason}
            </div>
          )}

          {/* ── 1. Thông tin cơ bản ── */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide text-green-700">
              <span>📝</span> Thông tin cơ bản
            </h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên sản phẩm / dịch vụ <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} required
                className={INPUT} placeholder="VD: Lúa giống BC15, Tư vấn quy hoạch nông nghiệp..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={e => setField("category", e.target.value)}
                  className={INPUT + " bg-white"}>
                  <option value="">-- Chọn danh mục --</option>
                  <optgroup label="🛠️ Dịch vụ">
                    {SITE_CATEGORIES.filter(c => c.type === "service").map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="📦 Sản phẩm">
                    {SITE_CATEGORIES.filter(c => c.type === "product").map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </optgroup>
                </select>
                {selectedCategory && (
                  <p className="text-xs mt-1 text-gray-500">
                    Loại: <span className={`font-semibold ${isService ? "text-blue-600" : "text-green-600"}`}>
                      {isService ? "Dịch vụ" : "Sản phẩm"}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nhãn hiển thị <span className="text-gray-400 font-normal">(tùy chọn)</span>
                </label>
                <input type="text" value={form.tag} onChange={e => setField("tag", e.target.value)}
                  placeholder="VD: Mới, Nổi bật, VietGAP, OCOP..." className={INPUT} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả chi tiết <span className="text-red-500">*</span></label>
              <textarea value={form.desc} onChange={e => setField("desc", e.target.value)} required rows={4}
                placeholder="Mô tả về nguồn gốc, đặc điểm, công dụng, hướng dẫn sử dụng..."
                className={INPUT + " resize-none"} />
            </div>
          </section>

          {/* ── 2. Giá & Đơn vị ── */}
          <section className={SECTION}>
            <h3 className="font-bold text-sm uppercase tracking-wide text-green-700 flex items-center gap-2">
              <span>💰</span> Hình thức giao dịch & Giá
            </h3>

            {/* Toggle Liên hệ */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setContactPrice(v => !v)}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${contactPrice ? "bg-green-600" : "bg-gray-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${contactPrice ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-700">Liên hệ để biết giá</p>
                <p className="text-xs text-gray-400">Bật nếu chưa muốn công khai giá cụ thể</p>
              </div>
            </div>

            {contactPrice ? (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-medium flex items-center gap-2">
                <span>ℹ️</span> Sản phẩm sẽ hiển thị trạng thái "Liên hệ để biết giá" với khách hàng
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá bán (đ) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.price} onChange={e => setField("price", e.target.value)} min={0}
                    placeholder="VD: 45000" className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá gốc (đ) <span className="text-gray-400 font-normal">(để hiện giảm giá)</span></label>
                  <input type="number" value={form.originalPrice} onChange={e => setField("originalPrice", e.target.value)} min={0}
                    placeholder="VD: 55000" className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đơn vị tính <span className="text-red-500">*</span></label>
                  <input type="text" value={form.unit} onChange={e => setField("unit", e.target.value)}
                    placeholder="kg, lít, bao, hộp..." className={INPUT} />
                </div>
              </div>
            )}
            {contactPrice && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đơn vị tính</label>
                <input type="text" value={form.unit} onChange={e => setField("unit", e.target.value)}
                  placeholder="kg, lít, bao, hộp..." className={INPUT} />
              </div>
            )}
          </section>

          {/* ── 3. Thông số kỹ thuật ── */}
          <section className={SECTION}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wide text-green-700 flex items-center gap-2">
                <span>📋</span> {isService ? "Nội dung dịch vụ" : "Thông số kỹ thuật"}
              </h3>
              <button type="button" onClick={addSpec}
                className="flex items-center gap-1 text-xs text-green-700 font-semibold border border-green-300 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {specRows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text" value={row.key}
                    onChange={e => updateSpec(idx, "key", e.target.value)}
                    placeholder={isService ? `Mục ${idx + 1}` : `Thuộc tính`}
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-gray-400 flex-shrink-0">:</span>
                  <input
                    type="text" value={row.val}
                    onChange={e => updateSpec(idx, "val", e.target.value)}
                    placeholder={isService ? `Nội dung` : `Giá trị`}
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button type="button" onClick={() => removeSpec(idx)}
                    className="text-gray-400 hover:text-red-500 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Chứng nhận / Chứng chỉ <span className="text-gray-400 font-normal">(phân cách bởi dấu phẩy)</span>
                </label>
                <input type="text" value={form.certifications} onChange={e => setField("certifications", e.target.value)}
                  placeholder="VD: Bộ NN&PTNT, VietGAP, ISO 9001" className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xuất xứ / Nguồn gốc <span className="text-red-500">*</span></label>
                <input type="text" value={form.origin} onChange={e => setField("origin", e.target.value)}
                  placeholder="VD: Thanh Hóa, Nghệ An..." className={INPUT} />
              </div>
            </div>
          </section>

          {/* ── 4. Hình ảnh ── */}
          <section className={SECTION}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wide text-green-700 flex items-center gap-2">
                <span>🖼️</span> Hình ảnh sản phẩm
              </h3>
              <span className="text-xs text-gray-400">{totalImages}/{MAX_IMAGES} ảnh · JPG/PNG/WebP · tối đa {MAX_FILE_MB}MB/ảnh</span>
            </div>

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleAddFiles} className="hidden" />

            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, idx) => (
                <div key={url} className={`relative w-24 h-24 rounded-xl overflow-hidden group flex-shrink-0 border-2 ${idx === 0 ? "border-green-500" : "border-gray-200"}`}>
                  <Image src={url} alt="" fill className="object-cover" sizes="96px" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {idx === 0
                    ? <span className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-[10px] font-bold text-center py-0.5">★ Ảnh chính</span>
                    : <button type="button" onClick={() => setMainImage(idx)}
                        className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                        Đặt làm chính
                      </button>
                  }
                  <button type="button" onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
                    ✕
                  </button>
                </div>
              ))}
              {newPreviews.map((src, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-green-400 group flex-shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[10px] font-bold text-center py-0.5">Mới</span>
                  <button type="button" onClick={() => removeNewFile(idx)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
                    ✕
                  </button>
                </div>
              ))}
              {totalImages < MAX_IMAGES && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-green-700 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-semibold">{totalImages}/{MAX_IMAGES}</span>
                </button>
              )}
            </div>

            {fileError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{fileError}</p>
            )}
          </section>

          {/* Errors & Actions */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="flex gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang lưu...
                </>
              ) : resubmit ? "Gửi lại để duyệt" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
