import type { Pair } from '../lib/busha';

export type PriceMap = Record<string, { amount: string; currency: string }>;

/**
 * Current price of one unit, keyed by currency code.
 *
 * The assets table shows this rather than the worth of a holding, matching the
 * product: a zero BTC balance still displays the BTC price.
 */
export function buildPrices(pairs: Pair[], quote: string): PriceMap {
  const prices: PriceMap = { [quote]: { amount: '1', currency: quote } };
  for (const pair of pairs) {
    if (pair.counter === quote) {
      prices[pair.base] = pair.buy_price;
    }
  }
  return prices;
}
