import { useState } from 'react';
import './DepositModal.css';
import CoinIcon from '../components/CoinIcon';
import { formatAmount, type Balance } from '../lib/busha';
import { useDeposit } from './useDeposit';

interface DepositModalProps {
  balances: Balance[];
  initialCurrency?: string;
  onClose: () => void;
  onSettled: () => void;
}

export default function DepositModal({
  balances,
  initialCurrency,
  onClose,
  onSettled,
}: DepositModalProps) {
  const { stage, quote, transfer, error, busy, requestQuote, confirm, reset } =
    useDeposit(onSettled);

  // bank transfer only funds fiat accounts
  const fiat = balances.filter((b) => b.type === 'fiat');
  const [currency, setCurrency] = useState(
    initialCurrency ?? fiat.find((b) => b.currency === 'NGN')?.currency ?? fiat[0]?.currency ?? 'NGN',
  );
  const [amount, setAmount] = useState('');

  const bank = transfer?.pay_in?.recipient_details;
  const canQuote = Number(amount) > 0 && !busy;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="convert"
        role="dialog"
        aria-label="Deposit"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="convert-head">
          <h2>Deposit</h2>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </header>

        {stage === 'form' && (
          <div className="convert-body">
            <label className="field">
              <span>Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {fiat.map((b) => (
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
              <small>You will be given an account to pay into</small>
            </label>

            {error && <p className="convert-error">{error}</p>}

            <button
              type="button"
              className="convert-cta"
              disabled={!canQuote}
              onClick={() => requestQuote(currency, amount)}
            >
              {busy ? 'Checking…' : 'Continue'}
            </button>
          </div>
        )}

        {stage === 'review' && quote && (
          <div className="convert-body">
            <dl className="quote-lines">
              <div>
                <dt>You pay</dt>
                {/* the quote decides this: some currencies add the fee on top
                    of the amount typed, others take it out */}
                <dd>{formatAmount(quote.source_amount, quote.source_currency)}</dd>
              </div>
              {quote.fees.map((fee) => (
                <div key={fee.name}>
                  <dt>{fee.name}</dt>
                  <dd>{formatAmount(fee.amount.amount, fee.amount.currency)}</dd>
                </div>
              ))}
              <div className="quote-total">
                <dt>Credited to your balance</dt>
                <dd>{formatAmount(quote.target_amount, quote.target_currency)}</dd>
              </div>
            </dl>

            {error && <p className="convert-error">{error}</p>}

            <div className="convert-actions">
              <button type="button" className="convert-secondary" onClick={reset}>
                Back
              </button>
              <button
                type="button"
                className="convert-cta"
                disabled={busy}
                onClick={confirm}
              >
                {busy ? 'Creating…' : 'Get account details'}
              </button>
            </div>
          </div>
        )}

        {stage === 'awaiting' && (
          <div className="convert-body">
            <p className="deposit-lead">
              Transfer{' '}
              <strong>
                {transfer
                  ? formatAmount(transfer.source_amount, transfer.source_currency)
                  : ''}
              </strong>{' '}
              to this account
            </p>

            {bank ? (
              <dl className="bank">
                <div>
                  <dt>Bank</dt>
                  <dd>{bank.bank_name}</dd>
                </div>
                <div>
                  <dt>Account number</dt>
                  <dd className="bank-number">{bank.account_number}</dd>
                </div>
                <div>
                  <dt>Account name</dt>
                  <dd>{bank.account_name}</dd>
                </div>
              </dl>
            ) : (
              <p className="table-state">Issuing account details…</p>
            )}

            <div className="deposit-waiting">
              <span className="spinner" aria-hidden="true" />
              <span>
                Waiting for payment · {transfer?.status.replace(/_/g, ' ')}
              </span>
            </div>

            <button type="button" className="convert-secondary" onClick={onClose}>
              I will pay later
            </button>
          </div>
        )}

        {stage === 'done' && (
          <div className="convert-body convert-centre">
            {!error && <CoinIcon code={transfer?.target_currency ?? currency} size={40} />}
            <p className={error ? 'convert-error' : 'convert-done'}>
              {error ?? 'Deposit received'}
            </p>
            {!error && transfer && (
              <p className="convert-summary">
                {formatAmount(transfer.target_amount, transfer.target_currency)}{' '}
                added to your balance
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
