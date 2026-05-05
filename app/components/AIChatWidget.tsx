"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "Làm sao để đặt hàng?",
  "Phí vận chuyển là bao nhiêu?",
  "Tôi muốn theo dõi đơn hàng",
  "Tư vấn giống lúa phù hợp",
];

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="11" y="1" width="2" height="3" rx="1"/>
      <circle cx="12" cy="1.5" r="1.5"/>
      <rect x="4" y="4" width="16" height="11" rx="3"/>
      <circle cx="9" cy="9" r="2" fill="white"/>
      <circle cx="15" cy="9" r="2" fill="white"/>
      <circle cx="9.5" cy="9.5" r="1" fill="#15803d"/>
      <circle cx="15.5" cy="9.5" r="1" fill="#15803d"/>
      <rect x="8" y="12" width="8" height="1.5" rx=".75" fill="white"/>
      <rect x="7" y="16" width="10" height="6" rx="2"/>
      <rect x="2" y="16" width="4" height="3" rx="1.5"/>
      <rect x="18" y="16" width="4" height="3" rx="1.5"/>
    </svg>
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Xin chào! Tôi là trợ lý AI của Viện Nông Nghiệp Thanh Hóa ✨\n\nTôi có thể giúp bạn:\n• Hướng dẫn sử dụng website\n• Tư vấn sản phẩm nông nghiệp\n• Hỗ trợ đặt hàng và thanh toán\n\nBạn cần hỗ trợ gì?",
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error("Lỗi kết nối");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (e: unknown) {
      if ((e as Error)?.name === "AbortError") return;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function handleClose() {
    abortRef.current?.abort();
    setOpen(false);
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  }

  return (
    <>
      {/* Chat window — bottom-left */}
      {open && (
        <div
          className="fixed bottom-24 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ height: "min(560px, calc(100dvh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-green-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <RobotIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Trợ lý ảo</p>
              <p className="text-green-300 text-xs">Viện Nông Nghiệp Thanh Hóa</p>
            </div>
            <button onClick={clearChat} title="Xoá cuộc trò chuyện"
              className="text-green-300 hover:text-white transition-colors p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button onClick={handleClose} className="text-green-300 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                    <RobotIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === "user"
                    ? "bg-green-700 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.content}
                  {msg.role === "assistant" && i === messages.length - 1 && streaming && (
                    <span className="inline-block w-1.5 h-4 bg-green-500 ml-0.5 animate-pulse rounded-sm align-middle" />
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-white border border-green-200 text-green-700 rounded-full px-3 py-1.5 hover:bg-green-50 transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-3 py-2 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi... (Enter để gửi)"
              rows={1}
              disabled={streaming}
              className="flex-1 resize-none text-sm border-0 outline-none bg-transparent py-1.5 max-h-28 leading-relaxed placeholder-gray-400 disabled:opacity-50"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="bg-green-700 hover:bg-green-600 disabled:bg-gray-200 text-white rounded-xl p-2 transition-colors flex-shrink-0"
            >
              {streaming ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating button — bottom-left */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Trợ lý ảo"
        className="fixed bottom-6 left-4 z-50 flex items-center gap-2"
      >
        <div className="relative w-14 h-14 rounded-full bg-green-700 hover:bg-green-600 flex items-center justify-center shadow-xl hover:scale-110 transition-transform ring-4 ring-green-700/30">
          {open ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <RobotIcon className="w-7 h-7 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
            </>
          )}
        </div>
        {!open && (
          <span className="bg-white text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-green-200">
            Trợ lý ảo
          </span>
        )}
      </button>
    </>
  );
}
