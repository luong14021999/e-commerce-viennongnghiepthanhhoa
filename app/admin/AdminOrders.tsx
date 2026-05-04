"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/app/lib/data";
import { removeAccents } from "@/app/lib/utils";

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

type AdminOrder = {
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

const STATUS: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  pending:    { label: "Chờ xác nhận", bg: "bg-amber-100",  color: "text-amber-700",  icon: "⏳" },
  processing: { label: "Đang xử lý",   bg: "bg-blue-100",   color: "text-blue-700",   icon: "🔄" },
  shipped:    { label: "Đang giao",     bg: "bg-purple-100", color: "text-purple-700", icon: "🚚" },
  delivered:  { label: "Đã giao",       bg: "bg-green-100",  color: "text-green-700",  icon: "✅" },
  cancelled:  { label: "Đã huỷ",        bg: "bg-red-100",    color: "text-red-700",    icon: "❌" },
};

const TRANSITIONS: Record<string, { next?: string; nextLabel?: string; canCancel?: boolean }> = {
  pending:    { next: "processing", nextLabel: "Xác nhận đơn",    canCancel: true },
  processing: { next: "shipped",    nextLabel: "Bắt đầu giao",    canCancel: true },
  shipped:    { next: "delivered",  nextLabel: "Xác nhận đã giao" },
  delivered:  {},
  cancelled:  {},
};

const FILTER_TABS = [
  { key: "all",        label: "Tất cả"       },
  { key: "pending",    label: "Chờ xác nhận" },
  { key: "processing", label: "Đang xử lý"   },
  { key: "shipped",    label: "Đang giao"    },
  { key: "delivered",  label: "Đã giao"      },
  { key: "cancelled",  label: "Đã huỷ"       },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filterTab, setFilterTab] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders((data as AdminOrder[]) ?? []);
    setFetching(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setUpdating(null);
  }

  const counts: Record<string, number> = { all: orders.length };
  for (const key of Object.keys(STATUS)) counts[key] = orders.filter((o) => o.status === key).length;

  const revenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.grand_total, 0);

  const filtered = orders.filter((o) => {
    if (filterTab !== "all" && o.status !== filterTab) return false;
    if (search.trim()) {
      const q = removeAccents(search);
      return (
        o.id.toLowerCase().includes(q) ||
        removeAccents(o.shipping_name).includes(q) ||
        o.shipping_phone.includes(q)
      );
    }
    return true;
  });

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tổng đơn hàng",    value: String(counts.all),          icon: "📦", cls: "bg-blue-50   border-blue-200   text-blue-700",   small: false },
          { label: "Chờ xác nhận",      value: String(counts.pending ?? 0), icon: "⏳", cls: "bg-amber-50  border-amber-200  text-amber-700",  small: false },
          { label: "Đang giao",          value: String(counts.shipped ?? 0), icon: "🚚", cls: "bg-purple-50 border-purple-200 text-purple-700", small: false },
          { label: "Doanh thu đã giao", value: formatPrice(revenue),        icon: "💰", cls: "bg-green-50  border-green-200  text-green-700",  small: true  },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.cls}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`font-bold mb-0.5 ${s.small ? "text-lg" : "text-3xl"}`}>{s.value}</div>
            <div className="text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên khách, SĐT, mã đơn..."
        className="w-full sm:max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white mb-4"
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_TABS.map(({ key, label }) => {
          const s = STATUS[key];
          const active = filterTab === key;
          return (
            <button
              key={key}
              onClick={() => setFilterTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                active
                  ? key === "all"
                    ? "bg-gray-800 text-white"
                    : `${s.bg} ${s.color} ring-2 ring-current ring-offset-1`
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s?.icon} {label}
              <span className="text-xs font-bold bg-black/10 px-1.5 py-0.5 rounded-full">
                {key === "all" ? counts.all : counts[key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const s = STATUS[order.status] ?? { label: order.status, bg: "bg-gray-100", color: "text-gray-700", icon: "?" };
            const tr = TRANSITIONS[order.status] ?? {};
            const isOpen = expanded === order.id;
            const isUpdating = updating === order.id;
            const date = new Date(order.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
            });
            const shortId = order.id.slice(0, 8).toUpperCase();

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 flex items-start gap-4 flex-wrap">
                  {/* Left: meta */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-gray-400 font-medium">Mã đơn:</span>
                      <span className="font-bold text-gray-900 text-sm font-mono tracking-widest bg-gray-100 px-2 py-0.5 rounded">DH{shortId}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{date}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      👤 {order.shipping_name} &nbsp;·&nbsp; 📞 {order.shipping_phone}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {order.shipping_address}</p>
                  </button>

                  {/* Right: total + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="font-bold text-green-700 text-lg leading-tight">{formatPrice(order.grand_total)}</p>
                    <p className="text-xs text-gray-400">
                      {order.order_items.length} sản phẩm · {order.payment_method === "cod" ? "COD" : order.payment_method}
                    </p>
                    <div className="flex gap-2">
                      {tr.next && (
                        <button
                          onClick={() => updateStatus(order.id, tr.next!)}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          {isUpdating
                            ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            : tr.nextLabel
                          }
                        </button>
                      )}
                      {tr.canCancel && (
                        <button
                          onClick={() => updateStatus(order.id, "cancelled")}
                          disabled={isUpdating}
                          className="bg-red-50 hover:bg-red-100 disabled:bg-gray-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                        >
                          Huỷ đơn
                        </button>
                      )}
                      <button
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                      >
                        {isOpen ? "Thu gọn ▲" : "Chi tiết ▼"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    {/* Items */}
                    <div className="divide-y divide-gray-50">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-green-50 flex items-center justify-center text-xl flex-shrink-0 relative">
                            {item.product_image_url
                              ? <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" sizes="48px" />
                              : <span>{item.product_icon ?? "🌾"}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.product_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatPrice(item.product_price)}/{item.product_unit} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-gray-800 text-sm flex-shrink-0">{formatPrice(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Tạm tính</span><span>{formatPrice(order.total_price)}</span>
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
                      <p>👤 {order.shipping_name} · 📞 {order.shipping_phone}</p>
                      <p>📍 {order.shipping_address}</p>
                      {order.note && (
                        <p className="text-gray-400 italic">Ghi chú: {order.note}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
