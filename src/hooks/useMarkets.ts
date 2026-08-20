import { useCallback, useEffect, useState } from 'react';
import { getPairs, BushaError, type Pair } from '../lib/busha';

interface State {
  pairs: Pair[];
  loading: boolean;
  error: string | null;
}

/** Tradable markets priced in `currency`, for the buy and sell pickers. */
export function useMarkets(currency: string, enabled = true) {
  const [state, setState] = useState<State>({
    pairs: [],
    loading: enabled,
    error: null,
  });

  const load = useCallback(async () => {
    if (!enabled) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const pairs = await getPairs(currency);
      setState({ pairs, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof BushaError ? err.message : 'Could not load markets';
      setState({ pairs: [], loading: false, error: message });
    }
  }, [currency, enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refresh: load };
}
