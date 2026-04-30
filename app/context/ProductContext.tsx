"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Product, ProductStatus } from "@/app/lib/data";

const STORAGE_KEY = "seller_products";

type ProductContextValue = {
  sellerProducts: Product[];
  submitProduct: (data: Omit<Product, "id" | "rating" | "reviews" | "sold" | "status" | "submittedAt">) => void;
  updateStatus: (id: string, status: ProductStatus, rejectionReason?: string) => void;
  deleteProduct: (id: string) => void;
  getByStatus: (status: ProductStatus) => Product[];
  getBySeller: (sellerId: string) => Product[];
};

const ProductContext = createContext<ProductContextValue | null>(null);

// Seed some demo pending products from the mock business account
const DEMO_SELLER_PRODUCTS: Product[] = [
  {
    id: "sp-demo-1",
    name: "Rau muống hữu cơ Vĩnh Lộc",
    category: "rau",
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
    status: "pending",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sp-demo-2",
    name: "Dưa chuột VietGAP",
    category: "rau",
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

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSellerProducts(JSON.parse(saved));
      } else {
        // Seed demo data on first load
        setSellerProducts(DEMO_SELLER_PRODUCTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SELLER_PRODUCTS));
      }
    } catch {
      setSellerProducts(DEMO_SELLER_PRODUCTS);
    }
  }, []);

  function persist(products: Product[]) {
    setSellerProducts(products);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function submitProduct(data: Omit<Product, "id" | "rating" | "reviews" | "sold" | "status" | "submittedAt">) {
    const newProduct: Product = {
      ...data,
      id: "sp-" + Date.now(),
      rating: 0,
      reviews: 0,
      sold: 0,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    persist([...sellerProducts, newProduct]);
  }

  function updateStatus(id: string, status: ProductStatus, rejectionReason?: string) {
    persist(
      sellerProducts.map((p) =>
        p.id === id ? { ...p, status, rejectionReason: rejectionReason ?? p.rejectionReason } : p
      )
    );
  }

  function deleteProduct(id: string) {
    persist(sellerProducts.filter((p) => p.id !== id));
  }

  function getByStatus(status: ProductStatus) {
    return sellerProducts.filter((p) => p.status === status);
  }

  function getBySeller(sellerId: string) {
    return sellerProducts.filter((p) => p.sellerId === sellerId);
  }

  return (
    <ProductContext.Provider value={{ sellerProducts, submitProduct, updateStatus, deleteProduct, getByStatus, getBySeller }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
}
