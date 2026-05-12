"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { formatPrice } from "@/app/lib/data";
import { createOrderAction } from "@/lib/actions";
import { THANH_HOA_COMMUNES } from "@/app/lib/thanhhoa-address";

const SHIPPING_FEE = 30000;
const SHIPPING_THRESHOLD = 500000;

const paymentMethods = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: "💵", desc: "Trả tiền mặt khi nhận hàng" },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: "🏦", desc: "Chuyển khoản trực tiếp qua ngân hàng" },
  { id: "momo", label: "Ví MoMo", icon: "💜", desc: "Thanh toán qua ví điện tử MoMo" },
  { id: "vnpay", label: "VNPay", icon: "💳", desc: "Thanh toán qua cổng VNPay" },
];

type Step = "info" | "payment" | "success";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // All hooks must be called unconditionally before any early return
  const [step, setStep] = useState<Step>("info");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "Thanh Hóa", commune: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState("");

  // Pre-fill form when user data becomes available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/dang-nhap");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user && user.role !== "buyer") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể đặt hàng</h2>
          <p className="text-gray-500 text-sm mb-2">
            Chỉ tài khoản <span className="font-semibold text-gray-700">Người mua</span> mới có thể đặt hàng trên hệ thống.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Tài khoản <span className="font-semibold">{user.role === "admin" ? "Quản trị viên" : "Doanh nghiệp"}</span> không có quyền mua hàng. Vui lòng đăng nhập bằng tài khoản người mua để tiếp tục.
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm text-center hover:bg-gray-50 transition-colors"
            >
              Về trang chủ
            </Link>
            <Link
              href="/dang-nhap"
              className="flex-1 bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm text-center hover:bg-green-600 transition-colors"
            >
              Đăng nhập tài khoản khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = totalPrice + shippingFee;

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
        <Link href="/san-pham" className="bg-green-700 text-white font-bold px-6 py-3 rounded-full hover:bg-green-600 transition-colors">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  function validateInfo() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    if (!form.commune) errs.commune = "Vui lòng chọn xã/phường";
    if (!form.address.trim()) errs.address = "Vui lòng nhập địa chỉ giao hàng";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNextStep() {
    if (step === "info" && validateInfo()) {
      setStep("payment");
    }
  }

  async function handlePlaceOrder() {
    setLoading(true);
    setOrderError("");
    try {
      const result = await createOrderAction({
        shippingName: form.name,
        shippingPhone: form.phone,
        shippingAddress: [form.address, form.commune, form.city].filter(Boolean).join(", "),
        note: form.note || undefined,
        totalPrice,
        shippingFee,
        grandTotal,
        paymentMethod,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productUnit: product.unit,
          productIcon: product.icon,
          productImageUrl: product.images?.[0] ?? product.imageUrl,
          quantity,
          subtotal: product.price * quantity,
        })),
      });

      if (!result.ok || !result.orderId) {
        setOrderError(result.error ?? "Đặt hàng thất bại. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      clearCart();
      setConfirmedOrderId(result.orderId);
      setStep("success");
    } catch {
      setOrderError("Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-1">Mã đơn hàng của bạn:</p>
          <p className="text-2xl font-bold text-green-700 mb-4">DH{confirmedOrderId.slice(0, 8).toUpperCase()}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Người nhận:</span>
              <span className="font-semibold">{form.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Điện thoại:</span>
              <span className="font-semibold">{form.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Địa chỉ:</span>
              <span className="font-semibold text-right max-w-48">{[form.address, form.commune, form.city].filter(Boolean).join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Thanh toán:</span>
              <span className="font-semibold">{paymentMethods.find((m) => m.id === paymentMethod)?.label.split("(")[0].trim()}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold">Tổng tiền:</span>
              <span className="font-bold text-red-600 text-base">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Chúng tôi sẽ liên hệ xác nhận qua số <span className="font-semibold">{form.phone}</span> trong 30 phút.
          </p>
          <div className="flex gap-3">
            <Link href="/" className="flex-1 border-2 border-green-700 text-green-700 font-semibold py-3 rounded-xl text-sm text-center hover:bg-green-50 transition-colors">
              Về trang chủ
            </Link>
            <Link href="/san-pham" className="flex-1 bg-green-700 text-white font-semibold py-3 rounded-xl text-sm text-center hover:bg-green-600 transition-colors">
              Tiếp tục mua
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="text-xs text-gray-500 flex items-center gap-1 mb-3">
            <Link href="/" className="hover:text-green-700">Trang chủ</Link>
            <span>›</span>
            <Link href="/gio-hang" className="hover:text-green-700">Giỏ hàng</Link>
            <span>›</span>
            <span className="text-gray-800">Thanh toán</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 bg-white rounded-xl border border-gray-200 p-4">
          {[
            { key: "info", label: "1. Thông tin giao hàng" },
            { key: "payment", label: "2. Phương thức thanh toán" },
          ].map(({ key, label }, idx) => (
            <div key={key} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step === key ? "bg-green-600 text-white" : step === "payment" && idx === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
              }`}>
                {step === "payment" && idx === 0 ? "✓" : idx + 1}
              </div>
              <span className={`text-sm font-medium ${step === key ? "text-green-700" : "text-gray-400"}`}>{label}</span>
              {idx < 1 && <div className="flex-1 h-px bg-gray-200 mx-2"/>}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            {step === "info" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Thông tin giao hàng</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? "border-red-400" : "border-gray-300"}`}
                        placeholder="Nguyễn Văn A"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? "border-red-400" : "border-gray-300"}`}
                        placeholder="0912 345 678"
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Xã / Phường <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.commune}
                      onChange={(e) => setField("commune", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${errors.commune ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">-- Chọn xã/phường --</option>
                      {THANH_HOA_COMMUNES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.commune && <p className="text-xs text-red-500 mt-1">{errors.commune}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.address ? "border-red-400" : "border-gray-300"}`}
                      placeholder="Số nhà, tên đường, thôn/xóm..."
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú đơn hàng</label>
                    <textarea
                      value={form.note}
                      onChange={(e) => setField("note", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Giao hàng giờ hành chính, gọi trước khi giao..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="mt-6 w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Tiếp tục →
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <button onClick={() => setStep("info")} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3 mb-6">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="w-4 h-4 accent-green-600"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{method.label}</div>
                        <div className="text-xs text-gray-500">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "bank" && (() => {
                  const bankId      = process.env.NEXT_PUBLIC_BANK_ID      ?? "MB";
                  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? "0000000000";
                  const bankName    = process.env.NEXT_PUBLIC_BANK_NAME    ?? "VIEN NONG NGHIEP THANH HOA";
                  const transferRef = `Thanh toan ${form.phone}`.trim();
                  const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png` +
                    `?amount=${grandTotal}` +
                    `&addInfo=${encodeURIComponent(transferRef)}` +
                    `&accountName=${encodeURIComponent(bankName)}`;
                  return (
                    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
                      {/* QR section */}
                      <div className="flex flex-col items-center py-5 px-4 border-b border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">Quét QR để thanh toán</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrUrl}
                          alt="QR chuyển khoản"
                          className="w-52 h-52 rounded-xl border-4 border-white shadow-md"
                        />
                        <p className="text-xs text-blue-500 mt-2">Dùng app ngân hàng bất kỳ để quét</p>
                      </div>
                      {/* Bank info */}
                      <div className="px-5 py-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Ngân hàng</span>
                          <span className="font-bold text-blue-900">{bankId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Số tài khoản</span>
                          <span className="font-bold text-blue-900 tracking-widest">{bankAccount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Chủ tài khoản</span>
                          <span className="font-bold text-blue-900 text-right max-w-40">{bankName}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                          <span className="text-blue-600">Số tiền</span>
                          <span className="font-bold text-green-700 text-base">{formatPrice(grandTotal)}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-blue-600 flex-shrink-0">Nội dung CK</span>
                          <span className="font-bold text-blue-900 text-right ml-2 break-all">{transferRef}</span>
                        </div>
                      </div>
                      <div className="bg-amber-50 border-t border-amber-200 px-5 py-3">
                        <p className="text-xs text-amber-700 font-medium">
                          ⚠️ Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xử lý nhanh nhất.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Đang xử lý đơn hàng...
                    </>
                  ) : paymentMethod === "bank" ? (
                    <>✅ Xác nhận đặt hàng – {formatPrice(grandTotal)}</>
                  ) : (
                    <>🛒 Đặt hàng – {formatPrice(grandTotal)}</>
                  )}
                </button>

                {orderError && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
                    </svg>
                    <span>{orderError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Đơn hàng ({items.length} sản phẩm)</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className={`${product.bg} w-11 h-11 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden relative`}>
                      {(product.images?.[0] ?? product.imageUrl)
                        ? <Image src={product.images?.[0] ?? product.imageUrl!} alt={product.name} fill className="object-cover" sizes="44px" />
                        : <span>{product.icon}</span>
                      }
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2">{product.name}</p>
                      <p className="text-xs text-gray-400">x{quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Vận chuyển</span>
                  {shippingFee === 0
                    ? <span className="text-green-600 font-semibold">Miễn phí</span>
                    : <span>{formatPrice(shippingFee)}</span>
                  }
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              {form.name && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-700">Giao đến:</p>
                  <p>{form.name} – {form.phone}</p>
                  {(form.address || form.commune) && (
                    <p>{[form.address, form.commune, form.city].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
