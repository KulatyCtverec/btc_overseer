import { CHART_TIMEFRAMES } from "../api/bitcoinCharts";

interface TimeframeSelectorProps {
  selected: string;
  onChange: (timeframe: string) => void;
}

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHART_TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-all ${
            selected === tf
              ? 'bg-[#F7931A] text-black'
              : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#252525]'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
