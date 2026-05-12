'use client';

import { useState } from 'react';

const PHONE = '0929606568';
const ZALO_LINK = `https://zalo.me/${PHONE}`;

const TOPICS = [
  { icon: '🛒', label: 'Hỗ trợ sản phẩm',  dept: 'Tư vấn sản phẩm',   phone: '0912593623' },
  { icon: '🔄', label: 'Đặt / trả hàng',    dept: 'Phòng kinh doanh',   phone: '0983708538' },
  { icon: '📢', label: 'Khiếu nại',          dept: 'Hỗ trợ khách hàng', phone: '0919121686' },
] as const;

type Topic = typeof TOPICS[number];

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Topic | null>(null);

  function handleClose() {
    setOpen(false);
    setSelected(null);
  }

  function toggleOpen() {
    if (open) {
      handleClose();
    } else {
      setOpen(true);
    }
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 items-end">
      {/* Zalo — unchanged */}
      <a
        href={ZALO_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        className="w-14 h-14 rounded-full bg-[#0068FF] flex items-center justify-center shadow-xl hover:scale-110 transition-transform ring-4 ring-[#0068FF]/30"
      >
        <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="32" y="42" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="22" fill="white">Zalo</text>
        </svg>
      </a>

      {/* Popup */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-72 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Viện Nông Nghiệp Thanh Hóa</p>
              <p className="text-green-200 text-xs">
                {selected ? selected.label : 'Chúng tôi hỗ trợ gì cho bạn?'}
              </p>
            </div>
            <button onClick={handleClose} className="text-white/70 hover:text-white text-xl leading-none w-7 h-7 flex items-center justify-center">×</button>
          </div>

          {!selected ? (
            /* Topic selection */
            <div className="p-3 flex flex-col gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setSelected(t)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-green-400 hover:bg-green-50 transition-all text-left group"
                >
                  <span className="text-xl flex-shrink-0">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-green-700">{t.label}</p>
                    <p className="text-xs text-gray-400">{t.dept}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            /* Contact card */
            <div className="p-4">
              <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {selected.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{selected.label}</p>
                  <p className="font-bold text-gray-900 text-sm">{selected.dept}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl px-4 py-3 mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Số điện thoại</p>
                  <p className="font-extrabold text-green-800 text-xl tracking-wide">{selected.phone}</p>
                </div>
                <span className="text-3xl">📞</span>
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3 flex items-start gap-1.5">
                <span className="flex-shrink-0">ℹ️</span>
                Tư vấn viên sẽ được thông báo trước để chuẩn bị hỗ trợ bạn tốt nhất.
              </p>

              <a
                href={`tel:${selected.phone}`}
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                <PhoneIcon className="w-4 h-4" />
                Gọi ngay
              </a>
            </div>
          )}
        </div>
      )}

      {/* Single Hotline button */}
      <button
        onClick={toggleOpen}
        aria-label="Gọi hotline"
        className="relative flex items-center gap-2.5 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-3 rounded-full shadow-xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30 pointer-events-none" />
        )}
        <PhoneIcon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm tracking-wide">Hotline</span>
      </button>
    </div>
  );
}
