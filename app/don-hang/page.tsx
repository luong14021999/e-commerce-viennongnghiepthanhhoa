"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/app/lib/data";

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  product_unit: string;
  product_icon: string | null;
  product_image_url: string | null;
  quantity: number;
  subtotal: number;
};

type Order = {
  id: string;
  status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  note: string | null;
  total_price: number;
  shipping_fee: number;
  grand_total: number;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  pending:    { label: "Chờ xác nhận", bg: "bg-amber-100",  color: "text-amber-700"  },
  processing: { label: "Đang xử lý",   bg: "bg-blue-100",   color: "text-blue-700"   },
  shipped:    { label: "Đang giao",     bg: "bg-purple-100", color: "text-purple-700" },
  delivered:  { label: "Đã giao",       bg: "bg-green-100",  color: "text-green-700"  },
  cancelled:  { label: "Đã huỷ",        bg: "bg-red-100",    color: "text-red-700"    },
};

export default function MyOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/dang-nhap?redirect=/don-hang");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setFetching(false);
      });
  }, [user]);

  if (isLoading || !user) return null;

  const st = (status: string) => STATUS[status] ?? { label: status, bg: "bg-gray-100", color: "text-gray-700" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="text-xs text-green-300 mb-2 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>›</span>
            <span className="text-white">Đơn hàng của tôi</span>
          </nav>
          <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
          <p className="text-green-300 text-sm mt-0.5">Xin chào, <span className="text-white font-semibold">{user.name}</span></p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetching ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 text-sm mb-6">Hãy khám phá sản phẩm và đặt hàng ngay!</p>
            <Link href="/san-pham"
              className="inline-block bg-green-700 text-white font-bold px-6 py-2.5 rounded-full hover:bg-green-600 transition-colors text-sm">
              Mua sắm ngay →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = st(order.status);
              const isOpen = expanded === order.id;
              const date = new Date(order.created_at).toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
              });
              const shortId = order.id.slice(0, 8).toUpperCase();

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Order header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">#{shortId}</span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{date} &nbsp;•&nbsp; {order.order_items.length} sản phẩm</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-green-700 text-base">{formatPrice(order.grand_total)}</p>
                          <p className="text-xs text-gray-400">
                            {order.payment_method === "cod" ? "Thanh toán khi nhận hàng" : order.payment_method}
                          </p>
                        </div>
                        <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-gray-100">
                      {/* Items */}
                      <div className="divide-y divide-gray-50">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-green-50 flex items-center justify-center text-xl flex-shrink-0">
                              {item.product_image_url
                                ? <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover"/>
                                : <span>{item.product_icon ?? "🌾"}</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.product_name}</p>
                              <p className="text-xs text-gray-500">{formatPrice(item.product_price)}/{item.product_unit} &nbsp;×&nbsp; {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-800 text-sm flex-shrink-0">{formatPrice(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Order summary */}
                      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Tạm tính</span>
                          <span>{formatPrice(order.total_price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Phí giao hàng</span>
                          <span>{order.shipping_fee === 0 ? "Miễn phí" : formatPrice(order.shipping_fee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                          <span>Tổng cộng</span>
                          <span className="text-green-700">{formatPrice(order.grand_total)}</span>
                        </div>
                      </div>

                      {/* Shipping info */}
                      <div className="px-5 py-4 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                        <p className="font-semibold text-gray-800 mb-1">Thông tin giao hàng</p>
                        <p>👤 {order.shipping_name} &nbsp;•&nbsp; 📞 {order.shipping_phone}</p>
                        <p>📍 {order.shipping_address}</p>
                        {order.note && <p className="text-gray-400 italic">Ghi chú: {order.note}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
