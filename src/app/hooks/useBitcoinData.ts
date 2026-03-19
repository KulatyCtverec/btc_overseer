import { useEffect, useState } from "react";
import { useChartData } from "../context/ChartDataContext";
import { fetchBtcSupplyStats } from "../api/blockchainStats";

export function useBtcRemainingToMine(): {
  remainingBtc: number | null;
  loading: boolean;
  error: string | null;
} {
  const [remainingBtc, setRemainingBtc] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBtcSupplyStats()
      .then((stats) => {
        if (!cancelled) {
          setRemainingBtc(stats.remainingBtc);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { remainingBtc, loading, error };
}

export function useBitcoinMarketChart(
  timeframe: import("../api/bitcoinCharts").BitcoinChartsTimeframe,
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
          const sorted = [...shortData].sort(
            (a, b) => a.timestamp - b.timestamp,
          );
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
