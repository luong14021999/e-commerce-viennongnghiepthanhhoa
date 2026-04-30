import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
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
              <p>📍 Số 1 Lê Hoàn, TP. Thanh Hóa</p>
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

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Giống cây trồng', '/san-pham?category=giong'],
                ['Phân bón', '/san-pham?category=phanbon'],
                ['Thuốc BVTV', '/san-pham?category=thuoc'],
                ['Rau & Cây ăn quả', '/san-pham?category=rau'],
                ['Thực phẩm đặc sản', '/san-pham?category=thucpham'],
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
