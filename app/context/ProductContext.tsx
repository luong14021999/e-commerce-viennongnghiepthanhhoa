"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadProductImages } from "@/lib/storage";
import type { Product, ProductStatus } from "@/app/lib/data";

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
  submitProduct: (
    data: Omit<Product, "id" | "rating" | "reviews" | "sold" | "status" | "submittedAt">,
    status?: ProductStatus,
    imageFiles?: File[]
  ) => Promise<{ ok: boolean; error?: string }>;
  updateProduct: (
    id: string,
    data: Partial<Omit<Product, "id" | "status" | "submittedAt" | "rating" | "reviews" | "sold">>,
    newImageFiles?: File[],
    deletedImageUrls?: string[]
  ) => Promise<{ ok: boolean; error?: string }>;
  saveSellerProfile: (profile: SellerProfile) => void;
  getSellerProfile: (sellerId: string) => SellerProfile | undefined;
  updateStatus: (id: string, status: ProductStatus, rejectionReason?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getByStatus: (status: ProductStatus) => Product[];
  getBySeller: (sellerId: string) => Product[];
};

const ProductContext = createContext<ProductContextValue | null>(null);

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

function buildSellerProfiles(products: Product[]): Record<string, SellerProfile> {
  const profiles: Record<string, SellerProfile> = {};
  for (const p of products) {
    if (p.sellerId && !profiles[p.sellerId]) {
      profiles[p.sellerId] = {
        id: p.sellerId,
        name: p.sellerName ?? p.origin ?? "Nhà cung cấp",
        description: "",
        address: "",
        category: p.category,
        verified: p.sellerName === "Viện Nông Nghiệp Thanh Hóa",
      };
    }
  }
  return profiles;
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerProfiles, setSellerProfiles] = useState<Record<string, SellerProfile>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadProducts = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(id, url, position)")
      .order("submitted_at", { ascending: false });

    if (error || !data) return;

    const products = data.map(dbRowToProduct);
    setSellerProducts(products);
    setSellerProfiles(buildSellerProfiles(products));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadProducts();

    const supabase = createClient();
    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        loadProducts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadProducts]);

  async function submitProduct(
    data: Omit<Product, "id" | "rating" | "reviews" | "sold" | "status" | "submittedAt">,
    status: ProductStatus = "pending",
    imageFiles?: File[]
  ): Promise<{ ok: boolean; error?: string }> {
    const supabase = createClient();

    const { data: inserted, error } = await supabase
      .from("products")
      .insert({
        name: data.name,
        category: data.category,
        type: data.type ?? "product",
        price: data.price,
        original_price: data.originalPrice,
        unit: data.unit,
        icon: data.icon,
        bg: data.bg,
        tag: data.tag ?? null,
        tag_color: data.tagColor ?? null,
        description: data.desc,
        specs: data.specs,
        origin: data.origin,
        certifications: data.certifications,
        seller_id: data.sellerId ?? null,
        seller_name: data.sellerName ?? null,
        status,
      })
      .select("id")
      .single();

    if (error || !inserted) return { ok: false, error: error?.message ?? "Lỗi khi lưu sản phẩm" };

    const productId = inserted.id as string;

    // Upload image files if provided
    const uploadedUrls = imageFiles && imageFiles.length > 0
      ? await uploadProductImages(imageFiles, productId)
      : [];

    // Also include pre-existing image URLs (if any passed via data.images)
    const existingUrls = data.images ?? (data.imageUrl ? [data.imageUrl] : []);
    const allUrls = [...uploadedUrls, ...existingUrls.filter((u) => u.startsWith("http"))];

    if (allUrls.length > 0) {
      await supabase.from("product_images").insert(
        allUrls.map((url, position) => ({ product_id: productId, url, position }))
      );
    }

    await loadProducts();
    return { ok: true };
  }

  // No-op: seller profile is stored in profiles + business_profiles tables via registration
  function saveSellerProfile(_profile: SellerProfile) {}

  function getSellerProfile(sellerId: string): SellerProfile | undefined {
    return sellerProfiles[sellerId];
  }

  async function updateStatus(id: string, status: ProductStatus, rejectionReason?: string) {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ status, rejection_reason: rejectionReason ?? null })
      .eq("id", id);
    await loadProducts();
  }

  async function updateProduct(
    id: string,
    data: Partial<Omit<Product, "id" | "status" | "submittedAt" | "rating" | "reviews" | "sold">>,
    newImageFiles?: File[],
    deletedImageUrls?: string[]
  ): Promise<{ ok: boolean; error?: string }> {
    const supabase = createClient();
    const { error } = await supabase.from("products").update({
      name: data.name,
      category: data.category,
      type: data.type,
      price: data.price,
      original_price: data.originalPrice,
      unit: data.unit,
      icon: data.icon,
      bg: data.bg,
      tag: data.tag ?? null,
      tag_color: data.tagColor ?? null,
      description: data.desc,
      specs: data.specs,
      origin: data.origin,
      certifications: data.certifications,
    }).eq("id", id);

    if (error) return { ok: false, error: error.message };

    if (deletedImageUrls && deletedImageUrls.length > 0) {
      await supabase.from("product_images").delete().eq("product_id", id).in("url", deletedImageUrls);
    }

    if (newImageFiles && newImageFiles.length > 0) {
      const { data: existing } = await supabase
        .from("product_images").select("position").eq("product_id", id)
        .order("position", { ascending: false }).limit(1);
      const maxPosition = (existing?.[0]?.position ?? -1) as number;
      const uploadedUrls = await uploadProductImages(newImageFiles, id);
      if (uploadedUrls.length > 0) {
        await supabase.from("product_images").insert(
          uploadedUrls.map((url, i) => ({ product_id: id, url, position: maxPosition + 1 + i }))
        );
      }
    }

    await loadProducts();
    return { ok: true };
  }

  async function deleteProduct(id: string) {
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    setSellerProducts((prev) => prev.filter((p) => p.id !== id));
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
      submitProduct, updateProduct, saveSellerProfile, getSellerProfile,
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
