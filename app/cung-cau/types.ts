export type MarketPostType = "cung" | "cau";
export type MarketPostStatus = "active" | "closed" | "expired";

export type MarketPost = {
  id: string;
  userId: string;
  type: MarketPostType;
  category: string;
  title: string;
  description: string;
  quantityValue: number | null;
  quantityUnit: string | null;
  priceValue: number | null;
  priceUnit: string | null;
  priceNegotiable: boolean;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  validUntil: string | null;
  status: MarketPostStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbRowToMarketPost(row: any): MarketPost {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    category: row.category,
    title: row.title,
    description: row.description ?? "",
    quantityValue: row.quantity_value,
    quantityUnit: row.quantity_unit,
    priceValue: row.price_value,
    priceUnit: row.price_unit,
    priceNegotiable: row.price_negotiable ?? false,
    location: row.location ?? "",
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    validUntil: row.valid_until,
    status: row.status,
    views: row.views ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const POST_CATEGORIES = [
  { id: "lua-gao",           label: "Lúa / Gạo",                 icon: "🌾" },
  { id: "rau-cu-qua",        label: "Rau – Củ – Quả",            icon: "🥬" },
  { id: "trai-cay",          label: "Trái cây",                  icon: "🍎" },
  { id: "thuy-san",          label: "Thủy sản",                  icon: "🦐" },
  { id: "gia-suc-gia-cam",   label: "Gia súc – Gia cầm",         icon: "🐄" },
  { id: "thit-trung-sua",    label: "Thịt – Trứng – Sữa",        icon: "🥩" },
  { id: "che-bien",          label: "Nông sản chế biến",         icon: "🏭" },
  { id: "giong-cay-con",     label: "Giống cây – Giống con",     icon: "🌱" },
  { id: "vat-tu-phan-bon",   label: "Vật tư – Phân bón",         icon: "🧪" },
  { id: "may-moc-thiet-bi",  label: "Máy móc – Thiết bị",        icon: "⚙️" },
  { id: "hop-tac-san-xuat",  label: "Hợp tác sản xuất",          icon: "🤝" },
  { id: "khac",              label: "Khác",                      icon: "📦" },
];

export function formatQuantity(value: number | null, unit: string | null): string {
  if (value == null) return "Thỏa thuận";
  return `${value.toLocaleString("vi-VN")} ${unit ?? ""}`.trim();
}

export function formatPostPrice(
  value: number | null,
  unit: string | null,
  negotiable: boolean,
): string {
  if (negotiable || value == null) return "Thỏa thuận";
  return `${value.toLocaleString("vi-VN")}đ${unit ? `/${unit}` : ""}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}
