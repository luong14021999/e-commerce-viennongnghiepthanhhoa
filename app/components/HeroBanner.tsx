"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type Banner = {
  badge: string;
  headline: string;
  highlight: string;
  tail: string;
  slogan: string;
  desc: string;
  stats: { value: string; label: string }[];
  href: string;
  cta: string;
  ctaSecondary?: { label: string; href: string };
  bg: string;
  accent: string;
  ctaText: string;
  visual: { icon: string; cards: { icon: string; label: string }[] };
};

const banners: Banner[] = [
  {
    badge: "🌾 Viện Nông Nghiệp Thanh Hóa",
    headline: "Nông sản",
    highlight: "TỬ TẾ",
    tail: "từ Viện",
    slogan: "Từ ruộng đến bàn ăn — Không qua trung gian",
    desc: "Giống cây trồng, vật nuôi và đặc sản chính hãng, kiểm định bởi Viện Nông Nghiệp Thanh Hóa.",
    stats: [
      { value: "30+", label: "Năm kinh nghiệm" },
      { value: "500+", label: "Giống đã chuyển giao" },
      { value: "100%", label: "Kiểm định nguồn gốc" },
    ],
    href: "/san-pham?category=san-pham-vien",
    cta: "Khám phá sản phẩm Viện",
    ctaSecondary: { label: "Xem giống cây trồng", href: "/san-pham?category=giong-cay-trong" },
    bg: "from-green-900 via-green-700 to-emerald-600",
    accent: "bg-amber-400",
    ctaText: "text-green-800",
    visual: {
      icon: "🌾",
      cards: [
        { icon: "🌱", label: "Giống cây" },
        { icon: "🐄", label: "Vật nuôi" },
        { icon: "🥬", label: "Nông sản tươi" },
        { icon: "🏅", label: "OCOP" },
      ],
    },
  },
  {
    badge: "🔬 Chuyên gia Nông nghiệp",
    headline: "Tư vấn —",
    highlight: "CHUYỂN GIAO",
    tail: "công nghệ",
    slogan: "Đội ngũ chuyên gia đồng hành cùng bà con nông dân",
    desc: "Từ quy hoạch, kỹ thuật canh tác đến chuyển giao công nghệ - hỗ trợ toàn diện cho hộ sản xuất và HTX.",
    stats: [
      { value: "24/7", label: "Hỗ trợ kỹ thuật" },
      { value: "200+", label: "Dự án triển khai" },
      { value: "50+", label: "Chuyên gia đầu ngành" },
    ],
    href: "/san-pham?category=dich-vu-chuyen-giao",
    cta: "Đặt lịch tư vấn",
    ctaSecondary: { label: "Xem đề tài nghiên cứu", href: "/san-pham?category=de-tai-nghien-cuu" },
    bg: "from-teal-900 via-cyan-700 to-blue-600",
    accent: "bg-yellow-300",
    ctaText: "text-teal-800",
    visual: {
      icon: "🔬",
      cards: [
        { icon: "📋", label: "Chuyển giao" },
        { icon: "💻", label: "Công nghệ số" },
        { icon: "📊", label: "Phân tích" },
        { icon: "🎓", label: "Đào tạo" },
      ],
    },
  },
  {
    badge: "🏪 Sàn Thương mại Nông sản",
    headline: "Mở gian hàng",
    highlight: "MIỄN PHÍ",
    tail: "—Bán nông sản online",
    slogan: "Đưa Nông sản Thanh Hóa ra thị trường cả nước",
    desc: "Kết nối doanh nghiệp, HTX, nông hộ với hàng nghìn khách hàng trên toàn quốc. Đăng ký 5 phút, bán hàng ngay hôm nay.",
    stats: [
      { value: "0đ", label: "Phí mở gian hàng" },
      { value: "1000+", label: "Khách hàng tiềm năng" },
      { value: "63", label: "Tỉnh thành giao hàng" },
    ],
    href: "/dang-ky",
    cta: "Đăng ký bán hàng",
    ctaSecondary: { label: "Tìm hiểu thêm", href: "/gioi-thieu" },
    bg: "from-amber-800 via-orange-600 to-red-500",
    accent: "bg-yellow-200",
    ctaText: "text-orange-800",
    visual: {
      icon: "🏪",
      cards: [
        { icon: "📦", label: "Đăng SP nhanh" },
        { icon: "🚚", label: "Toàn quốc" },
        { icon: "💰", label: "Hoa hồng cao" },
        { icon: "📈", label: "Tăng doanh số" },
      ],
    },
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused]);

  const banner = banners[current];

  return (
    <div
      className={`bg-gradient-to-br ${banner.bg} text-white relative overflow-hidden transition-all duration-700`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)"/>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left: copy + CTA */}
          <div className="lg:col-span-3">
            {/* Animated badge */}
            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${banner.accent} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${banner.accent}`} />
              </span>
              {banner.badge}
            </span>

            {/* Slogan / headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-black leading-[1.05] mb-4 tracking-tight">
              {banner.headline}{" "}
              <span className="relative inline-block">
                <span className={`absolute inset-x-0 bottom-1 sm:bottom-2 h-3 sm:h-4 ${banner.accent} opacity-60 -z-0`} />
                <span className="relative z-10">{banner.highlight}</span>
              </span>{" "}
              {banner.tail}
            </h1>

            <p className="text-white/95 text-lg sm:text-xl font-semibold mb-2 leading-snug">
              {banner.slogan}
            </p>
            <p className="text-white/75 text-sm sm:text-base mb-6 max-w-xl leading-relaxed">
              {banner.desc}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mb-7">
              {banner.stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className={`text-2xl sm:text-3xl font-black leading-none`}>
                    {s.value}
                  </span>
                  <span className="text-xs text-white/70 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={banner.href}
                className={`inline-flex items-center gap-2 bg-white ${banner.ctaText} font-bold px-6 py-3 rounded-full hover:scale-105 hover:shadow-2xl transition-all shadow-lg text-sm sm:text-base`}
              >
                {banner.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
              {banner.ctaSecondary && (
                <Link
                  href={banner.ctaSecondary.href}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-full transition-colors backdrop-blur-sm text-sm sm:text-base"
                >
                  {banner.ctaSecondary.label}
                </Link>
              )}
            </div>
          </div>

          {/* Right: visual decoration */}
          <div className="lg:col-span-2 hidden lg:block relative h-[380px]">
            {/* Big floating icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[280px] leading-none opacity-15 select-none pointer-events-none">
              {banner.visual.icon}
            </div>

            {/* Floating cards */}
            {banner.visual.cards.map((card, idx) => {
              const positions = [
                "top-2 left-2 -rotate-6",
                "top-4 right-2 rotate-6",
                "bottom-6 left-6 rotate-3",
                "bottom-2 right-4 -rotate-3",
              ];
              return (
                <div
                  key={card.label}
                  className={`absolute ${positions[idx]} bg-white/95 text-gray-800 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/50 flex items-center gap-2.5 hover:scale-110 transition-transform`}
                  style={{ animation: `float 3s ease-in-out infinite ${idx * 0.4}s` }}
                >
                  <span className="text-3xl">{card.icon}</span>
                  <span className="font-bold text-sm whitespace-nowrap">{card.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className="p-1.5 rounded-full transition-all flex items-center justify-center"
          >
            <span className={`block rounded-full transition-all ${i === current ? "bg-white w-8 h-2.5" : "bg-white/40 w-2.5 h-2.5 hover:bg-white/60"}`} />
          </button>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) var(--rotate, rotate(0deg)); }
          50% { transform: translateY(-8px) var(--rotate, rotate(0deg)); }
        }
      `}</style>
    </div>
  );
}
