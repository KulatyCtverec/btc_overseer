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
}: PriceChartProps) {
  const gradientId = useId();
  const hasFng = fearGreedData && fearGreedData.size > 0;

  const chartData = data.map(({ timestamp, price }) => {
    const fng = hasFng ? fearGreedData!.get(timestamp) : undefined;
    return {
      timestamp,
      price,
      dateLabel: formatTimestamp(timestamp, timeframe),
      fng,
    };
  });

  const chartWrapper =
    "bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] shadow-xl min-h-[348px]";

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
        <span className="text-gray-500">No data available</span>
      </div>
    );
  }

  const safeGradientId = gradientId.replace(/:/g, "-");
  const lineStroke = hasFng ? `url(#${safeGradientId})` : "#F7931A";

  return (
    <div className={chartWrapper}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            {hasFng && (
              <linearGradient
                id={safeGradientId}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
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
              (a, b) => (a.timestamp as number) - (b.timestamp as number)
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
                coverPhases.push({ startTs: start, endTs: end, type: phase.type });
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f0f0f",
              border: "1px solid #1a1a1a",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#6a6a6a" }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.dateLabel ?? ""
            }
            formatter={(value) => [
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(Number(value ?? 0)),
              "Price",
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
                  <span className="text-xs text-gray-500">Greed</span>
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                  <span className="text-xs text-gray-500">Fear</span>
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
  );
}
