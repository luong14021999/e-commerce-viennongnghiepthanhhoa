"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Stats = { avgRating: number; count: number };
type StatsMap = Record<string, Stats>;

const ReviewStatsContext = createContext<StatsMap>({});

export function ReviewStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<StatsMap>({});

  useEffect(() => {
    fetch("/api/review-stats")
      .then((r) => r.json())
      .then((data: StatsMap) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <ReviewStatsContext.Provider value={stats}>
      {children}
    </ReviewStatsContext.Provider>
  );
}

export function useReviewStats(productId: string): Stats | null {
  const map = useContext(ReviewStatsContext);
  return map[productId] ?? null;
}
