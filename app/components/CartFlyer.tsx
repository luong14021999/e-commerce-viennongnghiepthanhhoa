"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type FlyFn = (sourceEl: HTMLElement, icon: string, imageUrl?: string) => void;

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
  icon: string;
  imageUrl?: string;
};

export function CartFlyProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FlyItem[]>([]);
  const counter = useRef(0);

  const fly = useCallback<FlyFn>((sourceEl, icon, imageUrl) => {
    const cartEl = document.getElementById("cart-icon");
    if (!cartEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    const startX = srcRect.left + srcRect.width / 2 - 20;
    const startY = srcRect.top + srcRect.height / 2 - 20;
    const dx = cartRect.left + cartRect.width / 2 - 20 - startX;
    const dy = cartRect.top + cartRect.height / 2 - 20 - startY;

    const id = ++counter.current;
    setItems(prev => [...prev, { id, startX, startY, dx, dy, icon, imageUrl }]);

    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      // Bounce the cart badge on arrival
      const badge = document.getElementById("cart-badge");
      if (badge) {
        badge.classList.remove("cart-badge-bounce");
        void badge.offsetWidth; // force reflow
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
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
          )}
        </div>
      ))}
    </CartFlyContext.Provider>
  );
}
