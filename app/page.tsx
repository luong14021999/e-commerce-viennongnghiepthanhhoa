import type { Metadata } from "next";
import Link from "next/link";
import HeroBanner from "./components/HeroBanner";
import ProductCard from "./components/ProductCard";
import { products, categories, discountPercent } from "./lib/data";

export const metadata: Metadata = {
  title: "Trang chủ",
};

const featuredProducts = products.filter((p) => p.sold > 800).slice(0, 8);
const newProducts = products.slice(-4);
const hotDeals = products.filter((p) => discountPercent(p.originalPrice, p.price) >= 13);

const trustBadges = [
  { icon: "✅", title: "Hàng chính hãng", desc: "100% nguồn gốc rõ ràng" },
  { icon: "🚚", title: "Giao hàng toàn tỉnh", desc: "Nội thành 2–4 giờ" },
  { icon: "🔄", title: "Đổi trả 7 ngày", desc: "Miễn phí nếu lỗi sản xuất" },
  { icon: "📞", title: "Hỗ trợ 24/7", desc: "Kỹ sư tư vấn tận tâm" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero banner */}
      <HeroBanner />

      {/* Trust badges */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((b) => (
              <div key={b.title} className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{b.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{b.title}</div>
                  <div className="text-xs text-gray-500">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Danh mục sản phẩm</h2>
          <Link href="/san-pham" className="text-sm text-green-700 font-medium hover:text-green-600">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.filter((c) => c.id !== "tat-ca").map((cat) => (
            <Link
              key={cat.id}
              href={`/san-pham?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-sm transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot deals */}
      {hotDeals.length > 0 && (
        <section className="bg-red-50 border-y border-red-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-lg font-bold text-red-700">Ưu đãi hôm nay</h2>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                  HOT
                </span>
              </div>
              <Link href="/san-pham" className="text-sm text-red-700 font-medium hover:text-red-600">
                Xem thêm →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotDeals.slice(0, 4).map((p) => (
                <div key={p.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                    -{discountPercent(p.originalPrice, p.price)}%
                  </div>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h2 className="text-lg font-bold text-gray-900">Sản phẩm bán chạy</h2>
          </div>
          <Link href="/san-pham" className="text-sm text-green-700 font-medium hover:text-green-600">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Banner strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white flex items-center gap-4">
            <span className="text-5xl">🌾</span>
            <div>
              <div className="font-bold text-lg">Giống xác nhận cấp quốc gia</div>
              <div className="text-green-200 text-sm mb-3">Độ nảy mầm ≥ 85%, năng suất vượt trội</div>
              <Link href="/san-pham?category=giong" className="bg-white text-green-700 font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-green-50 transition-colors inline-block">
                Chọn giống ngay
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl p-6 text-white flex items-center gap-4">
            <span className="text-5xl">🍊</span>
            <div>
              <div className="font-bold text-lg">Đặc sản Thanh Hóa</div>
              <div className="text-amber-100 text-sm mb-3">Cam, mật ong, gạo ST25 – từ vườn đến bàn ăn</div>
              <Link href="/san-pham?category=thucpham" className="bg-white text-amber-700 font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-amber-50 transition-colors inline-block">
                Khám phá ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🆕</span>
            <h2 className="text-lg font-bold text-gray-900">Sản phẩm mới</h2>
          </div>
          <Link href="/san-pham" className="text-sm text-green-700 font-medium hover:text-green-600">
            Xem thêm →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {newProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-green-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "30+", label: "Năm kinh nghiệm" },
              { value: "200+", label: "Sản phẩm" },
              { value: "50.000+", label: "Nông dân tin dùng" },
              { value: "11/11", label: "Huyện phủ sóng" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-green-300 mb-1">{s.value}</div>
                <div className="text-green-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
