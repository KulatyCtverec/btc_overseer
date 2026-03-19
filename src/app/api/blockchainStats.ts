const BASE = import.meta.env.DEV
  ? "/api/blockchain-stats"
  : "https://api.blockchain.info";

const CACHE_TTL_MS = 60_000;
let cached: { totalMinedBtc: number; remainingBtc: number } | null = null;
let cacheExpiry = 0;

const BTC_MAX_SUPPLY = 21_000_000;
const SATOSHIS_PER_BTC = 100_000_000;

export interface BtcSupplyStats {
  totalMinedBtc: number;
  remainingBtc: number;
}

export async function fetchBtcSupplyStats(): Promise<BtcSupplyStats> {
  if (cached && Date.now() < cacheExpiry) return cached;

  // Use /q/totalbc - returns precise satoshis (stats endpoint rounds to whole BTC)
  const res = await fetch(`${BASE}/q/totalbc`);
  if (!res.ok) throw new Error("Failed to fetch Bitcoin supply stats");

  const text = await res.text();
  const totalMinedSatoshis = Number(text);
  if (!Number.isFinite(totalMinedSatoshis)) {
    throw new Error("Invalid Bitcoin supply data");
  }
  const totalMinedBtc = totalMinedSatoshis / SATOSHIS_PER_BTC;
  const remainingBtc = Math.max(0, BTC_MAX_SUPPLY - totalMinedBtc);

  cached = { totalMinedBtc, remainingBtc };
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cached;
}
