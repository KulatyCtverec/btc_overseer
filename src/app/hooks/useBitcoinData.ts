import { useChartData } from "../context/ChartDataContext";

const LAST_HALVING = new Date("2024-04-19").getTime();

export function daysSinceHalving(): number {
  return Math.floor((Date.now() - LAST_HALVING) / (1000 * 60 * 60 * 24));
}

export function useBitcoinMarketChart(
  timeframe: import("../api/bitcoinCharts").BitcoinChartsTimeframe
) {
  const { data: dataByTimeframe, loading, error } = useChartData();
  const data = dataByTimeframe[timeframe] ?? [];
  return { data, loading, error };
}

interface BitcoinPriceSummary {
  currentPrice: number;
  priceChangePercentage24h: number | null;
  ath: number;
}

export function useBitcoinPriceFromCharts(): {
  data: BitcoinPriceSummary | null;
  loading: boolean;
  error: string | null;
} {
  const { data: dataByTimeframe, loading, error } = useChartData();
  const shortData = dataByTimeframe["1M"] ?? dataByTimeframe["5Y"] ?? [];
  const allData = dataByTimeframe["ALL"] ?? dataByTimeframe["5Y"] ?? shortData;

  const data: BitcoinPriceSummary | null =
    shortData.length > 0
      ? (() => {
          const sorted = [...shortData].sort((a, b) => a.timestamp - b.timestamp);
          const last = sorted[sorted.length - 1]!;
          const prev = sorted.length >= 2 ? sorted[sorted.length - 2]! : null;
          const ath = Math.max(...allData.map((p) => p.price));
          const priceChangePercentage24h =
            prev && prev.price > 0
              ? ((last.price - prev.price) / prev.price) * 100
              : null;
          return {
            currentPrice: last.price,
            priceChangePercentage24h,
            ath,
          };
        })()
      : null;

  return { data, loading, error };
}
