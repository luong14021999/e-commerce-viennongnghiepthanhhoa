"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Product, ProductStatus } from "@/app/lib/data";

const STORAGE_KEY = "seller_products";
const PROFILES_KEY = "seller_profiles";

export type SellerProfile = {
  id: string;
  name: string;
  description: string;
  address: string;
  category: string;
  verified: boolean;
  phone?: string;
  email?: string;
};

type ProductContextValue = {
  sellerProducts: Product[];
  sellerProfiles: Record<string, SellerProfile>;
  isLoaded: boolean;
  submitProduct: (data: Omit<Product, "id" | "rating" | "reviews" | "sold" | "status" | "submittedAt">, status?: ProductStatus) => void;
  saveSellerProfile: (profile: SellerProfile) => void;
  getSellerProfile: (sellerId: string) => SellerProfile | undefined;
  updateStatus: (id: string, status: ProductStatus, rejectionReason?: string) => void;
  deleteProduct: (id: string) => void;
  getByStatus: (status: ProductStatus) => Product[];
  getBySeller: (sellerId: string) => Product[];
};

const ProductContext = createContext<ProductContextValue | null>(null);

const DEMO_SELLER_PRODUCTS: Product[] = [
  {
    id: "sp-demo-1",
    name: "Rau muống hữu cơ Vĩnh Lộc",
    category: "san-pham-vien",
    price: 12000,
    originalPrice: 15000,
    unit: "kg",
    icon: "🥬",
    bg: "bg-green-50",
    tag: "Hữu cơ",
    tagColor: "bg-green-600 text-white",
    rating: 0,
    reviews: 0,
    sold: 0,
    desc: "Rau muống trồng theo phương pháp hữu cơ hoàn toàn, không hóa chất, tưới nước giếng khoan sạch.",
    specs: ["Không thuốc trừ sâu", "Không phân bón hóa học", "Thu hoạch hàng ngày", "Giao hàng nội tỉnh"],
    origin: "HTX Nông Sản Xanh Thanh Hóa",
    certifications: ["Hữu cơ VN"],
    sellerId: "biz-1",
    sellerName: "HTX Nông Sản Xanh Thanh Hóa",
    status: "approved",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sp-demo-2",
    name: "Dưa chuột VietGAP",
    category: "san-pham-vien",
    price: 18000,
    originalPrice: 22000,
    unit: "kg",
    icon: "🥒",
    bg: "bg-lime-50",
    tag: "VietGAP",
    tagColor: "bg-lime-600 text-white",
    rating: 0,
    reviews: 0,
    sold: 0,
    desc: "Dưa chuột trồng theo tiêu chuẩn VietGAP, thu hoạch đúng độ, quả xanh bóng, giòn ngọt.",
    specs: ["Chứng nhận VietGAP", "Không dư lượng thuốc", "Quả đều, đẹp", "Giao trong ngày"],
    origin: "HTX Nông Sản Xanh Thanh Hóa",
    certifications: ["VietGAP"],
    sellerId: "biz-1",
    sellerName: "HTX Nông Sản Xanh Thanh Hóa",
    status: "approved",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEMO_SELLER_PROFILES: Record<string, SellerProfile> = {
  "biz-1": {
    id: "biz-1",
    name: "HTX Nông Sản Xanh Thanh Hóa",
    description: "Chuyên cung cấp rau sạch VietGAP và các sản phẩm nông sản hữu cơ từ vùng Vĩnh Lộc. Cam kết sản xuất theo quy trình khép kín, không hóa chất, an toàn cho sức khỏe người tiêu dùng.",
    address: "Xã Vĩnh Tân, Vĩnh Lộc, Thanh Hóa",
    category: "san-pham-vien",
    verified: true,
  },
};

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerProfiles, setSellerProfiles] = useState<Record<string, SellerProfile>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY);
      setSellerProducts(savedProducts ? JSON.parse(savedProducts) : DEMO_SELLER_PRODUCTS);
      if (!savedProducts) localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SELLER_PRODUCTS));

      const savedProfiles = localStorage.getItem(PROFILES_KEY);
      setSellerProfiles(savedProfiles ? JSON.parse(savedProfiles) : DEMO_SELLER_PROFILES);
      if (!savedProfiles) localStorage.setItem(PROFILES_KEY, JSON.stringify(DEMO_SELLER_PROFILES));
    } catch {
      setSellerProducts(DEMO_SELLER_PRODUCTS);
      setSellerProfiles(DEMO_SELLER_PROFILES);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  function persistProducts(products: Product[]) {
    setSellerProducts(products);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function persistProfiles(profiles: Record<string, SellerProfile>) {
    setSellerProfiles(profiles);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  function submitProduct(
    data: Omit<Product, "id" | "rating" | "reviews" | "sold" | "status" | "submittedAt">,
    status: ProductStatus = "pending"
  ) {
    const newProduct: Product = {
      ...data,
      id: "sp-" + Date.now(),
      rating: 0,
      reviews: 0,
      sold: 0,
      status,
      submittedAt: new Date().toISOString(),
    };
    persistProducts([...sellerProducts, newProduct]);
  }

  function saveSellerProfile(profile: SellerProfile) {
    persistProfiles({ ...sellerProfiles, [profile.id]: profile });
  }

  function getSellerProfile(sellerId: string): SellerProfile | undefined {
    return sellerProfiles[sellerId];
  }

  function updateStatus(id: string, status: ProductStatus, rejectionReason?: string) {
    persistProducts(
      sellerProducts.map((p) =>
        p.id === id ? { ...p, status, rejectionReason: rejectionReason ?? p.rejectionReason } : p
      )
    );
  }

  function deleteProduct(id: string) {
    persistProducts(sellerProducts.filter((p) => p.id !== id));
  }

  function getByStatus(status: ProductStatus) {
    return sellerProducts.filter((p) => p.status === status);
  }

  function getBySeller(sellerId: string) {
    return sellerProducts.filter((p) => p.sellerId === sellerId);
  }

  return (
    <ProductContext.Provider value={{
      sellerProducts, sellerProfiles, isLoaded,
      submitProduct, saveSellerProfile, getSellerProfile,
      updateStatus, deleteProduct, getByStatus, getBySeller,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
}
