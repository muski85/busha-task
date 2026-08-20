import { useState } from 'react';
import './AccountTable.css';
import type { Balance } from '../lib/busha';
import AccountRow from './AccountRow';

interface AccountTableProps {
  balances: Balance[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onConvert: (currency: string) => void;
}

export default function AccountTable({
  balances,
  loading,
  error,
  onRetry,
  onConvert,
}: AccountTableProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (loading) return <p className="table-state">Loading balances…</p>;

  if (error)
    return (
      <p className="table-state table-state--error">
        {error}{' '}
        <button type="button" className="table-retry" onClick={onRetry}>
          Try again
        </button>
      </p>
    );

  if (balances.length === 0)
    return <p className="table-state">No accounts to show.</p>;

  return (
    <table className="account-table">
      <colgroup>
        <col className="col-account" />
        <col className="col-balance" />
        <col className="col-value" />
        <col className="col-menu" />
      </colgroup>
      <thead>
        <tr>
          <th>
            <span className="th-desktop">Account</span>
            <span className="th-mobile">Name</span>
          </th>
          <th className="th-balance">Balance</th>
          <th className="cell-value">Value</th>
          <th aria-label="Actions" className="account-menu-cell" />
        </tr>
      </thead>
      <tbody>
        {balances.map((bal) => (
          <AccountRow
            key={bal.id}
            balance={bal}
            isOpen={openId === bal.id}
            onToggle={() => setOpenId((cur) => (cur === bal.id ? null : bal.id))}
            onClose={() => setOpenId(null)}
            onConvert={onConvert}
          />
        ))}
      </tbody>
    </table>
  );
}
