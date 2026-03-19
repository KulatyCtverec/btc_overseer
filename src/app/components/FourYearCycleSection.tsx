import { PriceChart } from "./PriceChart";
import { ChartSectionFooter } from "./ChartSectionFooter";
import { useBitcoinMarketChart } from "../hooks/useBitcoinData";
import { BTC_CYCLE_PHASES } from "../constants/btcCycles";

export function FourYearCycleSection() {
  const { data: chartData, loading: chartLoading } =
    useBitcoinMarketChart("ALL");

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-16 min-w-0">
      <h2 className="text-3xl sm:text-4xl text-foreground mb-6 sm:mb-8">
        Bitcoin&apos;s Four Year Cycles
      </h2>

      <div className="space-y-4 min-w-0">
        <PriceChart
          data={chartData}
          timeframe="ALL"
          loading={chartLoading}
          cyclePhases={BTC_CYCLE_PHASES}
        />
        <ChartSectionFooter
          selected="ALL"
          onChange={() => {}}
          dataSource={{
            label: "Price data",
            url: "https://charts.bitcoin.com",
            displayName: "charts.bitcoin.com",
          }}
          hideTimeframeSelector
        />
      </div>
    </section>
  );
}
