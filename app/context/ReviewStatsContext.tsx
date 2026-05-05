"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Stats = { avgRating: number; count: number };
type StatsMap = Record<string, Stats>;

const ReviewStatsContext = createContext<StatsMap>({});

export function ReviewStatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<StatsMap>({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("reviews")
      .select("product_id, rating")
      .then(({ data }) => {
        if (!data) return;
        const map: StatsMap = {};
        for (const row of data) {
          if (!map[row.product_id]) map[row.product_id] = { avgRating: 0, count: 0 };
          map[row.product_id].count++;
          map[row.product_id].avgRating += row.rating;
        }
        for (const id of Object.keys(map)) {
          map[id].avgRating = Math.round((map[id].avgRating / map[id].count) * 10) / 10;
        }
        setStats(map);
      });
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
