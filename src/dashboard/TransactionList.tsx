import './TransactionList.css';
import { formatAmount, type Transaction } from '../lib/busha';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const label: Record<string, string> = {
  buys: 'Convert',
  sells: 'Convert',
  deposits: 'Deposit',
  withdrawals: 'Withdrawal',
  sends: 'Send',
  receives: 'Receive',
};

function when(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TransactionList({
  transactions,
  loading,
  error,
  onRetry,
}: TransactionListProps) {
  if (loading) return <p className="table-state">Loading transactions…</p>;

  if (error)
    return (
      <p className="table-state table-state--error">
        {error}{' '}
        <button type="button" className="table-retry" onClick={onRetry}>
          Try again
        </button>
      </p>
    );

  if (transactions.length === 0)
    return <p className="table-state">No transactions yet.</p>;

  return (
    <ul className="txn-list">
      {transactions.map((txn) => (
        <li key={txn.id} className="txn">
          <div className="txn-main">
            <span className="txn-type">{label[txn.type] ?? txn.type}</span>
            <span className="txn-desc">
              {/* conversions describe both sides, everything else just one */}
              {txn.meta?.conversion
                ? `${formatAmount(
                    txn.meta.conversion.source_amount,
                    txn.meta.conversion.source_currency,
                  )} → ${formatAmount(
                    txn.meta.conversion.target_amount,
                    txn.meta.conversion.target_currency,
                  )}`
                : txn.description}
            </span>
          </div>

          <div className="txn-side">
            <span className={txn.is_credit ? 'txn-amount is-credit' : 'txn-amount'}>
              {txn.is_credit ? '+' : '−'}
              {formatAmount(txn.amount, txn.currency)}
            </span>
            <span className={`txn-status txn-status--${txn.status}`}>
              {txn.status}
            </span>
          </div>

          <time className="txn-date" dateTime={txn.created_at}>
            {when(txn.created_at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
