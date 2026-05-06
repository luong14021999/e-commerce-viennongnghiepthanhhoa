'use client';

import { createContext, useContext, useState } from 'react';

export type ProductContext = {
  name: string;
  price: string;
  category: string;
  description?: string;
};

type AIChatContextValue = {
  productContext: ProductContext | null;
  setProductContext: (info: ProductContext | null) => void;
};

const AIChatContext = createContext<AIChatContextValue | null>(null);

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  return (
    <AIChatContext.Provider value={{ productContext, setProductContext }}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error('useAIChat must be used within AIChatProvider');
  return ctx;
}
