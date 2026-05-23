"use client";

import { useEffect, useMemo, useState } from "react";
import type { Spot } from "@/lib/data";
import { filterSpots, listCategories } from "@/lib/data";

interface Props {
  spots: Spot[];
  onFilterChange: (filtered: Spot[]) => void;
  onSpotClick?: (spot: Spot) => void;
}

export default function Sidebar({ spots, onFilterChange, onSpotClick }: Props) {
  const [keyword, setKeyword] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const categories = useMemo(() => listCategories(spots), [spots]);

  const filtered = useMemo(
    () => filterSpots(spots, { keyword, categories: selectedCats }),
    [spots, keyword, selectedCats],
  );

  // フィルタ結果をマップへ
  useEffect(() => {
    onFilterChange(filtered);
  }, [filtered, onFilterChange]);

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <aside className="flex flex-col h-full w-80 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold mb-3">dd-map</h1>
        <input
          type="search"
          placeholder="キーワードで検索…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {categories.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-gray-600 mb-1">カテゴリ</div>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => {
                const active = selectedCats.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500">{filtered.length} 件 / 全 {spots.length} 件</div>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filtered.map((spot) => (
          <li key={spot.id}>
            <button
              type="button"
              onClick={() => onSpotClick?.(spot)}
              className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-sm">{spot.spot_name}</div>
              {spot.category && (
                <div className="text-xs text-gray-500">{spot.category}</div>
              )}
              {spot.description && (
                <div className="text-xs text-gray-700 mt-1 line-clamp-2">
                  {spot.description}
                </div>
              )}
              {spot.rating !== null && (
                <div className="text-xs text-amber-600 mt-1">
                  ★ {spot.rating}
                  {spot.reviews_count !== null && ` (${spot.reviews_count})`}
                </div>
              )}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="p-4 text-center text-sm text-gray-500">該当なし</li>
        )}
      </ul>
    </aside>
  );
}
