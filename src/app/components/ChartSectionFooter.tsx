import { TimeframeSelector } from "./TimeframeSelector";

interface ChartSectionFooterProps {
  selected: string;
  onChange: (timeframe: string) => void;
  dataSource?: {
    label: string;
    url: string;
    displayName: string;
  };
  hideTimeframeSelector?: boolean;
}

export function ChartSectionFooter({
  selected,
  onChange,
  dataSource,
  hideTimeframeSelector,
}: ChartSectionFooterProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 sm:gap-4 min-w-0 ${
        hideTimeframeSelector ? "justify-end" : "justify-between"
      }`}
    >
      {!hideTimeframeSelector && (
        <TimeframeSelector selected={selected} onChange={onChange} />
      )}
      {dataSource && (
        <p className="text-xs text-gray-500 min-w-0 break-words">
          {dataSource.label} from{" "}
          <a
            href={dataSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300"
          >
            {dataSource.displayName}
          </a>
        </p>
      )}
    </div>
  );
}
