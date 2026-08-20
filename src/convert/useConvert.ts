import { useCallback, useEffect, useState } from 'react';
import {
  BushaError,
  createConversionQuote,
  createTransfer,
  isFailed,
  msUntilExpiry,
  pollTransfer,
  type Quote,
  type Transfer,
} from '../lib/busha';

/**
 * form       - choosing currencies and amount
 * review     - a quote is held, rate locked, expiry running down
 * processing - transfer created, polling until it settles
 * done       - settled or failed, terminal either way
 */
export type ConvertStage = 'form' | 'review' | 'processing' | 'done';

export function useConvert(onSettled?: () => void) {
  const [stage, setStage] = useState<ConvertStage>('form');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (err: unknown, fallback: string) =>
    setError(err instanceof BushaError ? err.message : fallback);

  const requestQuote = useCallback(
    async (from: string, to: string, amount: string) => {
      setBusy(true);
      setError(null);
      try {
        const q = await createConversionQuote(from, to, amount);
        setQuote(q);
        setStage('review');
      } catch (err) {
        // the API reports minimums and insufficient funds here rather than at
        // transfer time, so this is where the user finds out
        fail(err, 'Could not get a quote');
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const confirm = useCallback(async () => {
    if (!quote) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createTransfer(quote.id);
      setTransfer(created);
      setStage('processing');

      // onUpdate lets the UI narrate pending -> funds_converted
      const settled = await pollTransfer(created.id, {}, setTransfer);
      setTransfer(settled);
      setStage('done');
      if (isFailed(settled)) setError('The conversion did not go through');
      else onSettled?.();
    } catch (err) {
      fail(err, 'Could not complete the conversion');
      setStage('done');
    } finally {
      setBusy(false);
    }
  }, [quote, onSettled]);

  const reset = useCallback(() => {
    setStage('form');
    setQuote(null);
    setTransfer(null);
    setError(null);
    setBusy(false);
  }, []);

  return { stage, quote, transfer, error, busy, requestQuote, confirm, reset };
}

/** Milliseconds left on a quote, re-rendered every second. */
export function useCountdown(quote: Quote | null): number {
  const [remaining, setRemaining] = useState(() =>
    quote ? msUntilExpiry(quote) : 0,
  );

  useEffect(() => {
    if (!quote?.expires_at) return;
    setRemaining(msUntilExpiry(quote));
    const id = setInterval(() => {
      const left = msUntilExpiry(quote);
      setRemaining(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [quote]);

  return remaining;
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
