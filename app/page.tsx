import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroBanner from "./components/HeroBanner";
import CategorySections from "./components/CategorySections";
import BusinessProductsSection from "./components/BusinessProductsSection";
import type { HomepageBusiness } from "./components/BusinessProductsSection";
import { categories } from "./lib/data";
import type { Product, ProductStatus } from "./lib/data";

export const revalidate = 60;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToProduct(row: any): Product {
  const images: string[] = (row.product_images ?? [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .map((img: { url: string }) => img.url);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    price: row.price,
    originalPrice: row.original_price,
    unit: row.unit,
    icon: row.icon,
    bg: row.bg,
    tag: row.tag ?? undefined,
    tagColor: row.tag_color ?? undefined,
    rating: row.rating,
    reviews: row.reviews,
    sold: row.sold,
    desc: row.description,
    specs: row.specs ?? [],
    origin: row.origin,
    certifications: row.certifications ?? [],
    imageUrl: images[0],
    images: images.length > 0 ? images : undefined,
    sellerId: row.seller_id ?? undefined,
    sellerName: row.seller_name ?? undefined,
    status: row.status as ProductStatus,
    submittedAt: row.submitted_at,
    rejectionReason: row.rejection_reason ?? undefined,
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: productsData } = await supabase
    .from("products")
    .select("*, product_images(id, url, position)")
    .eq("status", "approved")
    .order("sold", { ascending: false });

  const allProducts = (productsData ?? []).map(dbRowToProduct);
  const businessProducts = allProducts.filter((p) => !!p.sellerId && p.sellerName !== "Viện Nông Nghiệp Thanh Hóa");
  const sellerIds = [
    ...new Set(businessProducts.map((p) => p.sellerId).filter(Boolean)),
  ] as string[];

  const { data: profileData } = sellerIds.length > 0
    ? await supabase
        .from("business_profiles")
        .select("id, business_name, business_address, description, verified")
        .in("id", sellerIds)
    : { data: [] };

  const profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));

  const businesses: HomepageBusiness[] = sellerIds.map((sellerId) => {
    const bizProds = businessProducts.filter((p) => p.sellerId === sellerId);
    const bp = profileMap.get(sellerId);
    return {
      sellerId,
      sellerName:   bp?.business_name    ?? bizProds[0]?.sellerName ?? sellerId,
      verified:     bp?.verified         ?? false,
      address:      bp?.business_address ?? "",
      description:  bp?.description      ?? "",
      productCount: bizProds.length,
      totalSold:    bizProds.reduce((s, p) => s + p.sold, 0),
    };
  });

  return (
    <div>
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

      <BusinessProductsSection businesses={businesses} />

      <CategorySections products={allProducts} />

    </div>
  );
}
