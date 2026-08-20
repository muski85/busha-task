import { useCallback, useState } from 'react';
import {
  BushaError,
  createDepositQuote,
  createTransfer,
  isFailed,
  pollTransfer,
  type Quote,
  type Transfer,
} from '../lib/busha';

/**
 * form     - choosing currency and amount
 * review   - quote held, fee and credited amount known
 * awaiting - transfer created, bank details issued, waiting on the payment
 * done     - funds received, or it failed
 */
export type DepositStage = 'form' | 'review' | 'awaiting' | 'done';

export function useDeposit(onSettled?: () => void) {
  const [stage, setStage] = useState<DepositStage>('form');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (err: unknown, fallback: string) =>
    setError(err instanceof BushaError ? err.message : fallback);

  const requestQuote = useCallback(async (currency: string, amount: string) => {
    setBusy(true);
    setError(null);
    try {
      const q = await createDepositQuote(currency, amount);
      setQuote(q);
      setStage('review');
    } catch (err) {
      // currencies without bank support are rejected here, with a message
      // worth showing verbatim
      fail(err, 'Could not get a deposit quote');
    } finally {
      setBusy(false);
    }
  }, []);

  const confirm = useCallback(async () => {
    if (!quote) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createTransfer(quote.id);
      setTransfer(created);
      setStage('awaiting');

      // the account details arrive with the transfer; in sandbox the payment
      // is simulated and settles on its own
      const settled = await pollTransfer(created.id, { timeoutMs: 120000 }, setTransfer);
      setTransfer(settled);
      setStage('done');
      if (isFailed(settled)) setError('The deposit did not go through');
      else onSettled?.();
    } catch (err) {
      fail(err, 'Could not start the deposit');
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
