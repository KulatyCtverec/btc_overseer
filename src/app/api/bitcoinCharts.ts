const BASE =
  import.meta.env.DEV
    ? "/api/bitcoin-charts"
    : "https://charts.bitcoin.com/api/v1";

export const CHART_TIMEFRAMES = ["ALL", "5Y", "1Y", "6M", "1M"] as const;
export type BitcoinChartsTimeframe = (typeof CHART_TIMEFRAMES)[number];

const TIMESPAN_MAP: Record<BitcoinChartsTimeframe, string> = {
  ALL: "all",
  "5Y": "all",
  "1Y": "all",
  "6M": "1y",
  "1M": "30d",
};

export interface MarketChartPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { data: MarketChartPoint[]; expires: number }>();

function getCached(key: string): MarketChartPoint[] | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) return null;
  return entry.data;
}

function setCache(key: string, data: MarketChartPoint[]) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

async function fetchFromBitcoinCom(
  timespan: string,
  limit: number,
  interval: "hourly" | "daily" = "daily",
): Promise<MarketChartPoint[]> {
  const url = `${BASE}/charts/rainbow?interval=${interval}&timespan=${timespan}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch chart from Bitcoin.com");
  const json = (await res.json()) as {
    data?: { price?: Array<{ timestamp: number; price: number }> };
  };
  const priceData = json.data?.price ?? [];
  return priceData.map((p) => ({
    timestamp: p.timestamp,
    price: p.price,
    volume: 0,
  }));
}

const MS_PER_DAY = 86400 * 1000;

function sliceByTimeRange(
  data: MarketChartPoint[],
  timeframe: BitcoinChartsTimeframe,
): MarketChartPoint[] {
  const now = Date.now();
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);

  if (timeframe === "ALL") return sorted;
  if (timeframe === "5Y") {
    const cutoff = now - 5 * 365 * MS_PER_DAY;
    return sorted.filter((p) => p.timestamp >= cutoff);
  }
  if (timeframe === "1Y") {
    const cutoff = now - 365 * MS_PER_DAY;
    return sorted.filter((p) => p.timestamp >= cutoff);
  }
  if (timeframe === "6M") {
    const cutoff = now - 180 * MS_PER_DAY;
    return sorted.filter((p) => p.timestamp >= cutoff);
  }
  if (timeframe === "1M") {
    const cutoff = now - 31 * MS_PER_DAY;
    return sorted.filter((p) => p.timestamp >= cutoff);
  }
  return sorted;
}

export async function fetchBitcoinMarketChart(
  timeframe: BitcoinChartsTimeframe,
): Promise<MarketChartPoint[]> {
  const timespan = TIMESPAN_MAP[timeframe];
  const limit =
    timeframe === "1M"
      ? 750
      : timeframe === "6M"
        ? 200
        : timeframe === "1Y"
          ? 400
          : timeframe === "ALL"
            ? 6000
            : 2500;
  const cacheKey = `bitcoin-charts-${timeframe}`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  const interval = timeframe === "1M" ? "hourly" : "daily";
  const data = await fetchFromBitcoinCom(timespan, limit, interval);
  const sliced = sliceByTimeRange(data, timeframe);
  setCache(cacheKey, sliced);
  return sliced;
}
