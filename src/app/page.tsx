"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import type { Spot } from "@/lib/data";
import { fetchSpots } from "@/lib/data";

// MapLibre は SSR 不可（window 依存）なので dynamic import
const MapView = dynamic(() => import("@/components/Map"), { ssr: false });

export default function HomePage() {
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpots()
      .then((spots) => {
        setAllSpots(spots);
        setFilteredSpots(spots);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = useCallback((next: Spot[]) => {
    setFilteredSpots(next);
  }, []);

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <Sidebar spots={allSpots} onFilterChange={handleFilterChange} />
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-sm text-gray-600">
            読み込み中…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 p-4 text-center">
            <div>
              <div className="text-red-600 font-semibold mb-2">データの読み込みに失敗しました</div>
              <div className="text-xs text-gray-600">{error}</div>
            </div>
          </div>
        )}
        <MapView spots={filteredSpots} />
      </div>
    </main>
  );
}
