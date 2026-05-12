import type { Category } from "./data";

export const SITE_CATEGORIES: Category[] = [
  { id: "tat-ca",           label: "Tất cả",                              icon: "🛒", type: "all" },
  { id: "ocop",             label: "Sản phẩm OCOP",                       icon: "🏅", type: "product" },
  { id: "giong-cay-trong",  label: "Giống cây trồng",                     icon: "🌾", type: "product" },
  { id: "giong-vat-nuoi",   label: "Giống vật nuôi – thủy sản",           icon: "🐄", type: "product" },
  { id: "nong-san-tuoi",    label: "Nông sản tươi",                       icon: "🥦", type: "product" },
  { id: "san-pham-chan-nuoi", label: "Sản phẩm chăn nuôi – thủy sản",    icon: "🥩", type: "product" },
  { id: "san-pham-vien",    label: "Sản phẩm Viện Nông Nghiệp",           icon: "🌿", type: "product" },
  { id: "vat-tu-che-pham",  label: "Vật tư – chế phẩm nông nghiệp",      icon: "🧪", type: "product" },
  { id: "may-moc-thiet-bi", label: "Máy móc – thiết bị nông nghiệp",     icon: "⚙️", type: "product" },
  { id: "lam-nghiep",       label: "Lâm nghiệp – cây công trình",         icon: "🌲", type: "product" },
  { id: "nong-nghiep-huu-co", label: "Nông nghiệp hữu cơ – tuần hoàn",  icon: "♻️", type: "product" },
  { id: "bao-bi-bao-quan",  label: "Bao bì – bảo quản – logistics",       icon: "📦", type: "product" },
  { id: "nong-san-che-bien", label: "Nông sản chế biến",                  icon: "🏭", type: "product" },
  { id: "de-tai-nghien-cuu", label: "Đề tài nghiên cứu",                  icon: "🔬", type: "service" },
  { id: "dich-vu-chuyen-giao", label: "Dịch vụ – chuyển giao kỹ thuật", icon: "📋", type: "service" },
  { id: "cong-nghe-so",     label: "Công nghệ số nông nghiệp",            icon: "💻", type: "service" },
];

export const BUSINESS_CATEGORIES = SITE_CATEGORIES
  .filter((c) => c.type !== "all")
  .map((c) => ({ id: c.id, label: c.label }));
