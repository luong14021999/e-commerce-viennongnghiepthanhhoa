'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useProducts } from '@/app/context/ProductContext';
import { formatPrice } from '@/app/lib/data';
import type { Product } from '@/app/lib/data';
import { SITE_CATEGORIES } from '@/app/lib/categories';

type RejectMode = 'reject' | 'hide' | 'request-edit';

export default function ProductApprovalModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { updateStatus } = useProducts();
  const [rejectMode, setRejectMode] = useState<RejectMode | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const catLabel = SITE_CATEGORIES.find(c => c.id === product.category)?.label ?? product.category;
  const imageUrl = product.images?.[0] ?? product.imageUrl;

  async function handleApprove() {
    setLoading(true);
    await updateStatus(product.id, 'approved');
    setLoading(false);
    onClose();
  }

  async function handleReject() {
    if (!rejectMode) return;
    setLoading(true);
    const finalReason =
      rejectMode === 'hide'
        ? (reason || '[ẨN] Vi phạm quy định hiển thị')
        : rejectMode === 'request-edit'
        ? (reason || 'Vui lòng chỉnh sửa nội dung sản phẩm')
        : (reason || 'Không đáp ứng tiêu chuẩn');
    await updateStatus(product.id, 'rejected', finalReason);
    setLoading(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <span className="font-bold text-gray-800">Chi tiết sản phẩm chờ duyệt</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Image + name */}
          <div className="flex gap-4 items-start">
            <div className={`${product.bg} w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center text-4xl flex-shrink-0 relative`}>
              {imageUrl
                ? <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="80px" />
                : <span>{product.icon}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                📁 {catLabel}
                {product.type === 'service' ? ' · Dịch vụ' : ' · Sản phẩm'}
              </p>
              <p className="text-sm font-semibold text-green-700 mt-0.5">
                {product.price > 0 ? `${formatPrice(product.price)}/${product.unit}` : 'Liên hệ'}
              </p>
              {product.sellerName && (
                <p className="text-xs text-blue-600 mt-0.5">🏪 {product.sellerName}</p>
              )}
              {product.submittedAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Gửi lúc {new Date(product.submittedAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {product.desc && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mô tả</p>
              <p className="text-sm text-gray-700 leading-relaxed">{product.desc}</p>
            </div>
          )}

          {/* Specs */}
          {product.specs?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Thông số kỹ thuật</p>
              <ul className="space-y-1">
                {product.specs.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Origin + certifications */}
          <div className="flex gap-4 flex-wrap text-sm">
            {product.origin && (
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                <span className="text-gray-400">🌍</span>
                <span className="text-gray-700">{product.origin}</span>
              </div>
            )}
            {product.certifications?.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-green-50 rounded-lg px-3 py-1.5">
                <span>✅</span>
                <span className="text-green-700">{c}</span>
              </div>
            ))}
          </div>

          {/* Additional images */}
          {(product.images?.length ?? 0) > 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Hình ảnh</p>
              <div className="flex gap-2 flex-wrap">
                {product.images!.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reject input */}
          {rejectMode && (
            <div className="bg-red-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-red-700">
                {rejectMode === 'request-edit' ? 'Yêu cầu chỉnh sửa' : rejectMode === 'hide' ? 'Lý do ẩn sản phẩm' : 'Lý do từ chối'}
              </p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder={
                  rejectMode === 'request-edit'
                    ? 'Vui lòng chỉnh sửa nội dung sản phẩm...'
                    : rejectMode === 'hide'
                    ? '[ẨN] Vi phạm quy định hiển thị...'
                    : 'Không đáp ứng tiêu chuẩn...'
                }
                className="w-full text-sm border border-red-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors disabled:opacity-60"
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                <button
                  onClick={() => { setRejectMode(null); setReason(''); }}
                  className="px-4 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!rejectMode && (
          <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-white">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Duyệt sản phẩm
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setRejectMode('request-edit')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm px-4 py-2.5 rounded-xl border border-amber-200 transition-colors"
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                onClick={() => setRejectMode('reject')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm px-4 py-2.5 rounded-xl border border-red-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Từ chối
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
