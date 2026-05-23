"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MlMap, Marker, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Spot } from "@/lib/data";

interface Props {
  spots: Spot[];
  onSelect?: (spot: Spot) => void;
}

// OSM タイル（利用規約: https://operations.osmfoundation.org/policies/tiles/）
const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

// 銚子市役所付近を初期中心点に
const INITIAL_CENTER: [number, number] = [140.8266, 35.7345];

export default function MapView({ spots, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // 地図の初期化
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: INITIAL_CENTER,
      zoom: 12,
    });
    map.addControl(new maplibregl.NavigationControl({}), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right",
    );
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ピンの描画
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 古いマーカーを除去
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    if (spots.length === 0) return;

    for (const spot of spots) {
      const popup = new Popup({ offset: 25, closeButton: true, maxWidth: "320px" }).setHTML(
        buildPopupHtml(spot),
      );
      // MapLibre標準SVGマーカー（青）。下端アンカーで位置決め、クリックで popup 開閉が標準動作
      const marker = new Marker({ color: "#1a73e8" })
        .setLngLat([spot.lng, spot.lat])
        .setPopup(popup)
        .addTo(map);
      const el = marker.getElement();
      el.style.cursor = "pointer";
      el.setAttribute("aria-label", spot.spot_name);
      el.setAttribute("title", spot.spot_name);
      el.addEventListener("click", () => onSelect?.(spot));
      markersRef.current.push(marker);
    }

    // 全ピンが収まるように調整
    const bounds = new maplibregl.LngLatBounds();
    for (const spot of spots) bounds.extend([spot.lng, spot.lat]);
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 });
    }
  }, [spots, onSelect]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function buildPopupHtml(spot: Spot): string {
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const lines: string[] = [];
  lines.push(`<div class="font-bold text-base mb-1">${escapeHtml(spot.spot_name)}</div>`);
  if (spot.category) {
    lines.push(`<div class="text-xs text-gray-500 mb-1">${escapeHtml(spot.category)}</div>`);
  }
  if (spot.description) {
    lines.push(
      `<div class="text-sm mb-2 whitespace-pre-wrap">${escapeHtml(spot.description)}</div>`,
    );
  }
  if (spot.address) {
    lines.push(`<div class="text-xs text-gray-600 mb-1">${escapeHtml(spot.address)}</div>`);
  }
  if (spot.rating !== null) {
    lines.push(
      `<div class="text-xs text-amber-600">★ ${spot.rating}${spot.reviews_count !== null ? ` (${spot.reviews_count}件)` : ""}</div>`,
    );
  }
  if (spot.url_maps) {
    lines.push(
      `<div class="mt-2"><a href="${escapeHtml(spot.url_maps)}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 underline">Google マップで開く</a></div>`,
    );
  }
  return `<div class="text-sm leading-snug max-w-xs">${lines.join("")}</div>`;
}
