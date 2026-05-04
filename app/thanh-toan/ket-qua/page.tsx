"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function PaymentResult() {
  const params = useSearchParams();
  const code = params.get("code");
  const orderId = params.get("orderId");
  const success = code === "00";
  const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : "";

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-500 mb-1">Mã đơn hàng:</p>
        <p className="text-xl font-bold text-green-700 mb-2">#{shortId}</p>
        <p className="text-sm text-gray-400 mb-6">
          Đơn hàng đã được xác nhận và đang được xử lý. Chúng tôi sẽ liên hệ sớm nhất.
        </p>
        <div className="flex gap-3">
          <Link href="/don-hang" className="flex-1 border-2 border-green-700 text-green-700 font-semibold py-3 rounded-xl text-sm text-center hover:bg-green-50 transition-colors">
            Xem đơn hàng
          </Link>
          <Link href="/san-pham" className="flex-1 bg-green-700 text-white font-bold py-3 rounded-xl text-sm text-center hover:bg-green-600 transition-colors">
            Tiếp tục mua
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Thanh toán bị huỷ</h2>
      <p className="text-gray-500 text-sm mb-6">
        Bạn đã huỷ thanh toán. Đơn hàng #{shortId} vẫn được giữ — bạn có thể thanh toán lại hoặc liên hệ chúng tôi.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm text-center hover:bg-gray-50 transition-colors">
          Về trang chủ
        </Link>
        <Link href="/don-hang" className="flex-1 bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm text-center hover:bg-green-600 transition-colors">
          Xem đơn hàng
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />}>
        <PaymentResult />
      </Suspense>
    </div>
  );
}
