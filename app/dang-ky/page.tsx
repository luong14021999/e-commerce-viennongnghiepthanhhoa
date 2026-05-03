'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { categories } from '@/app/lib/data';

type Role = 'buyer' | 'business';

export default function RegisterPage() {
  const { registerBuyer, registerBusiness, login, user, isLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>('buyer');

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'business') router.replace('/dashboard');
      else if (user.role === 'admin') router.replace('/admin');
      else router.replace('/');
    }
  }, [user, isLoading, router]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    businessName: '',
    taxCode: '',
    businessAddress: '',
    category: '',
    description: '',
  });

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.password) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (
      role === 'business' &&
      (!form.businessName ||
        !form.taxCode ||
        !form.businessAddress ||
        !form.category)
    ) {
      setError('Vui lòng điền đầy đủ thông tin doanh nghiệp');
      return;
    }
    setLoading(true);
    const result =
      role === 'buyer'
        ? await registerBuyer({
            name: form.name,
            phone: form.phone,
            email: form.email,
            password: form.password,
          })
        : await registerBusiness({
            name: form.name,
            phone: form.phone,
            email: form.email,
            password: form.password,
            businessName: form.businessName,
            taxCode: form.taxCode,
            businessAddress: form.businessAddress,
            category: form.category,
            description: form.description,
          });
    if (!result.ok) {
      setLoading(false);
      setError(result.error ?? 'Đăng ký thất bại');
      return;
    }

    // Try auto-login after successful registration
    const loginResult = await login(form.phone, form.password);
    setLoading(false);
    if (loginResult.ok) {
      // onAuthStateChange + useEffect will handle redirect
      return;
    }
    // Fallback: go to login page
    router.push('/dang-nhap');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/thanh_hoa_agriculture_logo.png"
              alt="Viện Nông Nghiệp Thanh Hóa"
              width={88}
              height={88}
              className="flex-shrink-0 object-contain"
            />
            <div className="text-left">
              <div className="text-xl font-extrabold text-green-800 uppercase leading-tight">
                Viện Nông Nghiệp
              </div>
              <div className="text-base font-bold text-green-600">
                Thanh Hóa
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">
            Tạo tài khoản
          </h1>
          <p className="text-gray-500 text-sm">
            Chọn loại tài khoản phù hợp với bạn
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
              role === 'buyer'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <span className="text-4xl">🛒</span>
            <span className="font-bold text-gray-800">Người mua</span>
            <span className="text-xs text-gray-500 text-center">
              Mua sắm sản phẩm nông nghiệp
            </span>
            {role === 'buyer' && (
              <span className="text-green-600 text-xs font-semibold">
                ✓ Đã chọn
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setRole('business')}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
              role === 'business'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <span className="text-4xl">🏪</span>
            <span className="font-bold text-gray-800">Doanh nghiệp</span>
            <span className="text-xs text-gray-500 text-center">
              Đăng bán sản phẩm của bạn
            </span>
            {role === 'business' && (
              <span className="text-green-600 text-xs font-semibold">
                ✓ Đã chọn
              </span>
            )}
          </button>
        </div>

        {role === 'business' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-800 flex gap-2">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <p>
              Sản phẩm của bạn sẽ được kiểm duyệt bởi Viện Nông Nghiệp trước khi
              hiển thị trên sàn. Thông thường mất 1–2 ngày làm việc.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Common fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email{' '}
                <span className="text-gray-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="email@gmail.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full px-4 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setField('confirm', e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Business-only fields */}
            {role === 'business' && (
              <>
                <hr className="border-gray-200" />
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>🏪</span> Thông tin doanh nghiệp
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tên doanh nghiệp / HTX / Hộ kinh doanh{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={e => setField('businessName', e.target.value)}
                    placeholder="HTX Nông Sản Xanh Thanh Hóa"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mã số thuế / ĐKKD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.taxCode}
                      onChange={e => setField('taxCode', e.target.value)}
                      placeholder="2801234567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Loại sản phẩm chính{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={e => setField('category', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories
                        .filter(c => c.id !== 'tat-ca')
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Địa chỉ kinh doanh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.businessAddress}
                    onChange={e => setField('businessAddress', e.target.value)}
                    placeholder="Xã/Phường, Huyện/Thị xã, Thanh Hóa"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Mô tả hoạt động kinh doanh
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    rows={3}
                    placeholder="Mô tả ngắn về doanh nghiệp và sản phẩm bạn muốn bán..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang đăng ký...
                </>
              ) : role === 'business' ? (
                'Đăng ký tài khoản doanh nghiệp'
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link
              href="/dang-nhap"
              className="text-green-700 font-semibold hover:text-green-600"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
