import { useState, useEffect, useMemo } from "react";
import { PriceChart } from "./PriceChart";
import { ChartSectionFooter } from "./ChartSectionFooter";
import { useBitcoinMarketChart } from "../hooks/useBitcoinData";
import {
  fetchFearGreedHistory,
  mapFearGreedToPriceData,
} from "../api/fearGreed";

export function FearGreedSection() {
  const [timeframe, setTimeframe] = useState<"ALL" | "5Y" | "1Y" | "6M" | "1M">("5Y");
  const { data: chartData, loading: chartLoading } =
    useBitcoinMarketChart(timeframe);
  const [fngPoints, setFngPoints] = useState<
    { timestamp: number; value: number }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    fetchFearGreedHistory(0)
      .then((points) => {
        if (!cancelled) setFngPoints(points);
      })
      .catch(() => {
        if (!cancelled) setFngPoints([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fngMap = useMemo(() => {
    if (fngPoints.length === 0 || chartData.length === 0) return new Map();
    return mapFearGreedToPriceData(
      chartData.map((p) => p.timestamp),
      fngPoints,
    );
  }, [fngPoints, chartData]);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16">
      <h2 className="text-4xl text-white mb-8">Fear & Greed Sentiment</h2>

      <div className="space-y-4">
        <PriceChart
          data={chartData}
          timeframe={timeframe}
          loading={chartLoading}
          fearGreedData={fngMap.size > 0 ? fngMap : undefined}
        />
        <ChartSectionFooter
          selected={timeframe}
          onChange={(tf) => setTimeframe(tf as "ALL" | "5Y" | "1Y" | "6M" | "1M")}
          dataSource={{
            label: "Fear & Greed data",
            url: "https://alternative.me",
            displayName: "alternative.me",
          }}
        />
      </div>
    </section>
  );
}
