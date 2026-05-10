"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_NAMES: Record<string, string> = {
  "/san-pham": "Sản phẩm",
  "/gio-hang": "Giỏ hàng",
  "/thanh-toan": "Thanh toán",
  "/don-hang": "Đơn hàng",
  "/tai-khoan": "Tài khoản",
  "/dang-nhap": "Đăng nhập",
  "/dang-ky": "Đăng ký",
  "/dashboard": "Dashboard",
  "/admin": "Quản trị",
};

export default function HomeBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segment = "/" + pathname.split("/")[1];
  const pageName = PAGE_NAMES[segment] ?? "Trang này";

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-green-700 font-semibold hover:text-green-600 active:opacity-70 min-h-[36px] px-2 -mx-2 rounded-lg"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
          </svg>
          Trang chủ
        </Link>
        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-500 truncate">{pageName}</span>
      </div>
    </div>
  );
}
