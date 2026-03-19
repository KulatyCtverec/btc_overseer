import { useId } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import type { MarketChartPoint } from "../api/bitcoinCharts";
import type { CyclePhase } from "../constants/btcCycles";
import { Skeleton } from "./Skeleton";

function fngToColor(value: number): string {
  const t = value / 100;
  const r = Math.round(239 + (34 - 239) * t);
  const g = Math.round(68 + (197 - 68) * t);
  const b = Math.round(68 + (94 - 68) * t);
  return `rgb(${r},${g},${b})`;
}

interface PriceChartProps {
  data: MarketChartPoint[];
  timeframe: string;
  loading?: boolean;
  fearGreedData?: Map<number, number>;
  cyclePhases?: CyclePhase[];
  /** When provided, overrides Y-axis tick format (e.g. for volatility %) */
  yAxisTickFormatter?: (value: number) => string;
  /** When provided, overrides tooltip value format */
  tooltipValueFormatter?: (value: number) => string;
  /** When provided, overrides tooltip value label */
  tooltipValueLabel?: string;
  /**
   * Max number of points to display. When set, data is downsampled evenly across the range.
   * Use for denser datasets (e.g. volatility) to improve readability.
   */
  granularity?: number;
}

function downsampleToGranularity<T>(data: T[], n: number): T[] {
  if (data.length <= n || n <= 1) return data;
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor((i / (n - 1)) * (data.length - 1));
    result.push(data[idx]!);
  }
  return result;
}

function formatTimestamp(ts: number, timeframe: string): string {
  const date = new Date(ts);
  if (timeframe === "1M")
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  if (timeframe === "1Y" || timeframe === "6M")
    return date.toLocaleDateString("en-US", { month: "short" });
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function PriceChart({
  data,
  timeframe,
  loading,
  fearGreedData,
  cyclePhases,
  yAxisTickFormatter,
  tooltipValueFormatter,
  tooltipValueLabel,
  granularity,
}: PriceChartProps) {
  const gradientId = useId();
  const hasFng = fearGreedData && fearGreedData.size > 0;

  let chartData = data.map(({ timestamp, price }) => {
    const fng = hasFng ? fearGreedData!.get(timestamp) : undefined;
    return {
      timestamp,
      price,
      dateLabel: formatTimestamp(timestamp, timeframe),
      fng,
    };
  });

  if (granularity != null && chartData.length > granularity) {
    chartData = downsampleToGranularity(chartData, granularity);
  }

  const chartWrapper =
    "bg-surface-elevated rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-depth-3)] bg-gradient-to-b from-surface-elevated to-surface-recessed min-h-[280px] sm:min-h-[348px] min-w-0 w-full";

  if (loading) {
    return (
      <div className={chartWrapper}>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className={`${chartWrapper} flex items-center justify-center`}>
        <span className="text-muted-foreground">No data available</span>
      </div>
    );
  }

  const safeGradientId = gradientId.replace(/:/g, "-");
  const lineStroke = hasFng ? `url(#${safeGradientId})` : "#F7931A";

  return (
    <div className={chartWrapper}>
      <div className="w-full" style={{ height: 300, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <defs>
              {hasFng && (
                <linearGradient id={safeGradientId} x1="0" y1="0" x2="1" y2="0">
                  {chartData.map((point, i) => (
                    <stop
                      key={i}
                      offset={`${(i / Math.max(1, chartData.length - 1)) * 100}%`}
                      stopColor={fngToColor(point.fng ?? 50)}
                    />
                  ))}
                </linearGradient>
              )}
            </defs>
            {(() => {
              if (!cyclePhases?.length || !chartData.length) return null;
              const sorted = [...chartData].sort(
                (a, b) => (a.timestamp as number) - (b.timestamp as number),
              );
              const dataMin = sorted[0]!.timestamp as number;
              const dataMax = sorted[sorted.length - 1]!.timestamp as number;
              const coverPhases: {
                startTs: number;
                endTs: number;
                type: "bull" | "bear";
              }[] = [];
              const firstPhaseStart = cyclePhases[0]!.startTs;
              const lastPhaseEnd = cyclePhases[cyclePhases.length - 1]!.endTs;
              if (dataMin < firstPhaseStart) {
                coverPhases.push({
                  startTs: dataMin,
                  endTs: Math.min(firstPhaseStart, dataMax),
                  type: "bull",
                });
              }
              for (const phase of cyclePhases) {
                const start = Math.max(phase.startTs, dataMin);
                const end = Math.min(phase.endTs, dataMax);
                if (start < end) {
                  coverPhases.push({
                    startTs: start,
                    endTs: end,
                    type: phase.type,
                  });
                }
              }
              if (dataMax > lastPhaseEnd) {
                const start = Math.max(lastPhaseEnd, dataMin);
                if (start < dataMax) {
                  coverPhases.push({
                    startTs: start,
                    endTs: dataMax,
                    type: "bull",
                  });
                }
              }
              return coverPhases.map((phase, i) => (
                <ReferenceArea
                  key={i}
                  x1={phase.startTs}
                  x2={phase.endTs}
                  fill={phase.type === "bull" ? "#22c55e" : "#ef4444"}
                  fillOpacity={0.2}
                  stroke="none"
                  ifOverflow="visible"
                  className="cycle-phase-area"
                />
              ));
            })()}
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              stroke="#4a4a4a"
              tick={{ fill: "#6a6a6a", fontSize: 12 }}
              tickFormatter={(ts) => formatTimestamp(ts, timeframe)}
            />
            <YAxis
              stroke="#4a4a4a"
              tick={{ fill: "#6a6a6a" }}
              tickFormatter={
                yAxisTickFormatter ??
                ((value) => `$${(value / 1000).toFixed(0)}k`)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-elevated)",
                boxShadow: "var(--shadow-depth-2)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#6a6a6a" }}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.dateLabel ?? ""
              }
              formatter={(value) => [
                tooltipValueFormatter
                  ? tooltipValueFormatter(Number(value ?? 0))
                  : new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Number(value ?? 0)),
                tooltipValueLabel ?? "Price",
              ]}
            />
            {hasFng && (
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                content={() => (
                  <div className="grid grid-cols-[auto_1fr] items-center gap-x-1.5 gap-y-2 pl-6">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    />
                    <span className="text-xs text-muted-foreground">Greed</span>
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: "#ef4444" }}
                    />
                    <span className="text-xs text-muted-foreground">Fear</span>
                  </div>
                )}
              />
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineStroke}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
