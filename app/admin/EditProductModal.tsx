"use client";

import { useRef, useState } from "react";
import { useProducts } from "@/app/context/ProductContext";
import { categories } from "@/app/lib/data";
import type { Product } from "@/app/lib/data";

const MAX_IMAGES = 6;

type EditForm = {
  name: string; category: string; tag: string; desc: string;
  price: string; originalPrice: string; unit: string;
  spec1: string; spec2: string; spec3: string; spec4: string;
  certifications: string; origin: string;
};

export default function EditProductModal({ product, onClose, resubmit }: { product: Product; onClose: () => void; resubmit?: boolean }) {
  const { updateProduct } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const specs = product.specs ?? [];
  const [form, setForm] = useState<EditForm>({
    name: product.name,
    category: product.category,
    tag: product.tag ?? "",
    desc: product.desc,
    price: product.price > 0 ? String(product.price) : "",
    originalPrice: (product.originalPrice ?? 0) > product.price ? String(product.originalPrice) : "",
    unit: product.unit,
    spec1: specs[0] ?? "", spec2: specs[1] ?? "", spec3: specs[2] ?? "", spec4: specs[3] ?? "",
    certifications: (product.certifications ?? []).join(", "),
    origin: product.origin ?? "",
  });
  const [contactPrice, setContactPrice] = useState(product.price === 0);
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images ?? (product.imageUrl ? [product.imageUrl] : [])
  );
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = categories.find((c) => c.id === form.category);
  const isService = selectedCategory?.type === "service";
  const totalImages = existingImages.length + newFiles.length;

  function setField(field: keyof EditForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImageUrls((prev) => [...prev, url]);
  }

  function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const toAdd = files.slice(0, MAX_IMAGES - totalImages);
    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewFile(idx: number) {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const price = contactPrice ? 0 : Number(form.price) || 0;
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : price;
    const specsArr = [form.spec1, form.spec2, form.spec3, form.spec4].filter(Boolean);
    const certs = form.certifications.split(",").map((s) => s.trim()).filter(Boolean);

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">{resubmit ? "Bổ sung thông tin & Gửi lại" : "Chỉnh sửa sản phẩm"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {resubmit && product.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">Lý do từ chối: </span>{product.rejectionReason}
            </div>
          )}
          {/* Basic info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sản phẩm / dịch vụ <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục</label>
                <select value={form.category} onChange={(e) => setField("category", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
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
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nhãn hiển thị</label>
                <input type="text" value={form.tag} onChange={(e) => setField("tag", e.target.value)}
                  placeholder="VD: Mới, Nổi bật, VietGAP..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả <span className="text-red-500">*</span></label>
              <textarea value={form.desc} onChange={(e) => setField("desc", e.target.value)} required rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><span>💰</span> Giá</h3>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div onClick={() => setContactPrice((v) => !v)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${contactPrice ? "bg-green-600" : "bg-gray-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${contactPrice ? "translate-x-4" : "translate-x-0"}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Liên hệ để biết giá</span>
            </label>
            <div className="grid sm:grid-cols-3 gap-4">
              {!contactPrice && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá (đ)</label>
                    <input type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} min={0}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá gốc (đ)</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)} min={0}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đơn vị</label>
                <input type="text" value={form.unit} onChange={(e) => setField("unit", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>📋</span> {isService ? "Nội dung dịch vụ" : "Thông số kỹ thuật"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {(["spec1", "spec2", "spec3", "spec4"] as const).map((k, i) => (
                <input key={k} type="text" value={form[k]} onChange={(e) => setField(k, e.target.value)}
                  placeholder={isService ? `Nội dung ${i + 1}` : `Thông số ${i + 1}`}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chứng nhận <span className="text-gray-400 font-normal">(phân cách bởi dấu phẩy)</span></label>
              <input type="text" value={form.certifications} onChange={(e) => setField("certifications", e.target.value)}
                placeholder="VD: Bộ NN&PTNT, VietGAP, ISO 9001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xuất xứ / Nguồn gốc</label>
              <input type="text" value={form.origin} onChange={(e) => setField("origin", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          {/* Images */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>🖼️</span> Ảnh <span className="text-gray-400 font-normal text-sm">(tối đa {MAX_IMAGES})</span>
            </h3>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleAddFiles} className="hidden" />
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, idx) => (
                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-300 group flex-shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-gray-800/80 text-white text-[10px] text-center py-0.5">Ảnh chính</span>}
                  <button type="button" onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ))}
              {newPreviews.map((src, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-green-400 group flex-shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[10px] text-center py-0.5">Mới</span>
                  <button type="button" onClick={() => removeNewFile(idx)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <span className="text-xs">{totalImages}/{MAX_IMAGES}</span>
                </button>
              )}
            </div>
          </div>

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
