import { useState } from 'react';
import './AccountTable.css';
import { accounts } from '../data/account';
import AccountRow from './AccountRow';

export default function AccountTable() {
  const [openId, setOpenId] = useState<string | null>(null);
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
        {accounts.map((acc) => (
          <AccountRow
            key={acc.code}
            account={acc}
            isOpen={openId === acc.code}
            onToggle={() => setOpenId((cur) => (cur === acc.code ? null : acc.code))}
            onClose={() => setOpenId(null)}
          />
        ))}
      </tbody>
    </table>
  );
}