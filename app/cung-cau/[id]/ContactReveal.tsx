"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type Props = {
  posterName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
};

export default function ContactReveal({
  posterName,
  contactName,
  contactPhone,
  contactEmail,
}: Props) {
  const { user, isLoading } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const pathname = usePathname();

  // Mask phone: 0987654321 -> 0987***321
  const maskedPhone = contactPhone.length >= 6
    ? contactPhone.slice(0, 4) + "***" + contactPhone.slice(-3)
    : "***";

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold mb-2 flex items-center gap-2">
          🔒 Đăng nhập để xem thông tin liên hệ
        </h2>
        <p className="text-sm text-white/80 mb-4">
          Người đăng: <strong>{posterName}</strong> · Số điện thoại: <strong>{maskedPhone}</strong>
        </p>
        <Link
          href={`/dang-nhap?redirect=${encodeURIComponent(pathname)}`}
          className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-sm"
        >
          Đăng nhập ngay →
        </Link>
      </div>
    );
  }

  if (!revealed) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold text-green-900 mb-1 flex items-center gap-2">
          📞 Thông tin liên hệ
        </h2>
        <p className="text-sm text-green-800 mb-4">
          Người đăng: <strong>{posterName}</strong> · SĐT: <strong>{maskedPhone}</strong>
        </p>
        <button
          onClick={() => setRevealed(true)}
          className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-full transition-colors text-sm"
        >
          👁️ Hiển thị đầy đủ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6 space-y-3">
      <h2 className="text-base font-bold text-green-900 flex items-center gap-2">
        📞 Thông tin liên hệ
      </h2>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24">Người liên hệ:</span>
          <span className="font-semibold text-gray-900">{contactName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24">Số điện thoại:</span>
          <a href={`tel:${contactPhone}`} className="font-bold text-green-700 hover:underline">
            {contactPhone}
          </a>
        </div>
        {contactEmail && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-24">Email:</span>
            <a href={`mailto:${contactEmail}`} className="font-semibold text-green-700 hover:underline">
              {contactEmail}
            </a>
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        <a
          href={`tel:${contactPhone}`}
          className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold px-4 py-2.5 rounded-full transition-colors text-sm text-center"
        >
          📞 Gọi ngay
        </a>
        <a
          href={`sms:${contactPhone}`}
          className="flex-1 bg-white border border-green-300 text-green-700 hover:bg-green-100 font-bold px-4 py-2.5 rounded-full transition-colors text-sm text-center"
        >
          💬 Nhắn tin
        </a>
      </div>
    </div>
  );
}
