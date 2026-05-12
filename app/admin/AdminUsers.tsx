"use client";

import { useEffect, useState, useMemo } from "react";
import { listUsersAction, setUserVerifiedAction, setUserBannedAction, type AdminUserRecord } from "@/lib/actions";
import { SITE_CATEGORIES } from "@/app/lib/categories";

const TYPE_LABELS: Record<string, { icon: string; color: string }> = {
  "Người mua hàng":  { icon: "🛒", color: "bg-gray-100 text-gray-700"   },
  "Người bán hàng":  { icon: "🏪", color: "bg-blue-100 text-blue-700"   },
  "Doanh nghiệp":    { icon: "🏢", color: "bg-indigo-100 text-indigo-700" },
  "Hợp tác xã":      { icon: "🤝", color: "bg-purple-100 text-purple-700" },
  "Nông hộ":         { icon: "🌾", color: "bg-green-100 text-green-700"  },
  "Đơn vị liên kết": { icon: "🔗", color: "bg-orange-100 text-orange-700" },
};

const FILTER_OPTIONS = [
  { value: "all",    label: "Tất cả" },
  { value: "buyer",  label: "🛒 Người mua" },
  { value: "seller", label: "🏪 Người bán" },
  { value: "Doanh nghiệp",    label: "🏢 Doanh nghiệp" },
  { value: "Hợp tác xã",      label: "🤝 Hợp tác xã" },
  { value: "Nông hộ",         label: "🌾 Nông hộ" },
  { value: "Đơn vị liên kết", label: "🔗 Đơn vị liên kết" },
];

function categoryLabel(id?: string) {
  if (!id) return "—";
  return SITE_CATEGORIES.find(c => c.id === id)?.label ?? id;
}

function accountTypeLabel(u: AdminUserRecord): string {
  if (u.role === "buyer") return "Người mua hàng";
  return u.accountType ?? "Doanh nghiệp";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<AdminUserRecord | null>(null);
  const [acting, setActing] = useState(false);

  async function load() {
    setLoading(true);
    const res = await listUsersAction();
    if (res.ok && res.data) setUsers(res.data);
    else setError(res.error ?? "Không thể tải danh sách");
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (filter !== "all") {
      if (filter === "buyer") list = list.filter(u => u.role === "buyer");
      else if (filter === "seller") list = list.filter(u => u.role === "business" && !u.accountType);
      else list = list.filter(u => accountTypeLabel(u) === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.businessName ?? "").toLowerCase().includes(q) ||
        (u.businessAddress ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, filter, search]);

  const counts = {
    all:     users.length,
    buyers:  users.filter(u => u.role === "buyer").length,
    sellers: users.filter(u => u.role === "business").length,
    banned:  users.filter(u => u.banned).length,
    pending: users.filter(u => u.role === "business" && u.verified === false).length,
  };

  async function handleVerify(u: AdminUserRecord, verified: boolean) {
    setActing(true);
    await setUserVerifiedAction(u.id, verified);
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, verified } : x));
    if (selected?.id === u.id) setSelected(prev => prev ? { ...prev, verified } : prev);
    setActing(false);
  }

  async function handleBan(u: AdminUserRecord, ban: boolean) {
    setActing(true);
    await setUserBannedAction(u.id, ban);
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, banned: ban } : x));
    if (selected?.id === u.id) setSelected(prev => prev ? { ...prev, banned: ban } : prev);
    setActing(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <svg className="animate-spin w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <p className="text-red-600 font-semibold">{error}</p>
      <button onClick={load} className="mt-4 text-sm text-red-700 underline">Thử lại</button>
    </div>
  );

  return (
    <div className="flex gap-6 items-start">
      {/* Left: list */}
      <div className={`flex-1 min-w-0 ${selected ? "hidden lg:block" : "block"}`}>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Tổng tài khoản", value: counts.all,     icon: "👥", bg: "bg-blue-50  border-blue-200  text-blue-700"  },
            { label: "Người mua",       value: counts.buyers,  icon: "🛒", bg: "bg-gray-50  border-gray-200  text-gray-700"  },
            { label: "Người bán",       value: counts.sellers, icon: "🏪", bg: "bg-green-50 border-green-200 text-green-700" },
            { label: "Chờ duyệt",       value: counts.pending, icon: "⏳", bg: "bg-amber-50 border-amber-200 text-amber-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, số điện thoại..."
            className="flex-1 min-w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* User list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => {
              const typeLabel = accountTypeLabel(u);
              const meta = TYPE_LABELS[typeLabel] ?? { icon: "👤", color: "bg-gray-100 text-gray-600" };
              const isActive = selected?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${isActive ? "border-green-500 bg-green-50 shadow-sm" : "border-gray-200 bg-white hover:border-green-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-gray-900 truncate">{u.name}</p>
                        {u.banned && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">🔒 Bị khóa</span>}
                        {u.role === "business" && u.verified && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">✓ Đã duyệt</span>}
                        {u.role === "business" && u.verified === false && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">⏳ Chờ duyệt</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">📞 {u.phone}
                        {u.businessName && <span> · 🏷️ {u.businessName}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{typeLabel}</span>
                      <span className="text-[10px] text-gray-400">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      {selected && (
        <div className="lg:w-80 lg:flex-shrink-0 w-full">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-4">
            {/* Header */}
            <div className="bg-gray-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{selected.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{accountTypeLabel(selected)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                {selected.banned && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">🔒 Bị khóa</span>}
                {!selected.banned && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">✅ Hoạt động</span>}
                {selected.role === "business" && selected.verified && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">✓ Gian hàng đã duyệt</span>}
                {selected.role === "business" && selected.verified === false && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">⏳ Chờ duyệt gian hàng</span>}
              </div>

              {/* Info rows */}
              <div className="space-y-2 text-sm">
                <Row label="Số điện thoại" value={selected.phone} />
                <Row label="Ngày đăng ký" value={new Date(selected.createdAt).toLocaleDateString("vi-VN")} />
                {selected.businessName && <Row label="Tên đơn vị" value={selected.businessName} />}
                {selected.taxCode && <Row label="Mã số thuế" value={selected.taxCode} />}
                {selected.businessAddress && <Row label="Địa chỉ" value={selected.businessAddress} />}
                {selected.category && <Row label="Lĩnh vực" value={categoryLabel(selected.category)} />}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {selected.role === "business" && (
                  selected.verified
                    ? <button onClick={() => handleVerify(selected, false)} disabled={acting}
                        className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                        Thu hồi phê duyệt gian hàng
                      </button>
                    : <button onClick={() => handleVerify(selected, true)} disabled={acting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                        ✓ Phê duyệt gian hàng
                      </button>
                )}
                {selected.banned
                  ? <button onClick={() => handleBan(selected, false)} disabled={acting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                      🔓 Mở khóa tài khoản
                    </button>
                  : <button onClick={() => handleBan(selected, true)} disabled={acting}
                      className="w-full border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                      🔒 Khóa tài khoản
                    </button>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-28 flex-shrink-0">{label}:</span>
      <span className="font-medium text-gray-900 flex-1 min-w-0 break-words">{value}</span>
    </div>
  );
}
