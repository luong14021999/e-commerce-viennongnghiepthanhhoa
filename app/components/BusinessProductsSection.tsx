import Link from "next/link";

export type HomepageBusiness = {
  sellerId: string;
  sellerName: string;
  verified: boolean;
  address: string;
  description: string;
  accountType?: string;
  productCount: number;
  totalSold: number;
  avgRating: number;
  reviewCount: number;
};

const TYPE_META: Record<string, { icon: string; color: string }> = {
  "Người bán hàng":  { icon: "🏪", color: "bg-blue-100 text-blue-700" },
  "Doanh nghiệp":    { icon: "🏢", color: "bg-indigo-100 text-indigo-700" },
  "Hợp tác xã":      { icon: "🤝", color: "bg-purple-100 text-purple-700" },
  "Nông hộ":         { icon: "🌾", color: "bg-green-100 text-green-700" },
  "Đơn vị liên kết": { icon: "🔗", color: "bg-orange-100 text-orange-700" },
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((s) => {
          const filled = rating >= s;
          const half = !filled && rating >= s - 0.5;
          return (
            <span key={s} className={`text-sm ${filled || half ? "text-amber-400" : "text-gray-200"}`}>
              {filled ? "★" : half ? "★" : "★"}
            </span>
          );
        })}
      </div>
      <span className="text-sm font-bold text-amber-600">{rating > 0 ? rating.toFixed(1) : "—"}</span>
      {count > 0 && <span className="text-xs text-gray-400">({count} đánh giá)</span>}
    </div>
  );
}

export default function BusinessProductsSection({ businesses }: { businesses: HomepageBusiness[] }) {
  if (businesses.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              🏬 Danh sách gian hàng đang hoạt động
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {businesses.length} gian hàng đang hoạt động trên sàn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz) => {
            const meta = biz.accountType ? (TYPE_META[biz.accountType] ?? { icon: "🏪", color: "bg-gray-100 text-gray-600" }) : { icon: "🏪", color: "bg-gray-100 text-gray-600" };
            return (
              <div
                key={biz.sellerId}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-300 transition-all flex flex-col"
              >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                  <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 flex-1 min-w-0">{biz.sellerName}</h3>
                      {biz.verified && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                          ✓ Xác minh
                        </span>
                      )}
                    </div>
                    {biz.accountType && (
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${meta.color}`}>
                        {biz.accountType}
                      </span>
                    )}
                    {biz.address && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {biz.address}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="px-5 pb-4 flex flex-col gap-2.5 flex-1">
                  <StarRating rating={biz.avgRating} count={biz.reviewCount} />
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>📦</span>
                      <strong className="text-gray-800">{biz.productCount}</strong> sản phẩm
                    </span>
                    {biz.totalSold > 0 && (
                      <span className="flex items-center gap-1">
                        <span>🛒</span>
                        <strong className="text-gray-800">{biz.totalSold.toLocaleString()}</strong> đã bán
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <Link
                    href={`/doanh-nghiep/${biz.sellerId}`}
                    className="block w-full text-center bg-green-700 hover:bg-green-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    Xem gian hàng →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
