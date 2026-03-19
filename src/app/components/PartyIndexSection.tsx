import { useMemo, useState } from "react";
import { PriceChart } from "./PriceChart";
import { ChartSectionFooter } from "./ChartSectionFooter";
import { useBitcoinMarketChart } from "../hooks/useBitcoinData";
import type { MarketChartPoint } from "../api/bitcoinCharts";

const WINDOW = 7;

function computeVolatilityFromPrice(
  data: MarketChartPoint[],
): MarketChartPoint[] {
  if (data.length < WINDOW + 1) return [];
  const result: MarketChartPoint[] = [];
  for (let i = WINDOW; i < data.length; i++) {
    const windowPrices = data.slice(i - WINDOW, i + 1).map((p) => p.price);
    const returns: number[] = [];
    for (let j = 1; j < windowPrices.length; j++) {
      returns.push(
        (windowPrices[j]! - windowPrices[j - 1]!) / windowPrices[j - 1]!,
      );
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance) * 100;
    const volatility = Math.min(100, Math.max(0, stdDev * 10));
    result.push({
      timestamp: data[i]!.timestamp,
      price: Math.round(volatility * 10) / 10,
    });
  }
  return result;
}

export function PartyIndexSection() {
  const [timeframe, setTimeframe] = useState<"ALL" | "5Y" | "1Y" | "6M" | "1M">(
    "5Y",
  );
  const { data: priceData, loading: chartLoading } =
    useBitcoinMarketChart(timeframe);

  const volatilityData = useMemo(
    () => computeVolatilityFromPrice(priceData),
    [priceData],
  );

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-16 min-w-0">
      <h2 className="text-3xl sm:text-4xl text-foreground mb-6 sm:mb-8">
        Volatility
      </h2>

      <div className="space-y-4 min-w-0">
        <PriceChart
          data={volatilityData}
          timeframe={timeframe}
          loading={chartLoading}
          granularity={30}
          yAxisTickFormatter={(v) => `${v}%`}
          tooltipValueFormatter={(v) => `${v}%`}
          tooltipValueLabel="Volatility"
        />
        <ChartSectionFooter
          selected={timeframe}
          onChange={(tf) =>
            setTimeframe(tf as "ALL" | "5Y" | "1Y" | "6M" | "1M")
          }
          dataSource={{
            label: "Volatility derived from price data",
            url: "https://charts.bitcoin.com",
            displayName: "charts.bitcoin.com",
          }}
        />
      </div>
    </section>
  );
}
