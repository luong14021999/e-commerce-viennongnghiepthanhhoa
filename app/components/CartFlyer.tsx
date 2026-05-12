"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type FlyFn = (sourceEl: HTMLElement) => void;

const CartFlyContext = createContext<FlyFn>(() => {});

export function useCartFly() {
  return useContext(CartFlyContext);
}

type FlyItem = {
  id: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
};

export function CartFlyProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FlyItem[]>([]);
  const counter = useRef(0);

  const fly = useCallback<FlyFn>((sourceEl: HTMLElement) => {
    const cartEl = document.getElementById("cart-icon");
    if (!cartEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    const startX = srcRect.left + srcRect.width / 2 - 20;
    const startY = srcRect.top + srcRect.height / 2 - 20;
    const dx = cartRect.left + cartRect.width / 2 - 20 - startX;
    const dy = cartRect.top + cartRect.height / 2 - 20 - startY;

    const id = ++counter.current;
    setItems(prev => [...prev, { id, startX, startY, dx, dy }]);

    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      const badge = document.getElementById("cart-badge");
      if (badge) {
        badge.classList.remove("cart-badge-bounce");
        void badge.offsetWidth;
        badge.classList.add("cart-badge-bounce");
        setTimeout(() => badge.classList.remove("cart-badge-bounce"), 600);
      }
    }, 750);
  }, []);

  return (
    <CartFlyContext.Provider value={fly}>
      {children}
      {items.map(item => (
        <div
          key={item.id}
          className="fly-to-cart"
          style={{
            position: "fixed",
            left: item.startX,
            top: item.startY,
            width: 40,
            height: 40,
            "--fly-dx": `${item.dx}px`,
            "--fly-dy": `${item.dy}px`,
          } as React.CSSProperties}
        >
          <svg style={{ width: 20, height: 20, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ))}
    </CartFlyContext.Provider>
  );
}
