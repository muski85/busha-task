import { useState } from 'react';
import './ConvertModal.css';
import {
  formatAmount,
  isQuoteExpired,
  type Balance,
} from '../lib/busha';
import { formatCountdown, useConvert, useCountdown } from './useConvert';

/**
 * Buy, sell and convert are the same quote -> transfer call underneath. Only
 * the currencies on offer differ, so mode filters the lists rather than
 * forking the flow.
 */
export type ConvertMode = 'buy' | 'sell' | 'convert';

const MODES: Record<ConvertMode, { title: string; from: Balance['type'] | null; to: Balance['type'] | null }> = {
  buy:     { title: 'Buy',     from: 'fiat',   to: 'crypto' },
  sell:    { title: 'Sell',    from: 'crypto', to: 'fiat'   },
  convert: { title: 'Convert', from: null,     to: null     },
};

interface ConvertModalProps {
  balances: Balance[];
  initialSource?: string;
  mode?: ConvertMode;
  onClose: () => void;
  onSettled: () => void;
}

export default function ConvertModal({
  balances,
  initialSource,
  mode = 'convert',
  onClose,
  onSettled,
}: ConvertModalProps) {
  const config = MODES[mode];
  const sources = config.from
    ? balances.filter((b) => b.type === config.from)
    : balances;
  const { stage, quote, transfer, error, busy, requestQuote, confirm, reset } =
    useConvert(onSettled);

  // opening on an empty balance is a dead end, so default to the account
  // holding the most value
  const funded = [...sources].sort(
    (a, b) => Number(b.total.fiat?.amount ?? 0) - Number(a.total.fiat?.amount ?? 0),
  );
  const defaultFrom = initialSource ?? funded[0]?.currency ?? 'NGN';

  const targets = balances.filter((b) =>
    config.to ? b.type === config.to : b.currency !== defaultFrom,
  );

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(targets[0]?.currency ?? 'USDT');
  const [amount, setAmount] = useState('');

  const source = balances.find((b) => b.currency === from);
  const available = source?.available.amount ?? '0';
  const remaining = useCountdown(quote);
  const expired = quote ? isQuoteExpired(quote) || remaining <= 0 : false;

  const canQuote = Number(amount) > 0 && from !== to && !busy;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="convert"
        role="dialog"
        aria-label={config.title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="convert-head">
          <h2>{config.title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </header>

        {stage === 'form' && (
          <div className="convert-body">
            <label className="field">
              <span>From</span>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {sources.map((b) => (
                  <option key={b.id} value={b.currency}>
                    {b.currency} — {formatAmount(b.available.amount, b.currency)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>To</span>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {targets
                  .filter((b) => b.currency !== from)
                  .map((b) => (
                    <option key={b.id} value={b.currency}>
                      {b.currency} — {b.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="field">
              <span>Amount</span>
              <input
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <small>Available {formatAmount(available, from)}</small>
            </label>

            {error && <p className="convert-error">{error}</p>}

            <button
              type="button"
              className="convert-cta"
              disabled={!canQuote}
              onClick={() => requestQuote(from, to, amount)}
            >
              {busy ? 'Getting rate…' : 'Get quote'}
            </button>
          </div>
        )}

        {stage === 'review' && quote && (
          <div className="convert-body">
            <div className="quote-rate">{quote.rate.rate_explained}</div>

            <dl className="quote-lines">
              <div>
                <dt>You send</dt>
                <dd>{formatAmount(quote.source_amount, quote.source_currency)}</dd>
              </div>
              <div>
                <dt>You receive</dt>
                <dd>{formatAmount(quote.target_amount, quote.target_currency)}</dd>
              </div>
              {/* conversions come back with no fees, so only render when present */}
              {quote.fees.map((fee) => (
                <div key={fee.name}>
                  <dt>{fee.name}</dt>
                  <dd>{formatAmount(fee.amount.amount, fee.amount.currency)}</dd>
                </div>
              ))}
            </dl>

            <p className={expired ? 'quote-expiry is-expired' : 'quote-expiry'}>
              {expired
                ? 'This rate has expired'
                : `Rate held for ${formatCountdown(remaining)}`}
            </p>

            {error && <p className="convert-error">{error}</p>}

            <div className="convert-actions">
              <button type="button" className="convert-secondary" onClick={reset}>
                Back
              </button>
              {expired ? (
                <button
                  type="button"
                  className="convert-cta"
                  onClick={() => requestQuote(from, to, amount)}
                >
                  Get a new rate
                </button>
              ) : (
                <button
                  type="button"
                  className="convert-cta"
                  disabled={busy}
                  onClick={confirm}
                >
                  {busy ? 'Confirming…' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <div className="convert-body convert-centre">
            <div className="spinner" aria-hidden="true" />
            <p className="convert-status">
              {transfer?.status === 'processing'
                ? 'Converting your funds…'
                : 'Submitting…'}
            </p>
            <small>{transfer?.status.replace(/_/g, ' ')}</small>
          </div>
        )}

        {stage === 'done' && (
          <div className="convert-body convert-centre">
            <p className={error ? 'convert-error' : 'convert-done'}>
              {error ?? `${config.title} complete`}
            </p>
            {!error && transfer && (
              <p className="convert-summary">
                {formatAmount(transfer.source_amount, transfer.source_currency)}
                {' → '}
                {formatAmount(transfer.target_amount, transfer.target_currency)}
              </p>
            )}
            <button type="button" className="convert-cta" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
