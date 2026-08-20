import { useCallback, useEffect, useState } from 'react';
import { getTransactions, BushaError, type Transaction } from '../lib/busha';

interface State {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

/**
 * A conversion writes two rows sharing one reference: the debit leg and the
 * credit leg. Showing both makes a single convert look like two events, so
 * legs are collapsed to the credit side, which is the one describing what the
 * user received.
 */
function collapseLegs(rows: Transaction[]): Transaction[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row.meta?.conversion) return true;
    if (seen.has(row.reference)) return false;
    if (!row.is_credit) return false;
    seen.add(row.reference);
    return true;
  });
}

export function useTransactions(limit = 20) {
  const [state, setState] = useState<State>({
    transactions: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const rows = await getTransactions(limit);
      setState({ transactions: collapseLegs(rows), loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof BushaError ? err.message : 'Could not load transactions';
      setState({ transactions: [], loading: false, error: message });
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refresh: load };
}
