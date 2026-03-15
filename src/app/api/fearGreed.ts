const BASE = import.meta.env.DEV
  ? "/api/fear-greed"
  : "https://api.alternative.me";

export interface FearGreedPoint {
  timestamp: number;
  value: number;
  classification: string;
}

const CACHE_TTL_MS = 60_000;
let cached: FearGreedPoint[] | null = null;
let cacheExpiry = 0;

export async function fetchFearGreedHistory(
  limit = 0,
): Promise<FearGreedPoint[]> {
  if (cached && Date.now() < cacheExpiry) return cached;

  const url = `${BASE}/fng/?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Fear & Greed Index");

  const json = (await res.json()) as {
    data?: Array<{
      value: string;
      value_classification: string;
      timestamp: string;
    }>;
  };

  const points = (json.data ?? []).map((d) => ({
    timestamp: parseInt(d.timestamp, 10) * 1000,
    value: parseInt(d.value, 10),
    classification: d.value_classification,
  }));

  cached = points;
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return points;
}

export function mapFearGreedToPriceData(
  priceTimestamps: number[],
  fngPoints: Array<{ timestamp: number; value: number }>,
): Map<number, number> {
  const fngByDay = new Map<string, number>();
  for (const p of fngPoints) {
    const day = new Date(p.timestamp).toDateString();
    fngByDay.set(day, p.value);
  }

  const result = new Map<number, number>();
  for (const ts of priceTimestamps) {
    const day = new Date(ts).toDateString();
    const value = fngByDay.get(day);
    if (value !== undefined) result.set(ts, value);
    else {
      const closest = fngPoints.reduce((best, p) =>
        Math.abs(p.timestamp - ts) < Math.abs(best.timestamp - ts) ? p : best
      );
      result.set(ts, closest.value);
    }
  }
  return result;
}
