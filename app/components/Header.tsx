'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { categories } from '@/app/lib/data';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
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
              Thông tin viên nông nghiệp
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {' '}
        <div className="flex items-center gap-2 sm:gap-4 py-3 sm:py-2">
          {' '}
          {/* Logo */}{' '}
          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            {' '}
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
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl hidden sm:flex"
          >
            <div className="flex w-full border-2 border-green-600 rounded-full overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm... (lúa giống, phân bón, rau sạch...)"
                className="flex-1 px-4 py-2 text-base outline-none text-gray-700 bg-white"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="hidden md:block">Tìm kiếm</span>
              </button>
            </div>
          </form>
          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-shrink-0">
            {/* Cart */}
            <Link
              href="/gio-hang"
              className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <svg
                  className="w-6 h-6 text-gray-700 group-hover:text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 hidden sm:block">
                Giỏ hàng
              </span>
            </Link>

            {/* User / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0]}
                  </div>
                  <span className="text-xs text-gray-600 hidden sm:block max-w-16 truncate">
                    {user.name.split(' ').pop()}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* Identity header */}
                    <div
                      className="px-4 py-3 border-b border-gray-100"
                      style={{
                        background:
                          user.role === 'admin'
                            ? '#1f2937'
                            : user.role === 'business'
                              ? '#f0fdf4'
                              : '#f0fdf4',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${user.role === 'admin' ? 'bg-gray-600' : 'bg-green-600'}`}
                        >
                          {user.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.role === 'buyer'
                              ? 'Người mua'
                              : user.role === 'business'
                                ? 'Doanh nghiệp'
                                : 'Quản trị viên'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buyer links */}
                    {user.role === 'buyer' && (
                      <Link
                        href="/don-hang"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Đơn hàng của tôi
                      </Link>
                    )}

                    {/* Business links */}
                    {user.role === 'business' && (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50"
                        >
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Dashboard doanh nghiệp
                        </Link>
                        <Link
                          href="/dashboard/them-san-pham"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50"
                        >
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Thêm sản phẩm mới
                        </Link>
                      </>
                    )}

                    {/* Admin links */}
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Bảng quản trị
                      </Link>
                    )}

                    <hr className="border-gray-100" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dang-nhap"
                  className="text-sm font-semibold text-green-700 hover:text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  className="text-sm font-semibold bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-full transition-colors hidden sm:block"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="flex">
            <div className="flex w-full border-2 border-green-600 rounded-full overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="flex-1 px-3 py-2 text-base outline-none"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category nav */}
      <div className="border-t border-gray-100 bg-white hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {/* Tất cả */}
            <Link
              href="/san-pham"
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                pathname === '/san-pham'
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-600 hover:text-green-700 hover:border-green-300'
              }`}
            >
              🛒 Tất cả
            </Link>
            <span className="w-px h-5 bg-gray-200 flex-shrink-0" />
            <span className="text-xs text-blue-500 font-semibold px-1 whitespace-nowrap flex-shrink-0">
              Dịch vụ
            </span>
            {categories
              .filter(c => c.type === 'service')
              .map(cat => (
                <Link
                  key={cat.id}
                  href={`/san-pham?category=${cat.id}`}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    pathname.includes('san-pham') &&
                    typeof window !== 'undefined' &&
                    new URLSearchParams(window.location.search).get(
                      'category',
                    ) === cat.id
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-600 hover:text-blue-700 hover:border-blue-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
            <span className="w-px h-5 bg-gray-200 flex-shrink-0" />
            <span className="text-xs text-green-600 font-semibold px-1 whitespace-nowrap flex-shrink-0">
              Sản phẩm
            </span>
            {categories
              .filter(c => c.type === 'product')
              .map(cat => (
                <Link
                  key={cat.id}
                  href={`/san-pham?category=${cat.id}`}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    pathname.includes('san-pham') &&
                    typeof window !== 'undefined' &&
                    new URLSearchParams(window.location.search).get(
                      'category',
                    ) === cat.id
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-600 hover:text-green-700 hover:border-green-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 py-2">
          <Link
            href="/san-pham"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
          >
            🛒 Tất cả
          </Link>
          <p className="px-4 pt-2 pb-1 text-xs text-blue-500 font-semibold uppercase">
            Dịch vụ
          </p>
          {categories
            .filter(c => c.type === 'service')
            .map(cat => (
              <Link
                key={cat.id}
                href={`/san-pham?category=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Link>
            ))}
          <p className="px-4 pt-2 pb-1 text-xs text-green-600 font-semibold uppercase">
            Sản phẩm
          </p>
          {categories
            .filter(c => c.type === 'product')
            .map(cat => (
              <Link
                key={cat.id}
                href={`/san-pham?category=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Link>
            ))}
        </div>
      )}
    </header>
  );
}
