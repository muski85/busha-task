import { useMemo, useState } from 'react';
import './CoinPicker.css';
import CoinIcon from '../components/CoinIcon';
import { formatAmount, type Pair } from '../lib/busha';
import { useMarkets } from '../hooks/useMarkets';

interface CoinPickerProps {
  /** currency the prices are quoted in, ie what the user is spending */
  quoteCurrency: string;
  onPick: (pair: Pair) => void;
}

export default function CoinPicker({ quoteCurrency, onPick }: CoinPickerProps) {
  const { pairs, loading, error, refresh } = useMarkets(quoteCurrency);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const tradable = pairs.filter((p) => p.is_buy_supported);
    const q = query.trim().toLowerCase();
    if (!q) return tradable;
    return tradable.filter(
      (p) =>
        p.base.toLowerCase().includes(q) ||
        p.base_currency_name.toLowerCase().includes(q),
    );
  }, [pairs, query]);

  return (
    <div className="picker">
      <input
        className="picker-search"
        type="search"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search coins"
      />

      {loading && <p className="table-state">Loading markets…</p>}

      {error && (
        <p className="table-state table-state--error">
          {error}{' '}
          <button type="button" className="table-retry" onClick={refresh}>
            Try again
          </button>
        </p>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="table-state">No coins match “{query}”.</p>
      )}

      {!loading && !error && results.length > 0 && (
        <ul className="picker-list">
          {results.map((pair) => (
            <li key={pair.id}>
              <button
                type="button"
                className="picker-item"
                onClick={() => onPick(pair)}
              >
                <CoinIcon code={pair.base} size={32} />
                <span className="picker-text">
                  <span className="picker-code">{pair.base}</span>
                  <span className="picker-name">{pair.base_currency_name}</span>
                </span>
                <span className="picker-price">
                  {formatAmount(pair.buy_price.amount, pair.buy_price.currency)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
