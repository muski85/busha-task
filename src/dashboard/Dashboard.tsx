import { useState } from 'react';
import '../dashboard/Dashboard.css';
import BalanceHeader from './BalanceHeader';
import ActionButtons from './ActionButtons';
import SegmentedControl from '../components/SegmentedControl';
import ChartPlaceholder from './ChartPlaceholder';
import AccountTable from './AccountTable';
import ConvertModal, { type ConvertMode } from '../convert/ConvertModal';
import TransactionList from './TransactionList';
import { useBalances } from '../hooks/useBalances';
import { useTransactions } from '../hooks/useTransactions';

const Dashboard = () => {
  // fetched once here and passed down, so the header and the table always
  // agree and we make a single request
  const { balances, loading, error, refresh } = useBalances();
  const txns = useTransactions();
  const [assetType, setAssetType] = useState<'Cash' | 'Crypto'>('Cash');
  // null = closed; { source } = open, source undefined means pick a default
  const [convert, setConvert] = useState<{ source?: string; mode?: ConvertMode } | null>(null);

  const visible = balances.filter((b) =>
    assetType === 'Cash' ? b.type === 'fiat' : b.type === 'crypto',
  );

  return (
    <div className="dashboard">
      <div className="dashboard-top">
        <div className="dashboard-header">
          <BalanceHeader balances={balances} loading={loading} />
          <ActionButtons onTrade={(mode) => setConvert({ mode })} />
        </div>
        <SegmentedControl options={['1D', '1W', '1M', '1y', 'All']} />
        <ChartPlaceholder />
      </div>
      <div className="dashboard-assets">
        <SegmentedControl
          options={['Cash', 'Crypto']}
          fullWidth
          onChange={(v) => setAssetType(v as 'Cash' | 'Crypto')}
        />
        <AccountTable
          balances={visible}
          loading={loading}
          error={error}
          onRetry={refresh}
          onConvert={(source) => setConvert({ source, mode: 'convert' })}
        />
      </div>

      <div className="dashboard-history">
        <h2 className="section-title">Recent transactions</h2>
        <TransactionList
          transactions={txns.transactions}
          loading={txns.loading}
          error={txns.error}
          onRetry={txns.refresh}
        />
      </div>

      {convert && (
        <ConvertModal
          balances={balances}
          initialSource={convert.source}
          mode={convert.mode}
          onClose={() => setConvert(null)}
          // a settled conversion changes two balances, so pull them again
          onSettled={() => {
            void refresh();
            void txns.refresh();
          }}
        />
      )}
    </div>
  );
};
export default Dashboard;
