"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TABLES = ["products", "product_images", "reviews", "business_profiles"] as const;

export default function RealtimeRefresher() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const debouncedRefresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 500);
    };

    const channels = TABLES.map((table) =>
      supabase
        .channel(`realtime-public-${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          debouncedRefresh,
        )
        .subscribe(),
    );

    return () => {
      if (timer.current) clearTimeout(timer.current);
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, [router]);

  return null;
}
