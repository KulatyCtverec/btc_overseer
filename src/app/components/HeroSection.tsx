import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PriceChart } from "./PriceChart";
import { ChartSectionFooter } from "./ChartSectionFooter";
import { AnimatedPrice } from "./AnimatedPrice";
import { Skeleton } from "./Skeleton";
import {
  useBitcoinPriceFromCharts,
  useBitcoinMarketChart,
  useBtcRemainingToMine,
} from "../hooks/useBitcoinData";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function HeroSection() {
  const [timeframe, setTimeframe] = useState<"ALL" | "5Y" | "1Y" | "6M" | "1M">(
    "5Y",
  );
  const { data, loading, error } = useBitcoinPriceFromCharts();
  const { data: chartData, loading: chartLoading } =
    useBitcoinMarketChart(timeframe);
  const {
    remainingBtc,
    loading: btcSupplyLoading,
    error: btcSupplyError,
  } = useBtcRemainingToMine();

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-16 min-w-0">
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start min-w-0">
        <div className="space-y-6 sm:space-y-8 min-w-0">
          <div className="min-w-0">
            <p className="text-muted-foreground mb-2">Bitcoin Price</p>
            {loading ? (
              <Skeleton className="h-14 sm:h-20 w-48 sm:w-64" />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : data ? (
              <h1 className="text-4xl sm:text-5xl lg:text-7xl text-foreground mb-4 sm:mb-6 tabular-nums min-w-0">
                <AnimatedPrice value={data.currentPrice} />
              </h1>
            ) : null}
          </div>

          {loading && (
            <div className="space-y-0 rounded-xl overflow-hidden bg-surface-recessed/50">
              <div className="flex items-center justify-between py-4 px-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex items-center justify-between py-4 px-4 bg-surface-recessed/30">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center justify-between py-4 px-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-0 rounded-xl overflow-hidden bg-surface-recessed/50 min-w-0">
              <div className="flex items-center justify-between gap-3 py-4 px-4 min-w-0">
                <span className="text-muted-foreground shrink-0">
                  24h Change
                </span>
                <span
                  className={`flex items-center gap-2 shrink-0 tabular-nums ${
                    data.priceChangePercentage24h != null
                      ? data.priceChangePercentage24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {data.priceChangePercentage24h != null ? (
                    <>
                      {data.priceChangePercentage24h >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {data.priceChangePercentage24h >= 0 ? "+" : ""}
                      {data.priceChangePercentage24h.toFixed(2)}%
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-4 px-4 bg-surface-recessed/30 min-w-0">
                <span className="text-muted-foreground shrink-0">
                  All-Time High
                </span>
                <span className="text-foreground tabular-nums truncate text-right">
                  {formatPrice(data.ath)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-4 px-4 min-w-0">
                <span className="text-muted-foreground shrink-0">
                  Bitcoin to be mined
                </span>
                <span className="text-[#F7931A] tabular-nums shrink-0">
                  {btcSupplyLoading ? (
                    <span className="text-muted-foreground">…</span>
                  ) : btcSupplyError ? (
                    "—"
                  ) : remainingBtc != null ? (
                    `${remainingBtc.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 })} BTC`
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 min-w-0">
          <PriceChart
            data={chartData}
            timeframe={timeframe}
            loading={chartLoading}
          />
          <ChartSectionFooter
            selected={timeframe}
            onChange={(tf) =>
              setTimeframe(tf as "ALL" | "5Y" | "1Y" | "6M" | "1M")
            }
            dataSource={{
              label: "Price data",
              url: "https://charts.bitcoin.com",
              displayName: "charts.bitcoin.com",
            }}
          />
        </div>
      </div>
    </section>
  );
}
