import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TimeframeSelector } from "./TimeframeSelector";
import { Skeleton } from "./Skeleton";
import { useBitcoinMarketChart } from "../hooks/useBitcoinData";
import type { MarketChartPoint } from "../api/bitcoinCharts";

const WINDOW = 7;

function computeVolatilityAndPrice(data: MarketChartPoint[]) {
  if (data.length < WINDOW + 1) return [];
  const result: { date: string; volatility: number; price: number }[] = [];
  for (let i = WINDOW; i < data.length; i++) {
    const windowPrices = data.slice(i - WINDOW, i + 1).map((p) => p.price);
    const returns = [];
    for (let j = 1; j < windowPrices.length; j++) {
      returns.push(
        (windowPrices[j] - windowPrices[j - 1]) / windowPrices[j - 1]
      );
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance) * 100;
    const volatility = Math.min(100, Math.max(0, stdDev * 10));
    result.push({
      date: new Date(data[i].timestamp).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      volatility: Math.round(volatility * 10) / 10,
      price: data[i].price,
    });
  }
  return result;
}

export function PartyIndexSection() {
  const [timeframe, setTimeframe] = useState<"ALL" | "5Y" | "1Y" | "6M" | "1M">("5Y");
  const { data: chartData, loading } = useBitcoinMarketChart(timeframe);
  const data = computeVolatilityAndPrice(chartData);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16">
      <h2 className="text-4xl text-white mb-8">Party Index</h2>

      <div className="bg-[#0f0f0f] rounded-2xl p-8 border border-[#1a1a1a] shadow-xl space-y-6">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-400">Low Volatility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-400">Medium Volatility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-400">High Volatility</span>
          </div>
        </div>

        {loading ? (
          <>
            <div className="flex gap-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <span className="text-gray-500">No data available</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="date"
                stroke="#4a4a4a"
                tick={{ fill: "#6a6a6a", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                stroke="#4a4a4a"
                tick={{ fill: "#6a6a6a" }}
                label={{
                  value: "Volatility",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6a6a6a",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#4a4a4a"
                tick={{ fill: "#6a6a6a" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1a1a1a",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [
                  name === "volatility"
                    ? `${Number(value ?? 0)}%`
                    : new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(Number(value ?? 0)),
                  name === "volatility" ? "Volatility" : "Price",
                ]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="volatility"
                stroke="#F7931A"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <TimeframeSelector
          selected={timeframe}
          onChange={(tf) => setTimeframe(tf as "ALL" | "5Y" | "1Y" | "6M" | "1M")}
        />
      </div>
    </section>
  );
}
