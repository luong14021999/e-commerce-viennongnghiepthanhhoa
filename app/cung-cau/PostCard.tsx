import Link from "next/link";
import { MarketPost, POST_CATEGORIES, formatQuantity, formatPostPrice, timeAgo } from "./types";

export default function PostCard({ post }: { post: MarketPost }) {
  const cat = POST_CATEGORIES.find((c) => c.id === post.category);
  const isCung = post.type === "cung";

  return (
    <Link
      href={`/cung-cau/${post.id}`}
      className="block bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isCung
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {isCung ? "🟢 CẦN BÁN" : "🔵 CẦN MUA"}
            </span>
            {cat && (
              <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                <span>{cat.icon}</span>
                {cat.label}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
            {timeAgo(post.createdAt)}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2 mb-2">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {post.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <div className="text-gray-400 text-[10px] uppercase font-semibold mb-0.5">
              Số lượng
            </div>
            <div className="font-semibold text-gray-800">
              {formatQuantity(post.quantityValue, post.quantityUnit)}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg px-3 py-2">
            <div className="text-amber-600 text-[10px] uppercase font-semibold mb-0.5">
              Giá
            </div>
            <div className="font-bold text-amber-700">
              {formatPostPrice(post.priceValue, post.priceUnit, post.priceNegotiable)}
            </div>
          </div>
        </div>

        {post.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
            <span>📍</span>
            <span className="truncate">{post.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
