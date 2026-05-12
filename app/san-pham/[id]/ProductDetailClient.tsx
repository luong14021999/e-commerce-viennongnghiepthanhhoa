'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import type { Product } from '@/app/lib/data';
import { formatPrice, discountPercent } from '@/app/lib/data';
import { useCart } from '@/app/context/CartContext';
import { useProducts } from '@/app/context/ProductContext';
import ProductCard from '@/app/components/ProductCard';
import ProductReviews from '@/app/components/ProductReviews';
import { useReviewStats } from '@/app/context/ReviewStatsContext';

export default function ProductDetailClient({
  product: initialProduct,
  productId,
  related: initialRelated,
}: {
  product: Product | null;
  productId: string;
  related: Product[];
}) {
  const { addToCart } = useCart();
  const { sellerProducts, isLoaded } = useProducts();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const reviewStats = useReviewStats(productId);

  // Fall back to seller products from context if not in base catalog
  const product =
    initialProduct ?? sellerProducts.find(p => p.id === productId) ?? null;

  const related = initialProduct
    ? initialRelated
    : sellerProducts
        .filter(p => p.category === product?.category && p.id !== productId)
        .slice(0, 4);

  // Wait for localStorage to load before showing 404
  if (!product && !isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  if (!product) return notFound();

  // Alias so closures below see Product (not Product | null)
  const p = product;
  const isService = p.type === 'service';
  const allImages =
    p.images && p.images.length > 0 ? p.images : p.imageUrl ? [p.imageUrl] : [];
  const discount = isService ? 0 : discountPercent(p.originalPrice, p.price);

  function handleAddToCart() {
    addToCart(p, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addToCart(p, quantity);
    router.push('/gio-hang');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
            <Link href="/" className="hover:text-green-700">
              Trang chủ
            </Link>
            <span>›</span>
            <Link href="/san-pham" className="hover:text-green-700">
              {isService ? 'Dịch vụ' : 'Sản phẩm'}
            </Link>
            <span>›</span>
            <span className="text-gray-800 font-medium">{p.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Image / icon area */}
          <div>
            <div
              className={`${p.bg} rounded-2xl flex items-center justify-center h-64 md:h-80 relative border border-gray-200 overflow-hidden`}
            >
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImg]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl md:text-9xl">{p.icon}</span>
              )}
              {p.tag && (
                <span
                  className={`absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded ${p.tagColor}`}
                >
                  {p.tag}
                </span>
              )}
              {!isService && discount > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-lg">
                  -{discount}%
                </span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-400'}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {p.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(reviewStats ? reviewStats.avgRating : p.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className="text-sm font-semibold text-gray-700 ml-1">
                  {reviewStats ? reviewStats.avgRating : p.rating}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                | {reviewStats ? reviewStats.count : p.reviews} đánh giá
              </span>
              {isService ? (
                <span className="text-sm text-gray-500">
                  | {p.sold.toLocaleString()} lượt sử dụng
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  | Đã bán {p.sold.toLocaleString()}
                </span>
              )}
            </div>

            {isService ? (
              /* ── SERVICE: contact CTA ── */
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
                  <p className="text-blue-800 font-semibold text-lg mb-1">
                    Liên hệ để biết giá dịch vụ
                  </p>
                  <p className="text-blue-600 text-sm mb-4">
                    Báo giá theo quy mô và yêu cầu cụ thể của đơn vị.
                  </p>
                  <a
                    href="tel:0929606568"
                    className="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-base py-3 rounded-xl transition-colors mb-2"
                  >
                    📞 Gọi ngay: 0929 606 568
                  </a>
                  <a
                    href="mailto:info@viennongnghiep.vn"
                    className="flex items-center justify-center gap-2 w-full border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    ✉️ Gửi email yêu cầu
                  </a>
                </div>

                {/* Origin & certs */}
                <div className="mb-5 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-28 flex-shrink-0">
                      Đơn vị cung cấp:
                    </span>
                    <span className="font-medium text-gray-800">
                      {p.origin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 w-28 flex-shrink-0">
                      Chứng nhận:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.certifications.map(c => (
                        <span
                          key={c}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-200"
                        >
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* ── PRODUCT: price + cart ── */
              <>
                {/* Price */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  {p.price === 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-green-700">Liên hệ để biết giá</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-3xl font-bold text-red-600">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-sm text-gray-500">/{p.unit}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-base text-gray-400 line-through">
                            {formatPrice(p.originalPrice)}
                          </span>
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                            Tiết kiệm {formatPrice(p.originalPrice - p.price)}/
                            {p.unit}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Origin & certs */}
                <div className="mb-5 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-24 flex-shrink-0">
                      Xuất xứ:
                    </span>
                    <span className="font-medium text-gray-800">
                      {p.origin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 w-24 flex-shrink-0">
                      Chứng nhận:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.certifications.map(c => (
                        <span
                          key={c}
                          className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full border border-green-200"
                        >
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                {p.price > 0 && (
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-sm text-gray-600 font-medium">
                      Số lượng:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-base font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Tổng:{' '}
                      <span className="font-bold text-red-600">
                        {formatPrice(p.price * quantity)}
                      </span>
                    </span>
                  </div>
                )}

                {/* Buttons */}
                {p.price === 0 ? (
                  <div className="flex gap-3 flex-wrap">
                    <a
                      href="tel:0929606568"
                      className="flex-1 min-w-36 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors text-center"
                    >
                      📞 Liên hệ ngay
                    </a>
                    <a
                      href="https://zalo.me/0929606568"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-36 border-2 border-[#0068FF] text-[#0068FF] hover:bg-blue-50 py-3 rounded-xl font-semibold text-sm transition-colors text-center"
                    >
                      Chat Zalo
                    </a>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 min-w-36 py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                        added
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-green-600 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {added ? '✓ Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 min-w-36 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                    >
                      Mua ngay
                    </button>
                  </div>
                )}

                {/* Delivery note */}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
                  <span>🚚</span>
                  <span>
                    Giao hàng nội thành Thanh Hóa trong 2–4 giờ. Ngoại tỉnh 3–5
                    ngày.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description + specs */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {isService ? 'Mô tả dịch vụ' : 'Mô tả sản phẩm'}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">{p.desc}</p>
            <h3 className="text-base font-bold text-gray-900 mb-3">
              {isService ? 'Nội dung dịch vụ' : 'Thông số kỹ thuật'}
            </h3>
            <ul className="space-y-2">
              {p.specs.map(s => (
                <li
                  key={s}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${isService ? 'text-blue-600' : 'text-green-600'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {isService ? (
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
                <h3 className="text-base font-bold text-blue-900 mb-3">
                  Liên hệ tư vấn
                </h3>
                <ul className="space-y-3 text-sm mb-4">
                  {[
                    { icon: '📞', text: 'Hotline: 0929 606 568' },
                    { icon: '✉️', text: 'info@viennongnghiep.vn' },
                    {
                      icon: '📍',
                      text: 'số 271, đường Nguyễn Phục, phường Quảng Thắng, TP. Thanh Hóa, tỉnh Thanh Hóa',
                    },
                    { icon: '🕐', text: 'Hỗ trợ: 7:30–17:00 (T2–T7)' },
                  ].map(item => (
                    <li
                      key={item.text}
                      className="flex items-center gap-2 text-blue-800"
                    >
                      <span>{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <a
                  href="tel:0929606568"
                  className="block text-center bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  📞 Gọi ngay tư vấn
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Đảm bảo từ Viện
                </h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { icon: '✅', text: 'Hàng chính hãng 100%' },
                    { icon: '🔄', text: 'Đổi trả miễn phí nếu lỗi' },
                    { icon: '🚚', text: 'Giao hàng toàn tỉnh' },
                    { icon: '📞', text: 'Hỗ trợ kỹ thuật 24/7' },
                  ].map(item => (
                    <li
                      key={item.text}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <span>{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <p className="text-sm font-semibold text-green-800 mb-1">
                Cần tư vấn thêm?
              </p>
              <p className="text-xs text-green-700 mb-3">
                Gọi ngay để được kỹ sư hỗ trợ miễn phí
              </p>
              <a
                href="tel:0929606568"
                className="block text-center bg-green-700 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-green-600 transition-colors"
              >
                📞 0929 606 568
              </a>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-10">
          <ProductReviews productId={productId} />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
