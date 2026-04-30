import type { Metadata } from "next";
import Link from "next/link";
import HeroBanner from "./components/HeroBanner";
import ProductCard from "./components/ProductCard";
import BusinessProductsSection from "./components/BusinessProductsSection";
import { products, categories } from "./lib/data";

export const metadata: Metadata = {
  title: "Trang chủ",
};

const trustBadges = [
  { icon: "✅", title: "Hàng chính hãng", desc: "100% nguồn gốc rõ ràng" },
  { icon: "🚚", title: "Giao hàng toàn tỉnh", desc: "Nội thành 2–4 giờ" },
  { icon: "🔄", title: "Đổi trả 7 ngày", desc: "Miễn phí nếu lỗi sản xuất" },
  { icon: "📞", title: "Hỗ trợ 24/7", desc: "Kỹ sư tư vấn tận tâm" },
];

const serviceCategories = categories.filter((c) => c.type === "service");
const productCategories = categories.filter((c) => c.type === "product");

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

      {/* Category quick-nav */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Dịch vụ</h2>
          <Link href="/san-pham?category=tu-van" className="text-sm text-blue-700 font-medium hover:text-blue-600">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {serviceCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/san-pham?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-medium text-blue-800 text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Sản phẩm</h2>
          <Link href="/san-pham" className="text-sm text-green-700 font-medium hover:text-green-600">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {productCategories.map((cat) => (
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

      {/* One section per product category */}
      {productCategories.map((cat, idx) => {
        const items = products.filter((p) => p.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className={idx % 2 === 0 ? "bg-white py-8" : "bg-gray-50 py-8"}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="text-lg font-bold text-gray-900">{cat.label}</h2>
                </div>
                <Link href={`/san-pham?category=${cat.id}`} className="text-sm text-green-700 font-medium hover:text-green-600">
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* One section per service category */}
      {serviceCategories.map((cat, idx) => {
        const items = products.filter((p) => p.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className={idx % 2 === 0 ? "bg-blue-50 border-y border-blue-100 py-8" : "bg-white py-8"}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="text-lg font-bold text-blue-900">{cat.label}</h2>
                </div>
                <Link href={`/san-pham?category=${cat.id}`} className="text-sm text-blue-700 font-medium hover:text-blue-600">
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Business partner products */}
      <BusinessProductsSection />

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
