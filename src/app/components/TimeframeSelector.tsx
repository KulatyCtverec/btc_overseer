import { CHART_TIMEFRAMES } from "../api/bitcoinCharts";

interface TimeframeSelectorProps {
  selected: string;
  onChange: (timeframe: string) => void;
}

export function TimeframeSelector({
  selected,
  onChange,
}: TimeframeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHART_TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-[box-shadow] duration-200 ${
            selected === tf
              ? "bg-[#e88510] bg-gradient-to-b from-[#F7931A] to-[#e88510] text-black shadow-[var(--shadow-depth-2)]"
              : "bg-surface-recessed text-muted-foreground hover:text-foreground hover:bg-surface-overlay hover:shadow-[var(--shadow-depth-2)]"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
