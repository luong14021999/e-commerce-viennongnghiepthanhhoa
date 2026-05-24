"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Stats = { avgRating: number; count: number };
type StatsMap = Record<string, Stats>;

const ReviewStatsContext = createContext<StatsMap>({});

export function ReviewStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<StatsMap>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadStats = () => {
      fetch("/api/review-stats")
        .then((r) => r.json())
        .then((data: StatsMap) => setStats(data))
        .catch(() => {});
    };

    loadStats();

    const supabase = createClient();
    const channel = supabase
      .channel("review-stats-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(loadStats, 500);
        },
      )
      .subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
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
