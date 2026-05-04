"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { formatPrice } from "@/app/lib/data";

const SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = totalPrice + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-20">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8 text-center">Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
        <Link
          href="/san-pham"
          className="bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của tôi</h1>
            <p className="text-sm text-gray-500">{items.length} sản phẩm</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Xóa tất cả
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                {/* Product icon */}
                <Link href={`/san-pham/${product.id}`} className={`${product.bg} w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 text-4xl overflow-hidden relative`}>
                  {(product.images?.[0] ?? product.imageUrl)
                    ? <Image src={product.images?.[0] ?? product.imageUrl!} alt={product.name} fill className="object-cover" sizes="80px" />
                    : <span>{product.icon}</span>
                  }
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/san-pham/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 text-sm mb-0.5 hover:text-green-700 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-2">{product.origin}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-red-600 font-bold text-sm">{formatPrice(product.price)}/{product.unit}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </div>

                {/* Quantity controls */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              href="/san-pham"
              className="flex items-center gap-2 text-sm text-green-700 font-medium hover:text-green-600 pt-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({items.length} sản phẩm)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-semibold">Miễn phí</span>
                  ) : (
                    <span className="font-medium">{formatPrice(shippingFee)}</span>
                  )}
                </div>
                {shippingFee > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                    Thêm <span className="font-bold">{formatPrice(SHIPPING_THRESHOLD - totalPrice)}</span> để được miễn phí vận chuyển
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-red-600">{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">(Đã bao gồm VAT nếu có)</p>
              </div>

              <button
                disabled={isLoading}
                onClick={() => {
                  if (user?.role === "buyer") {
                    router.push("/thanh-toan");
                  } else {
                    router.push("/dang-nhap?redirect=/thanh-toan");
                  }
                }}
                className="block w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl text-center transition-colors text-sm"
              >
                {isLoading ? "Đang tải..." : user?.role === "buyer" ? `Đặt hàng ngay (${formatPrice(grandTotal)})` : "Đăng nhập để đặt hàng"}
              </button>

              {!isLoading && !user && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Bạn cần <Link href="/dang-nhap?redirect=/thanh-toan" className="text-green-700 font-semibold hover:underline">đăng nhập</Link> để thanh toán
                </p>
              )}

              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
                <span>🔒 Thanh toán an toàn</span>
                <span>•</span>
                <span>🚚 Giao hàng nhanh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
