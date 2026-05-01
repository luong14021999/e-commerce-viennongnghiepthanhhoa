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

export const categories: Category[] = [
  { id: 'tat-ca', label: 'Tất cả', icon: '🛒', type: 'all' },
  { id: 'tu-van', label: 'Tư vấn nông nghiệp', icon: '📋', type: 'service' },
  { id: 'phan-tich', label: 'Phân tích – kiểm nghiệm', icon: '🔬', type: 'service' },
  { id: 'dao-tao', label: 'Đào tạo – chuyển giao công nghệ', icon: '🎓', type: 'service' },
  { id: 'giong-cay-trong', label: 'Giống cây trồng', icon: '🌾', type: 'product' },
  { id: 'giong-vat-nuoi', label: 'Giống vật nuôi – thủy sản', icon: '🐄', type: 'product' },
  { id: 'san-pham-vien', label: 'Sản phẩm Viện Nông Nghiệp', icon: '🌿', type: 'product' },
  { id: 'vat-tu', label: 'Vật tư – chế phẩm', icon: '🧪', type: 'product' },
];

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export function discountPercent(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}
