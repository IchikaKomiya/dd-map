import Papa from "papaparse";

// dd-map-gas が GitHub にpushする data.csv の型
export interface Spot {
  id: string;
  spot_name: string;
  category: string;
  types: string;
  address: string;
  tel: string;
  opening_hours: string;
  url_official: string;
  url_maps: string;
  lat: number;
  lng: number;
  plus_code: string;
  description: string;
  rating: number | null;
  reviews_count: number | null;
  confirmed_at: string;
  notes: string;
}

const NUMERIC_FIELDS = new Set(["lat", "lng", "rating", "reviews_count"]);

function dataCsvUrl(): string {
  const url = process.env.NEXT_PUBLIC_DATA_CSV_URL;
  if (url) return url;
  // basePath を考慮した相対パス（GitHub Pages の同一リポジトリ配信想定）
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}/data.csv`;
}

export async function fetchSpots(): Promise<Spot[]> {
  const res = await fetch(dataCsvUrl(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`data.csv の取得に失敗しました: ${res.status}`);
  }
  const text = await res.text();
  return parseSpotsCsv(text);
}

export function parseSpotsCsv(text: string): Spot[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data
    .map((row) => normalizeRow(row))
    .filter((s): s is Spot => s !== null);
}

function normalizeRow(row: Record<string, string>): Spot | null {
  if (!row.id || !row.spot_name) return null;
  const lat = Number(row.lat);
  const lng = Number(row.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const spot: Spot = {
    id: row.id,
    spot_name: row.spot_name,
    category: row.category ?? "",
    types: row.types ?? "",
    address: row.address ?? "",
    tel: row.tel ?? "",
    opening_hours: row.opening_hours ?? "",
    url_official: row.url_official ?? "",
    url_maps: row.url_maps ?? "",
    lat,
    lng,
    plus_code: row.plus_code ?? "",
    description: row.description ?? "",
    rating: row.rating && row.rating !== "" ? Number(row.rating) : null,
    reviews_count:
      row.reviews_count && row.reviews_count !== "" ? Number(row.reviews_count) : null,
    confirmed_at: row.confirmed_at ?? "",
    notes: row.notes ?? "",
  };
  // 型ガード（NaN混入防止）
  if (spot.rating !== null && !Number.isFinite(spot.rating)) spot.rating = null;
  if (spot.reviews_count !== null && !Number.isFinite(spot.reviews_count))
    spot.reviews_count = null;
  return spot;
}

// 検索フィルタ
export function filterSpots(
  spots: Spot[],
  opts: { keyword?: string; categories?: string[] },
): Spot[] {
  const kw = opts.keyword?.trim().toLowerCase();
  const cats = opts.categories?.length ? new Set(opts.categories) : null;
  return spots.filter((s) => {
    if (kw) {
      const hay =
        `${s.spot_name} ${s.address} ${s.description} ${s.notes} ${s.category} ${s.types}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    if (cats && !cats.has(s.category)) return false;
    return true;
  });
}

// データから出現するカテゴリ一覧
export function listCategories(spots: Spot[]): string[] {
  const set = new Set<string>();
  for (const s of spots) {
    if (s.category) set.add(s.category);
  }
  return Array.from(set).sort();
}

// silence unused import warning helper (numeric fields meta used in tests later)
export const _META = { NUMERIC_FIELDS };
