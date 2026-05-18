import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroBanner from "./components/HeroBanner";
import CategorySections from "./components/CategorySections";
import ProductCard from "./components/ProductCard";
import BusinessProductsSection from "./components/BusinessProductsSection";
import RecentlyViewedStores from "./components/RecentlyViewedStores";
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

  // Fetch real review data for all products (used for featured sort + business ratings)
  const allProductIds = allProducts.map((p) => p.id);
  const { data: reviewsData } = allProductIds.length > 0
    ? await supabase.from("reviews").select("product_id, rating").in("product_id", allProductIds)
    : { data: [] };

  const reviewsMap = new Map<string, { sum: number; count: number }>();
  for (const row of (reviewsData ?? [])) {
    const cur = reviewsMap.get(row.product_id) ?? { sum: 0, count: 0 };
    cur.sum += row.rating;
    cur.count += 1;
    reviewsMap.set(row.product_id, cur);
  }

  const featuredProducts = [...allProducts]
    .sort((a, b) => {
      const ra = reviewsMap.get(a.id);
      const rb = reviewsMap.get(b.id);
      const avgA = ra && ra.count > 0 ? ra.sum / ra.count : 0;
      const avgB = rb && rb.count > 0 ? rb.sum / rb.count : 0;
      if (avgB !== avgA) return avgB - avgA;
      return b.sold - a.sold;
    })
    .slice(0, 8);

  const businesses: HomepageBusiness[] = sellerIds.map((sellerId) => {
    const bizProds = businessProducts.filter((p) => p.sellerId === sellerId);
    const bp = profileMap.get(sellerId);
    const desc = bp?.description ?? "";
    const accountTypeMatch = desc.match(/^\[([^\]]+)\]/);
    const accountType = accountTypeMatch ? accountTypeMatch[1] : undefined;
    const totalReviews = bizProds.reduce((s, p) => s + (reviewsMap.get(p.id)?.count ?? 0), 0);
    const avgRating = totalReviews > 0
      ? bizProds.reduce((s, p) => s + (reviewsMap.get(p.id)?.sum ?? 0), 0) / totalReviews
      : 0;
    return {
      sellerId,
      sellerName:   bp?.business_name    ?? bizProds[0]?.sellerName ?? sellerId,
      verified:     bp?.verified         ?? false,
      address:      bp?.business_address ?? "",
      description:  desc.replace(/^\[[^\]]+\]\s*/, ""),
      accountType,
      productCount: bizProds.length,
      totalSold:    bizProds.reduce((s, p) => s + p.sold, 0),
      avgRating:    Math.round(avgRating * 10) / 10,
      reviewCount:  totalReviews,
    };
  }).sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return b.avgRating - a.avgRating;
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

      {/* Shopee-style category grid */}
      <section className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">Danh mục</h2>
            <Link href="/san-pham" className="text-sm text-green-700 font-semibold hover:text-green-600">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1">
            {productCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/san-pham?category=${cat.id}`}
                className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-green-50 transition-colors group text-center"
              >
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold text-gray-800 leading-tight line-clamp-2">{cat.label}</span>
              </Link>
            ))}
            {serviceCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/san-pham?category=${cat.id}`}
                className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-blue-50 transition-colors group text-center"
              >
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold text-blue-700 leading-tight line-clamp-2">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products — visible immediately */}
      {allProducts.length > 0 && (
        <section className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span>🔥</span> Sản phẩm nổi bật
              </h2>
              <Link href="/san-pham" className="text-sm text-green-700 font-semibold hover:text-green-600">Xem tất cả →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <BusinessProductsSection businesses={businesses} />

      <RecentlyViewedStores />

<CategorySections products={allProducts} />

    </div>
  );
}
