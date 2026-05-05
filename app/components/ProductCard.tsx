"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/app/lib/data";
import { formatPrice, discountPercent } from "@/app/lib/data";
import { useCart } from "@/app/context/CartContext";
import { useReviewStats } from "@/app/context/ReviewStatsContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const reviewStats = useReviewStats(product.id);
  const rating = reviewStats ? reviewStats.avgRating : product.rating;
  const reviewCount = reviewStats ? reviewStats.count : product.reviews;
  const isService = product.type === "service";
  const discount = isService ? 0 : discountPercent(product.originalPrice, product.price);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group">
      {/* Image area */}
      <Link href={`/san-pham/${product.id}`} className={`${product.bg} flex items-center justify-center h-40 relative overflow-hidden`}>
        {(product.images?.[0] ?? product.imageUrl) ? (
          <Image src={product.images?.[0] ?? product.imageUrl!} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        ) : (
          <span className="text-6xl">{product.icon}</span>
        )}
        {product.tag && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded ${product.tagColor}`}>
            {product.tag}
          </span>
        )}
        {!isService && discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/san-pham/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1 group-hover:text-green-700 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-gray-400 mb-2 truncate">{product.origin}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
          {isService ? (
            <span className="text-xs text-blue-500 ml-auto">{product.sold.toLocaleString()} lượt</span>
          ) : (
            <span className="text-xs text-gray-400 ml-auto">Đã bán: {product.sold.toLocaleString()}</span>
          )}
        </div>

        <div className="mt-auto">
          {isService ? (
            <>
              <p className="text-sm font-semibold text-blue-700 mb-2">Liên hệ để biết giá</p>
              <Link
                href={`/san-pham/${product.id}`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Xem chi tiết & liên hệ
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-base font-bold text-red-600">{formatPrice(product.price)}</span>
                {discount > 0 && (
                  <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                )}
                <span className="text-xs text-gray-500">/{product.unit}</span>
              </div>
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Thêm vào giỏ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
