import Link from "next/link";

export type HomepageBusiness = {
  sellerId: string;
  sellerName: string;
  verified: boolean;
  address: string;
  description: string;
  productCount: number;
  totalSold: number;
};

export default function BusinessProductsSection({ businesses }: { businesses: HomepageBusiness[] }) {
  if (businesses.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🏪 Doanh nghiệp đối tác
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {businesses.length} doanh nghiệp đang kinh doanh trên sàn
          </p>
        </div>
        <Link
          href="/san-pham"
          className="text-sm font-semibold text-green-700 hover:text-green-600 transition-colors hidden sm:block"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((biz) => (
          <div
            key={biz.sellerId}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-2xl border border-white/25 flex-shrink-0">
                🏪
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{biz.sellerName}</h3>
                  {biz.verified && (
                    <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-400 flex-shrink-0">
                      ✓ Xác minh
                    </span>
                  )}
                </div>
                {biz.address && (
                  <p className="text-green-200 text-xs mt-0.5 line-clamp-1">📍 {biz.address}</p>
                )}
              </div>
            </div>

            <div className="px-5 py-4 flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span>📦</span>
                  <strong className="text-gray-900">{biz.productCount}</strong> sản phẩm
                </span>
                {biz.totalSold > 0 && (
                  <span className="flex items-center gap-1">
                    <span>🛒</span>
                    <strong className="text-gray-900">{biz.totalSold.toLocaleString()}</strong> đã bán
                  </span>
                )}
              </div>

              {biz.description ? (
                <p className="text-sm text-gray-500 line-clamp-2 flex-1">{biz.description}</p>
              ) : (
                <div className="flex-1" />
              )}

              <Link
                href={`/doanh-nghiep/${biz.sellerId}`}
                className="mt-auto w-full text-center bg-green-700 hover:bg-green-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
              >
                Xem gian hàng →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
