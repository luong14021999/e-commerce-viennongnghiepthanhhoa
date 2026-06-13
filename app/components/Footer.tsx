import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/thanh_hoa_agriculture_logo.png"
                alt="Viện Nông Nghiệp Thanh Hóa"
                width={56}
                height={56}
                className="flex-shrink-0 object-contain"
              />
              <div>
                <div className="font-extrabold text-white text-base uppercase">
                  Viện Nông Nghiệp
                </div>
                <div className="text-green-400 text-sm font-bold">
                  Thanh Hóa
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Hơn 30 năm đồng hành cùng nông dân Thanh Hóa với giống cây trồng
              chất lượng và vật tư nông nghiệp đảm bảo.
            </p>
            <div className="space-y-1.5 text-sm">
              <p>
                📍 Số 271, Đường Nguyễn Phục, Phường Đông Quang, Tỉnh Thanh Hóa,
                Việt Nam
              </p>
              <p>
                📞{' '}
                <a href="tel:02373123456" className="hover:text-green-400">
                  0237 312 3456
                </a>
              </p>
              <p>
                ✉️{' '}
                <a
                  href="mailto:info@viennongnghiep.vn"
                  className="hover:text-green-400"
                >
                  info@viennongnghiep.vn
                </a>
              </p>
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Tư vấn nông nghiệp', '/san-pham?category=tu-van'],
                ['Phân tích – kiểm nghiệm', '/san-pham?category=phan-tich'],
                [
                  'Đào tạo – chuyển giao công nghệ',
                  '/san-pham?category=dao-tao',
                ],
                ['──', ''],
                ['Giống cây trồng', '/san-pham?category=giong-cay-trong'],
                ['Giống vật nuôi – TS', '/san-pham?category=giong-vat-nuoi'],
                ['Sản phẩm Viện', '/san-pham?category=san-pham-vien'],
                ['Vật tư – chế phẩm', '/san-pham?category=vat-tu'],
              ].map(([label, href]) =>
                label === '──' ? (
                  <li key="sep" className="border-t border-gray-700 my-1" />
                ) : (
                  <li key={label}>
                    <Link
                      href={href}
                      className="hover:text-green-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Hướng dẫn mua hàng', '/huong-dan'],
                ['Chính sách đổi trả', '/chinh-sach'],
                ['Chính sách vận chuyển', '/van-chuyen'],
                ['Câu hỏi thường gặp', '/faq'],
                ['Liên hệ tư vấn', '/lien-he'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-green-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Giới thiệu Viện', '/gioi-thieu'],
                ['Tin tức & Sự kiện', '/tin-tuc'],
                ['Nghiên cứu & Phát triển', '/nghien-cuu'],
                ['Tuyển dụng', '/tuyen-dung'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-green-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-white text-sm font-semibold mb-3">
                Chứng nhận
              </p>
              <div className="flex flex-wrap gap-2">
                {['ISO 9001', 'VietGAP', 'OCOP'].map(cert => (
                  <span
                    key={cert}
                    className="bg-green-800 text-green-300 text-xs px-2 py-1 rounded border border-green-700"
                  >
                    ✓ {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping carriers */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="text-white font-semibold">Giao hàng toàn quốc</p>
                <p className="text-xs text-gray-400">Hợp tác cùng các đơn vị vận chuyển uy tín</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Giao Hàng Nhanh", short: "GHN" },
                { label: "Giao Hàng Tiết Kiệm", short: "GHTK" },
                { label: "Viettel Post", short: "Viettel Post" },
                { label: "J&T Express", short: "J&T" },
                { label: "VNPost", short: "VNPost" },
              ].map((c) => (
                <span
                  key={c.short}
                  title={c.label}
                  className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-md shadow-sm"
                >
                  {c.short}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>
            © 2026 Viện Nông Nghiệp Thanh Hóa. Mã số doanh nghiệp: 2800123456
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dieu-khoan" className="hover:text-gray-300">
              Điều khoản sử dụng
            </Link>
            <Link href="/bao-mat" className="hover:text-gray-300">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
