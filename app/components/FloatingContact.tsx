'use client';

const PHONE = '0929606568';
const ZALO_LINK = `https://zalo.me/${PHONE}`;

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 items-end">
      {/* Zalo */}
      <a
        href={ZALO_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        className="w-14 h-14 rounded-full bg-[#0068FF] flex items-center justify-center shadow-xl hover:scale-110 transition-transform ring-4 ring-[#0068FF]/30"
      >
        <svg
          viewBox="0 0 64 64"
          className="w-9 h-9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontWeight="800"
            fontSize="22"
            fill="white"
          >
            Zalo
          </text>
        </svg>
      </a>

      {/* Extra contacts */}
      <div className="flex flex-col gap-1.5 items-end">
        {[
          { label: 'Trung tâm Vật nuôi', phone: '0983708538' },
          { label: 'Trung tâm Cây trồng', phone: '0912593623' },
          { label: 'Trung tâm Quy hoạch', phone: '0919121686' },
        ].map(({ label, phone }) => (
          <a
            key={phone}
            href={`tel:${phone}`}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md hover:bg-green-50 hover:border-green-400 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 text-green-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            <span className="text-gray-500">{label}:</span>
            <span>{phone}</span>
          </a>
        ))}
      </div>

      {/* Phone */}
      <a
        href={`tel:${PHONE}`}
        aria-label={`Gọi hotline ${PHONE}`}
        className="relative flex items-center gap-2.5 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-3 rounded-full shadow-xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30 pointer-events-none" />
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
        <span className="text-sm tracking-wide">{PHONE}</span>
      </a>
    </div>
  );
}
