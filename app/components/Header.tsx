'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { useProducts } from '@/app/context/ProductContext';
import { categories, formatPrice } from '@/app/lib/data';
import type { Product } from '@/app/lib/data';
import ProductApprovalModal from '@/app/components/ProductApprovalModal';

const INSTITUTE_NAME = "Viện Nông Nghiệp Thanh Hóa";

type Suggestion = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  icon: string;
  bg: string;
  sellerName: string | null;
  imageUrl: string | null;
};

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { sellerProducts } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [approvalProduct, setApprovalProduct] = useState<Product | null>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [loading, setLoading] = useState(false);

  const pendingProducts = user?.role === 'admin'
    ? sellerProducts.filter((p) => p.status === 'pending' && p.sellerName !== INSTITUTE_NAME)
    : [];
  const pendingCount = pendingProducts.length;

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const mobileSearchWrapperRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        searchWrapperRef.current?.contains(target) ||
        mobileSearchWrapperRef.current?.contains(target)
      ) {
        if (!notifRef.current?.contains(target)) setNotifOpen(false);
        return;
      }
      setShowSuggestions(false);
      setFocusedIdx(-1);
      if (!notifRef.current?.contains(target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(q.trim())}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    setFocusedIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  }

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function applySuggestion(s: Suggestion) {
    setSearchQuery(s.name);
    setShowSuggestions(false);
    setFocusedIdx(-1);
    router.push(`/san-pham/${s.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && focusedIdx >= 0) {
      e.preventDefault();
      applySuggestion(suggestions[focusedIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIdx(-1);
    }
  }

  const SuggestionsDropdown = ({ suggestions }: { suggestions: Suggestion[] }) => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
      {suggestions.map((s, idx) => (
        <button
          key={s.id}
          onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-green-50 transition-colors ${focusedIdx === idx ? 'bg-green-50' : ''}`}
        >
          <div className={`${s.bg} w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 relative overflow-hidden`}>
            {s.imageUrl
              ? <Image src={s.imageUrl} alt={s.name} fill className="object-cover" sizes="36px" />
              : <span>{s.icon}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
            <p className="text-xs text-gray-400 truncate">
              {s.price > 0 ? `${formatPrice(s.price)}/${s.unit}` : 'Liên hệ'}
              {s.sellerName ? ` · ${s.sellerName}` : ''}
            </p>
          </div>
          <span className="text-green-600 text-xs flex-shrink-0">→</span>
        </button>
      ))}
      <button
        onMouseDown={(e) => { e.preventDefault(); handleSearch(e); }}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors border-t border-gray-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Tìm tất cả kết quả cho &ldquo;{searchQuery}&rdquo;
      </button>
    </div>
  );

  return (
    <>
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-green-700 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <span className="hidden sm:block text-lg">
            🌾 Viện Nông Nghiệp Thanh Hóa – Thành lập 2018
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <Link
              href="https://trungtamtuvanquyhoach.gov.vn/"
              className="hover:underline hidden sm:block font-semibold"
            >
              Xúc tiến thị trường nông nghiệp
            </Link>
            <Link
              href="https://viennongnghiepthanhhoa.gov.vn/"
              className="hover:underline hidden sm:block font-semibold"
            >
              Giới thiệu viện nông nghiệp
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4 py-3 sm:py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <Image
              src="/thanh_hoa_agriculture_logo.png"
              alt="Viện Nông Nghiệp Thanh Hóa"
              width={140}
              height={140}
              className="flex-shrink-0 object-contain w-10 h-10 sm:w-16 sm:h-16"
            />
            <div className="leading-tight">
              <div className="text-base sm:text-2xl font-extrabold text-green-800 uppercase tracking-wide">
                Viện Nông Nghiệp
              </div>
              <div className="text-sm sm:text-xl font-bold text-green-600">
                Thanh Hóa
              </div>
            </div>
          </Link>

          {/* Desktop Search */}
          <div ref={searchWrapperRef} className="flex-1 max-w-2xl hidden sm:block relative">
            <form onSubmit={handleSearch}>
              <div className="flex w-full border-2 border-green-600 rounded-full overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm kiếm sản phẩm... (lúa giống, phân bón, rau sạch...)"
                  className="flex-1 px-4 py-2 text-base outline-none text-gray-700 bg-white"
                />
                {loading && (
                  <span className="flex items-center pr-2">
                    <svg className="w-4 h-4 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </span>
                )}
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden md:block">Tìm kiếm</span>
                </button>
              </div>
            </form>
            {showSuggestions && <SuggestionsDropdown suggestions={suggestions} />}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-shrink-0">
            {/* Cart */}
            <Link
              href="/gio-hang"
              className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              aria-label="Giỏ hàng"
            >
              <div id="cart-icon" className="relative">
                <svg className="w-6 h-6 text-gray-700 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {mounted && totalItems > 0 && (
                  <span id="cart-badge" className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 hidden sm:block">Giỏ hàng</span>
            </Link>

            {/* Admin notification bell */}
            {user?.role === 'admin' && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  aria-label={`${pendingCount} sản phẩm chờ duyệt`}
                  title={pendingCount > 0 ? `${pendingCount} sản phẩm chờ duyệt` : 'Không có sản phẩm chờ duyệt'}
                >
                  <div className="relative">
                    <svg className={`w-6 h-6 transition-colors ${notifOpen ? 'text-amber-600' : 'text-gray-700 group-hover:text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {mounted && pendingCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 hidden sm:block">Duyệt SP</span>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-amber-50">
                      <span className="font-semibold text-gray-800 text-sm">Sản phẩm chờ duyệt</span>
                      {pendingCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
                      )}
                    </div>
                    {pendingProducts.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">
                        <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Không có sản phẩm nào chờ duyệt
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto">
                        {pendingProducts.slice(0, 10).map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setApprovalProduct(p); setNotifOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left"
                          >
                            <div className={`${p.bg} w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 relative overflow-hidden`}>
                              {p.imageUrl
                                ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="36px" />
                                : <span>{p.icon}</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400 truncate">{p.sellerName} · Chờ duyệt</p>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                    <Link
                      href="/admin"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-50 text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-700 border-t border-gray-100 transition-colors"
                    >
                      Xem tất cả trong bảng quản trị
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* User / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-colors ${
                    user.role === 'admin'
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      : user.role === 'business'
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'bg-green-50 border-green-200 hover:bg-green-100'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    user.role === 'admin' ? 'bg-gray-500' : user.role === 'business' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                    {user.name[0].toUpperCase()}
                  </div>
                  {/* Name + role — desktop */}
                  <div className="hidden sm:block text-left leading-tight">
                    <p className={`text-xs font-bold max-w-24 truncate ${user.role === 'admin' ? 'text-white' : 'text-gray-800'}`}>
                      {user.name.split(' ').pop()}
                    </p>
                    <p className={`text-[10px] ${user.role === 'admin' ? 'text-gray-400' : user.role === 'business' ? 'text-blue-600' : 'text-green-600'}`}>
                      {user.role === 'buyer' ? 'Người mua' : user.role === 'business' ? 'Doanh nghiệp' : 'Quản trị viên'}
                    </p>
                  </div>
                  {/* Chevron */}
                  <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${user.role === 'admin' ? 'text-gray-400' : 'text-gray-400'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {/* Profile header */}
                    <div className={`px-4 py-3.5 border-b border-gray-100 ${
                      user.role === 'admin' ? 'bg-gray-800' : user.role === 'business' ? 'bg-blue-50' : 'bg-green-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0 ${
                          user.role === 'admin' ? 'bg-gray-500' : user.role === 'business' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm truncate ${user.role === 'admin' ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                          <p className={`text-xs mt-0.5 ${user.role === 'admin' ? 'text-gray-400' : user.role === 'business' ? 'text-blue-600' : 'text-green-600'}`}>
                            {user.role === 'buyer' ? '🛒 Người mua' : user.role === 'business' ? '🏪 Doanh nghiệp' : '🔐 Quản trị viên'}
                          </p>
                          <p className={`text-xs ${user.role === 'admin' ? 'text-gray-500' : 'text-gray-400'}`}>{user.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Buyer menu */}
                    {user.role === 'buyer' && (<>
                      <Link href="/don-hang" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      <Link href="/tai-khoan" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Chỉnh sửa thông tin</span>
                      </Link>
                    </>)}

                    {/* Business menu */}
                    {user.role === 'business' && (<>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Dashboard doanh nghiệp</span>
                      </Link>
                      <Link href="/dashboard/them-san-pham" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Thêm sản phẩm mới</span>
                      </Link>
                      <Link href="/tai-khoan" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Chỉnh sửa thông tin</span>
                      </Link>
                    </>)}

                    {/* Admin menu */}
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Bảng quản trị</span>
                      </Link>
                    )}

                    <hr className="border-gray-100 mx-3" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/dang-nhap" className="text-sm font-semibold text-green-700 hover:text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/dang-ky" className="text-sm font-semibold bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-full transition-colors hidden sm:block">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <div ref={mobileSearchWrapperRef} className="relative">
            <form onSubmit={handleSearch} className="flex">
              <div className="flex w-full border-2 border-green-600 rounded-full overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm sản phẩm..."
                  className="flex-1 px-3 py-2 text-base outline-none"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
            {showSuggestions && <SuggestionsDropdown suggestions={suggestions} />}
          </div>
        </div>
      </div>


      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 py-2">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50">
            🏠 Trang chủ
          </Link>
          <Link href="/san-pham" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
            🛒 Tất cả
          </Link>
          <p className="px-4 pt-2 pb-1 text-xs text-blue-500 font-semibold uppercase">Dịch vụ</p>
          {categories.filter(c => c.type === 'service').map(cat => (
            <Link key={cat.id} href={`/san-pham?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
              <span>{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
          <p className="px-4 pt-2 pb-1 text-xs text-green-600 font-semibold uppercase">Sản phẩm</p>
          {categories.filter(c => c.type === 'product').map(cat => (
            <Link key={cat.id} href={`/san-pham?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
              <span>{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </header>

    {approvalProduct && (
      <ProductApprovalModal
        product={approvalProduct}
        onClose={() => setApprovalProduct(null)}
      />
    )}
  </>
  );
}
