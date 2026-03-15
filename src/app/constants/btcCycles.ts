export interface CyclePhase {
  startTs: number;
  endTs: number;
  type: "bull" | "bear";
}

function ts(year: number, month: number): number {
  return new Date(year, month - 1, 1).getTime();
}

export const BTC_CYCLE_PHASES: CyclePhase[] = [
  { startTs: ts(2009, 7), endTs: ts(2011, 6), type: "bull" },
  { startTs: ts(2011, 6), endTs: ts(2011, 12), type: "bear" },
  { startTs: ts(2011, 12), endTs: ts(2013, 11), type: "bull" },
  { startTs: ts(2013, 11), endTs: ts(2015, 1), type: "bear" },
  { startTs: ts(2015, 1), endTs: ts(2017, 12), type: "bull" },
  { startTs: ts(2017, 12), endTs: ts(2018, 12), type: "bear" },
  { startTs: ts(2018, 12), endTs: ts(2021, 11), type: "bull" },
  { startTs: ts(2021, 11), endTs: ts(2022, 11), type: "bear" },
  { startTs: ts(2022, 11), endTs: ts(2026, 6), type: "bull" },
];
