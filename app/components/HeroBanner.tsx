"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { banners } from "@/app/lib/data";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[current];

  return (
    <div className={`bg-gradient-to-r ${banner.bg} text-white relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-2xl">
          <span className="inline-block bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
            {banner.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3">
            {banner.title}
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-2">{banner.subtitle}</p>
          <p className="text-white/70 text-sm mb-6">{banner.desc}</p>
          <Link
            href={banner.href}
            className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-6 py-3 rounded-full hover:bg-green-50 transition-colors shadow-lg"
          >
            {banner.cta}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
