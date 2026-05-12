export type ProductStatus = 'approved' | 'pending' | 'rejected';

export type Product = {
  id: string;
  name: string;
  category: string;
  type?: 'product' | 'service';
  price: number;
  originalPrice: number;
  unit: string;
  icon: string;
  bg: string;
  tag?: string;
  tagColor?: string;
  rating: number;
  reviews: number;
  sold: number;
  desc: string;
  specs: string[];
  origin: string;
  certifications: string[];
  imageUrl?: string;
  images?: string[];
  sellerId?: string;
  sellerName?: string;
  status?: ProductStatus;
  submittedAt?: string;
  rejectionReason?: string;
};

export type CategoryType = 'all' | 'service' | 'product';

export type Category = {
  id: string;
  label: string;
  icon: string;
  type: CategoryType;
};

export { SITE_CATEGORIES as categories } from "./categories";

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export function discountPercent(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}
