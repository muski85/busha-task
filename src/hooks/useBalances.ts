import { useCallback, useEffect, useState } from 'react';
import { getBalances, BushaError, type Balance } from '../lib/busha';

interface State {
  balances: Balance[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads every balance once on mount. `refresh` is exposed rather than polling
 * because balances only change after a transfer settles, and the convert flow
 * knows exactly when that happened.
 */
export function useBalances() {
  const [state, setState] = useState<State>({
    balances: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const balances = await getBalances();
      setState({ balances, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof BushaError ? err.message : 'Could not load balances';
      setState({ balances: [], loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refresh: load };
}
