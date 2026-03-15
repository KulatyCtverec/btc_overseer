import { createContext, useContext, useEffect, useState } from "react";
import { fetchBitcoinMarketChart } from "../api/bitcoinCharts";
import type { MarketChartPoint } from "../api/bitcoinCharts";
import {
  CHART_TIMEFRAMES,
  type BitcoinChartsTimeframe,
} from "../api/bitcoinCharts";

type ChartDataState = Partial<Record<BitcoinChartsTimeframe, MarketChartPoint[]>>;

interface ChartDataContextValue {
  data: ChartDataState;
  loading: boolean;
  error: string | null;
}

const ChartDataContext = createContext<ChartDataContextValue | null>(null);

export function ChartDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ChartDataState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      CHART_TIMEFRAMES.map(async (tf) => {
        const points = await fetchBitcoinMarketChart(tf);
        return [tf, points] as const;
      }),
    )
      .then((results) => {
        if (cancelled) return;
        const map = Object.fromEntries(results) as ChartDataState;
        setData(map);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ChartDataContext.Provider value={{ data, loading, error }}>
      {children}
    </ChartDataContext.Provider>
  );
}

export function useChartData() {
  const ctx = useContext(ChartDataContext);
  if (!ctx) throw new Error("useChartData must be used within ChartDataProvider");
  return ctx;
}
